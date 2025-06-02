import mongoose, { Schema } from "mongoose";

const termsConditionSchema = new Schema(
  {
    termsCondition: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const TermsCondition = mongoose.model("TermsCondition", termsConditionSchema);

export default TermsCondition;
