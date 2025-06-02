import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    productDetails: {
      type: Array,
      default: [],
    },
    UserDetails: {
      userId: String,
      name: String,
      email: String,
      phoneNumber: String,
    },

    paymentDetails: {
      paymentId: {
        type: String,
      },
      sessionId: {
        type: String,
      },
      payment_method_type: {
        type: Array,
        default: [],
      },
      payment_status: {
        type: String,
      },
    },
    shippingAddress: {
      addressLine1: String,
      city: String,
      state: String,
      postalCode: String,
      shippingCharge: Number,
      countryCode: {
        type: String,
        default: "AU",
      },
    },

    totalAmount: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: [String],
      enum: ["Cancelled", , "Processing", "Shipped", "Delivered"],
      default: ["Processing"],
    },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
