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
  startDate: {
    type: Date,
    default: Date.now, 
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  maxUses: {
    type: Number,
    default: null, 
  },
  maxUsesPerUser: {
    type: Number,
    default: 1, 
  },
  usedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timesUsed: {
        type: Number,
        default: 1,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
