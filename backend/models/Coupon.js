import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
