import stripe from "../config/stripe.js";
import UserModel from "../models/User.js";
import orderModel from "../models/OrderModel.js";
import Coupon from "../models/Coupon.js";

import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import cartModel from "../models/CartModel.js";

import ProductModel from "../models/ProductModel.js";
import WebsiteInfoModel from "../models/WebsiteInfoModel.js";
import sgMail from "../config/emailConfig.js";

// PayPal credentials
const { PAYPAL_CLIENT_ID, PAYPAL_SECRET } = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

// Function to send email
const sendEmail = (to, subject, text, html) => {
  return sgMail.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

const ordersController = new OrdersController(client);

function generateOrderEmailContent({
  websiteName,
  websiteUrl,
  fullName,
  email,
  phone,
  cart,
  address,
  city,
  state,
  zip,
  deliveryCharge = 0,
  subtotal = 0,
  totalDiscount = 0,
  totalAmount = 0,
  paymentMethod,
  orderIdFormatted,
  orderDate,
  couponCode = null,
  couponDiscountPercent = null,
  couponDiscountAmount = null,
}) {
  const textCustomer = `
${websiteName}

Order ID: ${orderIdFormatted}
Order Date: ${orderDate}
Customer Name: ${fullName}
Phone: ${phone}
Email: ${email}
Shipping Address: ${address}
Full Address: ${city}, ${state}, ${zip}.

Order Items:
${cart
  .map((item) => {
    const product = item.productId;
    return `- ${product.productName} (Qty: ${
      item.quantity
    }) - AU$ ${product.productPrice.toFixed(2)}`;
  })
  .join("\n")}

Subtotal: AU$ ${subtotal.toFixed(2)}
Discount: AU$ ${totalDiscount.toFixed(2)}
${
  couponCode
    ? `Coupon Code Used: ${couponCode} (${couponDiscountPercent}% off, -AU$ ${couponDiscountAmount})`
    : ""
}
Shipping Fee: AU$ ${deliveryCharge.toFixed(2)}
Total Payable: AU$ ${totalAmount.toFixed(2)}

Payment Method: ${paymentMethod}

Thank you for shopping with us!
Visit: ${websiteUrl}
`;

  const htmlCustomer = `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #007BFF;">${websiteName}</h2><br/>
  <p><strong>Order ID:</strong> ${orderIdFormatted}</p>
  <p><strong>Order Date:</strong> ${orderDate}</p>
  <p><strong>Customer Name:</strong> ${fullName}</p>
  <p><strong>Phone:</strong> ${phone}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Shipping Address:</strong> ${address}</p>
  <p><strong>Full Address:</strong> ${city}, ${state}, ${zip}</p>

  <h4>Order Items:</h4>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Discount</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Total(with discount)</th>
      </tr>
    </thead>
    <tbody>
      ${cart
        .map((item) => {
          const product = item.productId;
          const price = product.productPrice;
          const discount = product.discount || 0;
          const discountedPrice = price - (price * discount) / 100;
          const total = discountedPrice * item.quantity;

          return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; width: 240px">${
            product.productName
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            item.quantity
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px;">AU$ ${price.toFixed(
            2
          )}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            discount ? discount + "%" : "-"
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px;">AU$ ${total.toFixed(
            2
          )}</td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <p style="margin-top: 20px;"><strong>Subtotal:</strong> AU$ ${subtotal.toFixed(
    2
  )}</p>
  ${
    couponCode
      ? `<p><strong>Coupon Code Used:</strong> ${couponCode} (${couponDiscountPercent}% off, -AU$ ${couponDiscountAmount})</p>`
      : ""
  }
   <p><strong>Total Discount:</strong> AU$ ${totalDiscount.toFixed(2)}</p>
  <p><strong>Shipping Fee:</strong> AU$ ${deliveryCharge.toFixed(2)}</p>
  <p><strong>Total Payable:</strong> <strong>AU$ ${totalAmount.toFixed(
    2
  )}</strong></p>
  <p><strong>Payment Method:</strong> ${paymentMethod}</p>

  <p style="margin-top: 30px;">Thank you for shopping with us!</p>
  <p>Visit us at: <a href="https://${websiteUrl}" target="_blank">${websiteUrl}</a></p>
</div>
`;

  const textAdmin = textCustomer;
  const htmlAdmin = htmlCustomer;

  return { textCustomer, htmlCustomer, textAdmin, htmlAdmin };
}

const createOrder = async ({
  cart,
  address,
  zip,
  state,
  phone,
  paymentMethod,
  fullName,
  userId,
  email,
  city,
  couponCode,
}) => {
  try {
    if (!Array.isArray(cart)) {
      throw new Error("Cart should be an array");
    }

    // 1. Calculate subtotal from cart
    let subtotal = 0;
    cart.forEach((item) => {
      const product = item?.productId;
      const discountAmount = (product?.productPrice * product?.discount) / 100;
      const discountedPrice = product?.productPrice - discountAmount;
      subtotal += discountedPrice * item.quantity;
    });

    // 2. Apply valid coupon
    let couponDiscount = 0;
    let validCoupon = null;

    if (couponCode) {
      const now = new Date();
      const coupon = await Coupon.findOne({ code: couponCode });

      if (
        coupon &&
        coupon.active &&
        now >= coupon.startDate &&
        now <= coupon.expiresAt
      ) {
        const totalUses = coupon.usedBy.reduce(
          (sum, user) => sum + user.timesUsed,
          0
        );
        const userUsage = coupon.usedBy.find(
          (u) => u.userId.toString() === userId.toString()
        );

        if (
          (coupon.maxUses === null || totalUses < coupon.maxUses) &&
          (!userUsage || userUsage.timesUsed < coupon.maxUsesPerUser)
        ) {
          couponDiscount = (subtotal * coupon.discount) / 100;
          validCoupon = coupon;
        }
      }
    }

    // 3. Delivery
    const deliveryCharge = address?.DeliveryCharge || 0;

    // 4. Final total
    const totalAmount = subtotal - couponDiscount + deliveryCharge;

    // 5. PayPal request payload
    const collect = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "AUD",
              value: totalAmount.toFixed(2),
            },
            shipping: {
              address: {
                addressLine1: address.Address,
                adminArea2: city,
                adminArea1: state,
                postalCode: zip,
                shippingCharge: deliveryCharge,
                countryCode: "AU",
              },
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.ordersCreate(
      collect
    );

    const orderDetails = JSON.parse(body);
    return {
      jsonResponse: orderDetails,
      httpStatusCode: httpResponse.statusCode,
      subtotal,
      couponDiscount,
      deliveryCharge,
      couponCode: validCoupon?.code || null,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(
      error.message || "An error occurred while creating the order."
    );
  }
};

const captureOrder = async (
  orderID,
  cart,
  address,
  zip,
  state,
  phone,
  paymentMethod,
  fullName,
  email,
  city,
  userId,
  couponCode
) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  console.log("Coupon code received:", couponCode);

  if (!Array.isArray(cart)) {
    throw new Error("Cart should be an array");
  }

  let totalAmount = 0;
  let totalDiscount = 0;
  let couponDiscount = 0;
  let validCoupon = null;

  // Calculate subtotal and total product discount
  cart.forEach((item) => {
    const product = item?.productId;
    const discountAmount =
      (product.productPrice * (product.discount || 0)) / 100;
    const discountedPrice = product.productPrice - discountAmount;
    const itemTotal = discountedPrice * item.quantity;

    totalDiscount += discountAmount * item.quantity;
    totalAmount += itemTotal;
  });

  const subtotal = totalAmount;

  // Try to fetch and apply coupon (optional)
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (coupon) {
      couponDiscount = (subtotal * coupon.discount) / 100;
      validCoupon = coupon;
    } else {
      console.warn("Coupon not found or invalid:", couponCode);
    }
  }

  const deliveryCharge = address?.DeliveryCharge || 0;
  totalAmount = subtotal - couponDiscount + deliveryCharge;

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(
      collect
    );
    const orderDetails = JSON.parse(body);

    if (!orderDetails?.id || orderDetails.status !== "COMPLETED") {
      throw new Error("Payment not completed or invalid PayPal response");
    }

    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const siteInfo = await WebsiteInfoModel.findOne();
    const websiteName = siteInfo?.websiteName;
    const websiteUrl = process.env.FRONTEND_HOST;

    const newOrder = new orderModel({
      productDetails: cart,
      UserDetails: {
        userId,
        name: fullName,
        email,
        phoneNumber: phone,
      },
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingAddress: {
        addressLine1: address.Address,
        city,
        state,
        postalCode: zip,
        shippingCharge: deliveryCharge,
        countryCode: "AU",
      },
      couponDetails: validCoupon
        ? {
            code: validCoupon.code,
            discount: validCoupon.discount,
            discountAmount: Number(couponDiscount.toFixed(2)),
          }
        : {
            code: null,
            discount: 0,
            discountAmount: 0,
          },
      paymentDetails: {
        paymentId: orderDetails.id,
        payment_method_type: paymentMethod,
        payment_status: orderDetails.status,
      },
    });

    const saveOrder = await newOrder.save();
    console.log("Order saved:", saveOrder);

    // Send confirmation emails
    const { textCustomer, htmlCustomer, textAdmin, htmlAdmin } =
      generateOrderEmailContent({
        websiteName,
        websiteUrl,
        fullName,
        email,
        phone,
        cart,
        address: address.Address,
        city,
        state,
        zip,
        deliveryCharge,
        subtotal,
        totalDiscount: totalDiscount + couponDiscount,
        totalAmount,
        paymentMethod,
        orderIdFormatted: saveOrder._id,
        orderDate,
        couponCode: validCoupon?.code || null,
        couponDiscountPercent: validCoupon?.discount || null,
        couponDiscountAmount: couponDiscount ? couponDiscount.toFixed(2) : null,
      });

    await sendEmail(email, "Order Confirmation", textCustomer, htmlCustomer);
    await sendEmail(
      process.env.EMAIL_FROM,
      "New Order Received",
      textAdmin,
      htmlAdmin
    );

    await cartModel.deleteMany({ userId });

    // Update product stock
    for (const item of cart) {
      const productInDb = await ProductModel.findById(item.productId._id);
      if (productInDb && productInDb.productTotalStockQty >= item.quantity) {
        productInDb.productTotalStockQty -= item.quantity;
        await productInDb.save();
      } else {
        throw new Error(`Not enough stock for ${item.productId.productName}`);
      }
    }

    // Track coupon usage
    if (validCoupon) {
      const usage = validCoupon.usedBy.find(
        (u) => u.userId.toString() === userId.toString()
      );
      if (usage) {
        usage.timesUsed += 1;
      } else {
        validCoupon.usedBy.push({ userId, timesUsed: 1 });
      }
      await validCoupon.save();
    }

    return {
      jsonResponse: orderDetails,
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    console.error("Error during capture:", error.message);
    throw new Error("Failed to capture the order.");
  }
};

class orderController {
  static addOrderStripe = async (request, response) => {
    try {
      const {
        cart,
        address,
        zip,
        state,
        phone,
        paymentMethod,
        fullName,
        email,
        city,
        couponCode,
      } = request.body;

      const { user } = request;
      const userData = await UserModel.findById(user._id);
      if (!cart?.length) {
        return response
          .status(400)
          .json({ message: "Invalid cart", error: true });
      }

      const deliveryCharge = address?.DeliveryCharge;
      if (!deliveryCharge) {
        return response
          .status(400)
          .json({ message: "Missing delivery charge", error: true });
      }

      // Fetch product data
      const populatedCart = await Promise.all(
        cart.map(async (item) => {
          const product = await ProductModel.findById(item.productId);
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          return { ...item, product };
        })
      );

      let subtotal = 0;
      const lineItems = populatedCart.map((item) => {
        const { product } = item;
        const discountAmount =
          (product.productPrice * (product.discount || 0)) / 100;
        const priceAfterDiscount = product.productPrice - discountAmount;

        subtotal += priceAfterDiscount * item.quantity;

        return {
          price_data: {
            currency: "aud",
            product_data: {
              name: product.productName,
              images: product.productImageUrls,
              metadata: { productId: product._id.toString() },
            },
            unit_amount: Math.round(priceAfterDiscount * 100),
          },
          quantity: item.quantity,
        };
      });

      // Handle coupon
      let couponDiscount = 0,
        discount = 0,
        stripePromotionCodeId = null;
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
          discount = coupon.discount;
          couponDiscount = (subtotal * discount) / 100;

          const stripeCoupon = await stripe.coupons.create({
            percent_off: discount,
            duration: "once",
            name: `Code: ${coupon.code}`,
          });

          const uniqueCode = `${coupon.code}-${Date.now()}`;
          const stripePromo = await stripe.promotionCodes.create({
            coupon: stripeCoupon.id,
            code: uniqueCode,
          });

          stripePromotionCodeId = stripePromo.id;
        }
      }

      const totalAmount = subtotal + deliveryCharge - couponDiscount;

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(deliveryCharge * 100),
                currency: "aud",
              },
              display_name: "Shipping Charge",
            },
          },
        ],
        customer_email: email,
        metadata: {
          cart_ids: JSON.stringify(cart.map((item) => item._id)),
          userId: user._id.toString(),
          fullName,
          email,
          phone,
          paymentMethod,
          couponCode: couponCode || "",
          discount: discount.toString(),
          couponDiscount: couponDiscount.toFixed(2),
          shippingAddress: JSON.stringify({
            addressLine1: address?.Address,
            city,
            state,
            postalCode: zip,
            shippingCharge: deliveryCharge,
            countryCode: "AU",
          }),
          totalAmount: totalAmount.toFixed(2),
        },
        line_items: lineItems,
        discounts: stripePromotionCodeId
          ? [{ promotion_code: stripePromotionCodeId }]
          : [],
        success_url: `${process.env.FRONTEND_HOST}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_HOST}/products`,
      });

      return response.status(303).json(session);
    } catch (error) {
      console.error("Stripe checkout error:", error);
      return response.status(500).json({
        message: error.message || "Stripe checkout error",
        error: true,
      });
    }
  };

  static CheckOrderStatus = async (req, res) => {
    const sessionId = req.query.session_id;

    try {
      const order = await orderModel.findOne({
        "paymentDetails.sessionId": sessionId,
      });

      if (order) {
        return res.json({ success: true, order });
      } else {
        return res.json({
          success: false,
          message: "Order not yet confirmed.",
        });
      }
    } catch (error) {
      console.error("CheckOrderStatus error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking order status",
        error: error.message,
      });
    }
  };

  static webhooks = async (request, response) => {
    const sig = request.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;
    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const cartItems = await cartModel
          .find({ userId: session.metadata.userId })
          .populate({
            path: "productId",
            populate: { path: "category" },
          });

        let subtotal = 0,
          totalDiscount = 0;
        cartItems.forEach((item) => {
          const p = item.productId;
          const discountAmount = (p.productPrice * (p.discount || 0)) / 100;
          subtotal += (p.productPrice - discountAmount) * item.quantity;
          totalDiscount += discountAmount * item.quantity;
        });

        const shippingAddress = JSON.parse(session.metadata.shippingAddress);
        const couponDetails = session.metadata.couponCode
          ? {
              code: session.metadata.couponCode,
              discount: Number(session.metadata.discount) || 0,
              discountAmount: Number(session.metadata.couponDiscount) || 0,
            }
          : { code: null, discount: 0, discountAmount: 0 };

        const orderDetails = {
          productDetails: cartItems.map((item) => ({
            _id: item._id,
            userId: item.userId,
            quantity: item.quantity,
            productId: {
              _id: item.productId._id,
              productName: item.productId.productName,
              productDescription: item.productId.productDescription,
              SKU: item.productId.SKU,
              productPrice: item.productId.productPrice,
              discount: item.productId.discount,
              productImageUrls: item.productId.productImageUrls,
              productTotalStockQty: item.productId.productTotalStockQty,
              category: item.productId.category?.categoryName,
              rating: item.productId.rating,
              numReviews: item.productId.numReviews,
            },
          })),
          UserDetails: {
            userId: session.metadata.userId,
            name: session.metadata.fullName,
            email: session.customer_email,
            phoneNumber: session.metadata.phone,
          },
          paymentDetails: {
            sessionId: session.id,
            paymentId: session.payment_intent,
            payment_method_type: session.metadata.paymentMethod,
            payment_status: session.payment_status,
          },
          shippingAddress,
          couponDetails,
          totalAmount: session.amount_total / 100,
        };

        if (session.payment_status === "paid") {
          // Save the order
          const newOrder = await orderModel.create(orderDetails);

          // Update product stock — single pass
          for (const item of cartItems) {
            const productInDb = await ProductModel.findById(item.productId._id);
            if (
              productInDb &&
              productInDb.productTotalStockQty >= item.quantity
            ) {
              productInDb.productTotalStockQty -= item.quantity;
              await productInDb.save();
            } else {
              console.warn(
                `Not enough stock for ${item.productId.productName}`
              );
            }
          }

          // Track coupon usage if coupon applied
          if (couponDetails.code) {
            const validCoupon = await Coupon.findOne({
              code: couponDetails.code,
            });

            if (validCoupon) {
              if (!Array.isArray(validCoupon.usedBy)) {
                validCoupon.usedBy = [];
              }

              const userId = session.metadata.userId;

              const existingUsage = validCoupon.usedBy.find(
                (u) => u.userId.toString() === userId.toString()
              );

              if (existingUsage) {
                existingUsage.timesUsed += 1;
              } else {
                validCoupon.usedBy.push({ userId, timesUsed: 1 });
              }

              validCoupon.usedCount = (validCoupon.usedCount || 0) + 1;

              await validCoupon.save();
            }
          }

          const siteInfo = await WebsiteInfoModel.findOne();
          const orderDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const { textCustomer, htmlCustomer, textAdmin, htmlAdmin } =
            generateOrderEmailContent({
              websiteName: siteInfo?.websiteName,
              websiteUrl: process.env.FRONTEND_HOST,
              fullName: session.metadata.fullName,
              email: session.customer_email,
              phone: session.metadata.phone,
              cart: cartItems,
              address: shippingAddress.addressLine1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip: shippingAddress.postalCode,
              deliveryCharge: shippingAddress.shippingCharge,
              subtotal,
              totalDiscount,
              totalAmount: orderDetails.totalAmount,
              paymentMethod: session.metadata.paymentMethod,
              orderIdFormatted: newOrder._id,
              orderDate,
              couponCode: couponDetails.code,
              couponDiscountPercent: couponDetails.discount,
              couponDiscountAmount: couponDetails.discountAmount,
            });

          await sendEmail(
            session.customer_email,
            "Order Confirmation",
            textCustomer,
            htmlCustomer
          );
          await sendEmail(
            process.env.EMAIL_FROM,
            "New Order Received",
            textAdmin,
            htmlAdmin
          );

          // Clear user's cart after order placed
          await cartModel.deleteMany({ userId: session.metadata.userId });
        }
      }

      response
        .status(200)
        .send({ success: true, message: "Payment processed successfully" });
    } catch (error) {
      console.error("Webhook handler error:", error);
      return response
        .status(500)
        .send({ success: false, message: error.message });
    }
  };

  static orderDataPaypal = async (req, res) => {
    try {
      // Check the structure of req.body
      const {
        cart,
        address,
        zip,
        state,
        phone,
        paymentMethod,
        fullName,
        email,
        city,
        couponCode,
      } = req.body;

      const userId = req?.user?._id;

      // Validate cart
      if (!Array.isArray(cart)) {
        return res.status(400).json({ error: "Cart should be an array." });
      }

      const { jsonResponse, httpStatusCode } = await createOrder({
        cart,
        address,
        zip,
        state,
        phone,
        paymentMethod,
        fullName,
        email,
        city,
        userId,
        couponCode,
      });
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  };
  // Capture order route
  static captureData = async (req, res) => {
    try {
      const { orderID } = req.params;
      const {
        cart,
        address,
        zip,
        state,
        phone,
        paymentMethod,
        fullName,
        email,
        city,
        couponCode,
      } = req.body;

      const userId = req?.user?._id;

      const { jsonResponse, httpStatusCode } = await captureOrder(
        orderID,
        cart,
        address,
        zip,
        state,
        phone,
        paymentMethod,
        fullName,
        email,
        city,
        userId,
        couponCode
      );
      res
        .status(httpStatusCode)
        .json({ jsonResponse, message: "Payment SuccessFull!!" });
    } catch (error) {
      console.error("Failed to capture order:", error);
      res
        .status(500)
        .json({ error: "Failed to capture order.", message: error.message });
    }
  };

  static getAllOrderController = async (request, response) => {
    const userId = request?.user?._id;

    const user = await UserModel.findById(userId);

    if (user.roles[0] !== "admin") {
      return response.status(500).json({
        message: "not access",
      });
    }

    const AllOrder = await orderModel.find().sort({ createdAt: -1 });

    return response.status(200).json({
      data: AllOrder,
      success: true,
    });
  };
  static getUserOrderController = async (request, response) => {
    try {
      const currentUserId = request?.user?._id;

      const orderList = await orderModel
        .find({ "UserDetails.userId": currentUserId })
        .sort({ createdAt: -1 });

      response.json({
        data: orderList,
        message: "Order list",
        success: true,
      });
    } catch (error) {
      response.status(500).json({
        message: error.message || error,
        error: true,
      });
    }
  };
  // Get single product method
  static getSingleOrder = async (req, res) => {
    try {
      const { id } = req.params;

      const order = await orderModel.findById({ _id: id });

      if (!order) {
        return res.status(404).send({ error: "Product not found" });
      }

      res.status(200).send({
        success: true,
        message: "Order fetched successfully",
        data: order,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Error while getting order",
        error,
      });
    }
  };

  static updateOrderStatus = async (request, response) => {
    try {
      const { newStatus } = request.body;
      const { orderId } = request.params;
      const validStatuses = ["Cancelled", "Processing", "Shipped", "Delivered"];

      // Validate the status
      if (!validStatuses.includes(newStatus)) {
        return response.status(400).json({
          message: "Invalid order status",
          error: true,
        });
      }

      // Find the order by ID and update the status
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { $set: { orderStatus: [newStatus] } },
        { new: true }
      );

      if (!updatedOrder) {
        return response.status(404).json({
          message: "Order not found",
          error: true,
        });
      }

      // Send the response
      response.json({
        data: updatedOrder,
        message: `Order status updated to ${newStatus}`,
        success: true,
      });

      let productDetailsText = "";
      updatedOrder?.productDetails?.forEach((product) => {
        productDetailsText += `
        <p><strong>${product?.productId?.productName}</strong> (Qty :${product?.quantity})</p>
        <br/>
      `;
      });

      const userEmailSubject = "Your Order Status has been Updated!";
      const userEmailBody = `
      <h3>Hello ${updatedOrder.UserDetails.name},</h3>
      <p>We wanted to inform you that the status of your order (ID: ${orderId}) has been updated to <strong>${newStatus}</strong>.</p>
      <p>Your order includes the following items:</p>
      ${productDetailsText}
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Thank you for choosing us!</p>
    `;

      await sendEmail(
        updatedOrder.UserDetails.email,
        userEmailSubject,
        `Your order status has been updated to ${newStatus}.`,
        userEmailBody
      );

      // Send notification email to admin about the order status update
      const adminNotificationMessage = `
      <h3>Order Status Updated</h3>
      <p>Order ID: ${orderId} has been updated to <strong>${newStatus}</strong>.</p>
      <p>The following products includes the order:</p>
      ${productDetailsText}
      <p>To review or take further actions, please visit the admin panel.</p>
    `;

      await sendEmail(
        process.env.EMAIL_FROM,
        "Order Status Updated",
        `Order ID: ${orderId} status changed to ${newStatus}`,
        adminNotificationMessage
      );
      // Send a confirmation response back to the client
      response.json({
        data: updatedOrder,
        message: `Order status updated successfully to ${newStatus}`,
        success: true,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      response.status(500).json({
        message: error.message || "Error in updating order status",
        error: true,
      });
    }
  };
}
export default orderController;
