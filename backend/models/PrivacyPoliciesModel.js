import mongoose, { Schema } from "mongoose";

const privacyPolicySchema = new Schema(
  {
    privacyPolicy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;
