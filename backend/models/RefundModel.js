import mongoose from "mongoose";

const { Schema } = mongoose;

const refundSchema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    refundReason: {
      type: String,
      required: true,
    },
    refundStatus: {
      type: String,
      enum: ["Processing", "Refunded", "Rejected"],
      default: "Processing",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
