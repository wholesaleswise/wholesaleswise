import stripe from "../config/stripe.js";
import UserModel from "../models/User.js";
import orderModel from "../models/OrderModel.js";

import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import cartModel from "../models/CartModel.js";
import transporter from "../config/emailConfig.js";

import ProductModel from "../models/ProductModel.js";
import WebsiteInfoModel from "../models/WebsiteInfoModel.js";

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
  return transporter.sendMail({
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
}) {
  // TEXT VERSION
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
Shipping Fee: AU$ ${deliveryCharge.toFixed(2)}
Total Payable: AU$ ${totalAmount.toFixed(2)}

Payment Method: ${paymentMethod}

Thank you for shopping with us!
Visit: ${websiteUrl}
`;

  // HTML VERSION
  const htmlCustomer = `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #007BFF;">${websiteName}</h2><br/>
  <p><strong>Order ID:</strong> ${orderIdFormatted}</p>
  <p><strong>Order Date:</strong> ${orderDate}</p>
  <p><strong>Customer Name:</strong> ${fullName}</p>
  <p><strong>Phone:</strong> ${phone}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Shipping Address:</strong>
    ${address}
   </p>
   <p><strong>Full Address:</strong>
    ${city}, ${state}, ${zip}
   </p>

  <h4>Order Items:</h4>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Discount</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
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

  // TEXT VERSION
  const textAdmin = `
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
Shipping Fee: AU$ ${deliveryCharge.toFixed(2)}
Total Payable: AU$ ${totalAmount.toFixed(2)}
Payment Method: ${paymentMethod}
`;

  // HTML VERSION
  const htmlAdmin = `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #007BFF;">${websiteName}</h2><br/>
  <p><strong>Order ID:</strong> ${orderIdFormatted}</p>
  <p><strong>Order Date:</strong> ${orderDate}</p>
  <p><strong>Customer Name:</strong> ${fullName}</p>
  <p><strong>Phone:</strong> ${phone}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Shipping Address:</strong>
    ${address}
   </p>
   <p><strong>Full Address:</strong>
    ${city}, ${state}, ${zip}
   </p>

  <h4>Order Items:</h4>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Discount</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
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
  <p><strong>Total Discount:</strong> AU$ ${totalDiscount.toFixed(2)}</p>
  <p><strong>Shipping Fee:</strong> AU$ ${deliveryCharge.toFixed(2)}</p>
  <p><strong>Total Payable:</strong> <strong>AU$ ${totalAmount.toFixed(
    2
  )}</strong></p>
  <p><strong>Payment Method:</strong> ${paymentMethod}</p>
</div>
`;
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
}) => {
  try {
    if (!Array.isArray(cart)) {
      throw new Error("Cart should be an array");
    }

    // Calculate the total amount of the order
    let discountedPrice = 0;
    let totalAmount = 0;
    cart.forEach((item) => {
      // Check if item has productPrice and quantity, and if productId has productPrice
      const product = item?.productId;
      let itemTotal = 0;
      const discountAmount = (product?.productPrice * product?.discount) / 100;
      discountedPrice = product?.productPrice - discountAmount;
      if (discountedPrice === product?.productPrice) {
        itemTotal = product?.productPrice * item.quantity;
      } else {
        itemTotal = discountedPrice * item.quantity;
      }
      totalAmount += itemTotal;
    });

    // Add delivery charge
    const deliveryCharge = address?.DeliveryCharge;
    totalAmount += deliveryCharge;

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
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(
      error.message || "An error occurred while creating the order."
    );
  }
};

// // Capture order function
// const captureOrder = async (
//   orderID,
//   cart,
//   address,
//   zip,
//   state,
//   phone,
//   paymentMethod,
//   fullName,
//   email,
//   city,
//   userId
// ) => {
//   const collect = {
//     id: orderID,
//     prefer: "return=minimal",
//   };

//   if (!Array.isArray(cart)) {
//     throw new Error("Cart should be an array");
//   }

//   // Calculate the total amount of the order
//   let discountedPrice = 0;
//   let totalAmount = 0;
//   cart.forEach((item) => {
//     // Check if item has productPrice and quantity, and if productId has productPrice
//     const product = item?.productId;
//     let itemTotal = 0;
//     const discountAmount = (product?.productPrice * product?.discount) / 100;
//     discountedPrice = product?.productPrice - discountAmount;
//     if (discountedPrice === product?.productPrice) {
//       itemTotal = product?.productPrice * item.quantity;
//     } else {
//       itemTotal = discountedPrice * item.quantity;
//     }
//     totalAmount += itemTotal;
//   });

//   // Add delivery charge
//   const deliveryCharge = address?.DeliveryCharge;
//   totalAmount += deliveryCharge;
//   totalAmount = Number(totalAmount);

//   try {
//     const { body, ...httpResponse } = await ordersController.ordersCapture(
//       collect
//     );
//     const orderDetails = JSON.parse(body);
//     if (!orderDetails || !orderDetails.id) {
//       throw new Error(
//         "Failed to capture order. No valid order details received."
//       );
//     }
//     if (orderDetails.status === "COMPLETED") {
//       // Save the order in the database
//       const newOrder = new orderModel({
//         productDetails: cart,
//         UserDetails: {
//           userId: userId,
//           name: fullName,
//           email: email,
//           phoneNumber: phone,
//         },
//         totalAmount: totalAmount.toFixed(2),
//         shippingAddress: {
//           addressLine1: address.Address,
//           city: city,
//           state: state,
//           postalCode: zip,
//           shippingCharge: deliveryCharge,
//           countryCode: "AU",
//         },
//         paymentDetails: {
//           paymentId: orderDetails.id,
//           payment_method_type: paymentMethod,
//           payment_status: orderDetails.status,
//         },
//       });

//       // Save the order to MongoDB
//       const saveOrder = await newOrder.save();

//       if (saveOrder?._id) {
//         // Send email to the customer
//         const customerEmailText = `
//       Hi ${fullName},

//       Thank you for your order! Here's the summary of your order:

//       Products:
//       ${cart
//         .map(
//           (item) => `- ${item.productId.productName} (Qty: ${item.quantity})`
//         )
//         .join("\n")}
//       addressLine1: address?.Address,
//             city: city,
//             state: state,
//             postalCode: zip,
//             shippingCharge: deliveryCharge,
//             countryCode: "AU",
//       Shipping Address:
//       ${address?.Address}
//       Full Adreess: ${city}, ${state}, ${zip}

//       Delivery Charge: AU$ ${deliveryCharge}
//       Total Payment: AU$ ${totalAmount.toFixed(2)}

//       We will notify you once your order is shipped.

//       If you have any questions, please contact us at ${
//         process.env.SUPPORT_EMAIL
//       }.

//       Best regards,
//       ${process.env.COMPANY_NAME}
//       `;

//         const customerEmailHtml = `
//       <h3>Hi ${fullName},</h3>
//       <p>Thank you for your order! Here's the summary of your order:</p>
//       <ul>
//       ${cart
//         .map(
//           (item) => `
//           <li style="padding-bottom: 10px;">
//             <img src="${item.productId.productImageUrls[0]}" alt="${item.productId.productName}" style="max-width: 100px; margin-right: 10px;">
//             <p> ${item.productId.productName} (Qty: ${item.quantity}) </p>

//           </li>`
//         )
//         .join("")}
//       </ul>
//       <p><strong>Shipping Address:</strong><br>${address.Address}</p>
//       <p><strong>Full Address:</strong><br> ${city}, ${state}, ${zip}</p>
//       <p><strong>Delivery Charge:</strong> AU$ ${deliveryCharge}</p>
//       <p><strong>Total Payment:</strong> AU$ ${totalAmount.toFixed(2)}</p>
//       <p>We will notify you once your order is shipped. If you have any questions, please contact us at <a href="mailto:${
//         process.env.SUPPORT_EMAIL
//       }">${process.env.SUPPORT_EMAIL}.</p>
//       <p>Best regards,<br>${process.env.SUPPORT_EMAIL}</p>
//       `;

//         // Send email to the customer
//         await sendEmail(
//           email,
//           "Order Confirmation",
//           customerEmailText,
//           customerEmailHtml
//         );

//         // Send email to the admin
//         const adminEmailText = `
//       New Order Received:

//       Customer: ${fullName}
//       Email: ${email}
//       Phone: ${phone}

//       Shipping Address:
//       ${address?.Address}
//       Full Address: ${city}, ${state}, ${zip}

//       Products:
//       ${cart
//         .map(
//           (item) => `- ${item.productId.productName} (Qty: ${item.quantity})`
//         )
//         .join("\n")}

//       Delivery Charge: AU$ ${deliveryCharge}
//       Total Pay Amount: AU$ ${totalAmount.toFixed(2)}
//       `;

//         const adminEmailHtml = `
//       <h3>New Order Received:</h3>
//       <p><strong>Customer:</strong> ${fullName}</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Phone:</strong> ${phone}</p>
//       <p><strong>Shipping Address:</strong>${address.Address}</p>
//          <p><strong>Full Address:</strong>${city}, ${state}, ${zip}</p>
//       <p><strong>Products:</strong></p>
//       <ul>
//       ${cart
//         .map(
//           (item) => `
//           <li style="padding-bottom: 10px;">
//             <img src="${item.productId.productImageUrls[0]}" alt="${item.productId.productName}" style="max-width: 100px; margin-right: 10px;">
//             <p> ${item.productId.productName} (Qty: ${item.quantity}) </p>
//           </li>`
//         )
//         .join("")}
//       </ul>
//       <p><strong>Delivery Charge:</strong> AU$ ${deliveryCharge}</p>
//       <p><strong>Total Payment:</strong> AU$ ${totalAmount.toFixed(2)}</p>
//       `;

//         // Send email to admin
//         await sendEmail(
//           process.env.EMAIL_FROM,
//           "New Order Received",
//           adminEmailText,
//           adminEmailHtml
//         );
//         await cartModel.deleteMany({ userId });
//         for (let item of cart) {
//           const productInDb = await ProductModel.findById(item.productId._id);
//           if (productInDb) {
//             if (productInDb.productTotalStockQty >= item.quantity) {
//               // Reduce the stock for each item in the cart
//               productInDb.productTotalStockQty -= item.quantity;
//               await productInDb.save();
//             } else {
//               // Handle case where stock is insufficient
//               console.log(
//                 `Not enough stock for product ${item.productId.productName}`
//               );
//               // You can also throw an error if you need to stop the order
//               throw new Error(
//                 `Not enough stock for ${item.productId.productName}`
//               );
//             }
//           } else {
//             console.log(
//               `Product ${item.productId.productName} not found in the database.`
//             );
//           }
//         }
//       }

//       return {
//         jsonResponse: orderDetails,
//         httpStatusCode: httpResponse.statusCode,
//       };
//     } else {
//       throw new Error("Order capture failed. Payment not completed.");
//     }
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw new Error(error.message);
//     }
//     console.error("Error during capture:", error);
//     throw new Error("Failed to capture the order.");
//   }
// };

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
  userId
) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  if (!Array.isArray(cart)) {
    throw new Error("Cart should be an array");
  }

  let totalAmount = 0;
  let totalDiscount = 0;

  cart.forEach((item) => {
    const product = item?.productId;
    const discountAmount =
      (product.productPrice * (product.discount || 0)) / 100;
    const discountedPrice = product.productPrice - discountAmount;
    const itemTotal = discountedPrice * item.quantity;

    totalDiscount += discountAmount * item.quantity;
    totalAmount += itemTotal;
  });

  const deliveryCharge = address?.DeliveryCharge || 0;
  const subtotal = totalAmount;
  totalAmount += deliveryCharge;

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(
      collect
    );
    const orderDetails = JSON.parse(body);

    if (!orderDetails?.id) {
      throw new Error(
        "Failed to capture order. No valid order details received."
      );
    }

    if (orderDetails.status !== "COMPLETED") {
      throw new Error("Order capture failed. Payment not completed.");
    }

    // Generate order date and order ID
    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Fetch dynamic site info
    const siteInfo = await WebsiteInfoModel.findOne();
    const websiteName = siteInfo?.websiteName;
    const websiteUrl = process.env.FRONTEND_HOST;

    // Save Order
    const newOrder = new orderModel({
      productDetails: cart,
      UserDetails: {
        userId,
        name: fullName,
        email,
        phoneNumber: phone,
      },
      totalAmount: totalAmount.toFixed(2),
      shippingAddress: {
        addressLine1: address.Address,
        city,
        state,
        postalCode: zip,
        shippingCharge: deliveryCharge,
        countryCode: "AU",
      },
      paymentDetails: {
        paymentId: orderDetails.id,
        payment_method_type: paymentMethod,
        payment_status: orderDetails.status,
      },
    });

    const saveOrder = await newOrder.save();

    if (saveOrder?._id) {
      const {
        textCustomer: customerEmailText,
        htmlCustomer: customerEmailHtml,
        textAdmin: adminEmailText,
        htmlAdmin: adminEmailHtml,
      } = generateOrderEmailContent({
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
        totalDiscount,
        totalAmount,
        paymentMethod,
        orderIdFormatted: saveOrder?._id,
        orderDate,
      });
      // Send customer & admin emails
      await sendEmail(
        email,
        "Order Confirmation",
        customerEmailText,
        customerEmailHtml
      );
      await sendEmail(
        process.env.EMAIL_FROM,
        "New Order Received",
        adminEmailText,
        adminEmailHtml
      );

      // Update product stock
      await cartModel.deleteMany({ userId });
      for (const item of cart) {
        const productInDb = await ProductModel.findById(item.productId._id);
        if (productInDb) {
          if (productInDb.productTotalStockQty >= item.quantity) {
            productInDb.productTotalStockQty -= item.quantity;
            await productInDb.save();
          } else {
            throw new Error(
              `Not enough stock for ${item.productId.productName}`
            );
          }
        }
      }

      return {
        jsonResponse: orderDetails,
        httpStatusCode: httpResponse.statusCode,
      };
    }
  } catch (error) {
    console.error("Error during capture:", error);
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
      } = request.body;

      const { user } = request;

      const userData = await UserModel.findOne({ _id: user?._id });
      const cartIds = cart.map((item) => item._id);

      // Validate cart items
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return response.status(400).json({
          message: "Invalid or empty cart items.",
          error: true,
          success: false,
        });
      }

      const deliveryCharge = address?.DeliveryCharge;

      if (!deliveryCharge) {
        return response.status(400).json({
          message: "Delivery charge is missing.",
          error: true,
          success: false,
        });
      }

      // Prepare Stripe session parameters
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: deliveryCharge * 100,
                currency: "aud",
              },
              display_name: "Shipping Charge",
            },
          },
        ],
        customer_email: email,
        metadata: {
          cart_ids: JSON.stringify(cartIds),
          userId: userData._id.toString(),
          fullName: fullName,
          email: email,
          phone: phone,
          shippingAddress: JSON.stringify({
            addressLine1: address?.Address,
            city: city,
            state: state,
            postalCode: zip,
            shippingCharge: deliveryCharge,
            countryCode: "AU",
          }),
          paymentMethod: paymentMethod,
        },
        line_items: cart.map((item) => {
          const product = item?.productId;
          const discountAmount =
            (product?.productPrice * product?.discount) / 100;
          const discountedPrice = product?.productPrice - discountAmount;

          if (
            !product ||
            !product.productName ||
            !product.productImageUrls ||
            !Array.isArray(product.productImageUrls) ||
            product.productImageUrls.length === 0 ||
            !product.productPrice ||
            !item.quantity
          ) {
            console.error("Invalid product data in cart item:", item);
            throw new Error("Invalid product data");
          }

          return {
            price_data: {
              currency: "aud",
              product_data: {
                name: product.productName,
                images: product.productImageUrls,
                metadata: {
                  productId: product._id.toString(),
                },
              },
              unit_amount: Math.round(
                (discountedPrice === product?.productPrice
                  ? product.productPrice
                  : discountedPrice) * 100
              ),
            },
            quantity: item.quantity,
          };
        }),
        // ✅ Stripe will replace {CHECKOUT_SESSION_ID} automatically
        success_url: `${process.env.FRONTEND_HOST}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_HOST}/products`,
      };

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create(params);

      // Return session to frontend
      return response.status(303).json(session);
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      return response.status(500).json({
        message: error?.message || "An error occurred during checkout.",
        error: true,
        success: false,
      });
    }
  };
  static CheckOrderStatus = async (req, res) => {
    const sessionId = req.query.session_id;
    console.log(sessionId);
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
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          const cartItems = await cartModel
            .find({ userId: session.metadata.userId })
            .populate({
              path: "productId",
              select:
                "_id productName productDescription productPrice productImageUrls discount numReviews rating productTotalStockQty SKU",
              populate: {
                path: "category",
                select: "categoryName categoryImage",
              },
            });

          const shippingAddress = JSON.parse(
            session?.metadata?.shippingAddress
          );
          let subtotal = 0;
          let totalDiscount = 0;
          cartItems.forEach((item) => {
            const product = item.productId;
            const originalPrice = product.productPrice;
            const discount = product.discount || 0;

            const discountAmount = (originalPrice * discount) / 100;
            const discountedPrice = originalPrice - discountAmount;

            subtotal += discountedPrice * item.quantity;
            totalDiscount += discountAmount * item.quantity;
          });

          const totalAmount = subtotal + (shippingAddress.shippingCharge || 0);
          const product = cartItems.map((item) => ({
            _id: item._id,
            userId: item.userId,
            productId: {
              _id: item.productId._id,
              productName: item.productId.productName,
              productDescription: item.productId.productDescription,
              SKU: item.productId.SKU,
              productPrice: item.productId.productPrice,
              productTotalStockQty: item.productId.productTotalStockQty,
              discount: item.productId.discount,
              productImageUrls: item.productId.productImageUrls,
              category: item.productId.category.categoryName,
              rating: item.productId.rating,
              numReviews: item.productId.numReviews,
            },
            quantity: item.quantity,
          }));

          const orderDetails = {
            productDetails: product,
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
            shippingAddress: JSON.parse(session.metadata.shippingAddress),
            totalAmount: session.amount_total / 100,
          };
          if (session.payment_status === "paid") {
            const order = new orderModel(orderDetails);
            const saveOrder = await order.save();

            for (let item of cartItems) {
              const productInCart = item.productId;
              // Check if the product exists in the database
              const productInDb = await ProductModel.findById(
                productInCart._id
              );
              if (productInDb) {
                // Check if the ordered quantity does not exceed the stock
                if (item.quantity <= productInDb.productTotalStockQty) {
                  // Reduce the stock by the ordered quantity
                  productInDb.productTotalStockQty -= item.quantity;

                  // Save the updated product stock quantity
                  await productInDb.save();
                } else {
                  console.log(
                    `Not enough stock for product ${productInCart.productName}`
                  );
                }
              } else {
                console.log(
                  `Product with ID ${productInCart._id} not found in the database.`
                );
              }
            }

            const orderDate = new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            // Fetch dynamic site info
            const siteInfo = await WebsiteInfoModel.findOne();
            const websiteName = siteInfo?.websiteName;
            const websiteUrl = process.env.FRONTEND_HOST;

            const {
              textCustomer: customerEmailText,
              htmlCustomer: customerEmailHtml,
              textAdmin: adminEmailText,
              htmlAdmin: adminEmailHtml,
            } = generateOrderEmailContent({
              websiteName,
              websiteUrl,
              fullName: session.metadata.fullName,
              email: session.customer_email,
              phone: session.metadata.phone,
              cart: cartItems,
              address: shippingAddress?.addressLine1,
              city: shippingAddress?.city,
              state: shippingAddress?.state,
              zip: shippingAddress?.postalCode,
              deliveryCharge: shippingAddress?.shippingCharge,
              subtotal,
              totalDiscount,
              totalAmount,
              paymentMethod: session.metadata.paymentMethod,
              orderIdFormatted: saveOrder?._id,
              orderDate,
            });

            // Send email to the customer
            await sendEmail(
              session.customer_email,
              "Order Confirmation",
              customerEmailText,
              customerEmailHtml
            );

            // Send email to the admin
            await sendEmail(
              process.env.EMAIL_FROM,
              "New Order Received",
              adminEmailText,
              adminEmailHtml
            );

            // Send email to the customer

            await sendEmail(
              email,
              "Order Confirmation",
              customerEmailText,
              customerEmailHtml
            );

            await sendEmail(
              process.env.EMAIL_FROM,
              "New Order Received",
              adminEmailText,
              adminEmailHtml
            );
            if (saveOrder?._id) {
              await cartModel.deleteMany({ userId: session.metadata.userId });
            }
            break;
          }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      response.status(500).send({
        success: false,
        message: error.message || "Error in updating product",
      });
      console.error("Error processing webhook:", error);
    }

    response.status(200).send({
      success: true,
      message: "Payment SuccessFull!!",
    });
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
        userId
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
