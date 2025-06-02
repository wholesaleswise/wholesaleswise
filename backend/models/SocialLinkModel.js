import mongoose from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    socialLinkName: {
      type: String,
      required: true,
      unique: true,
    },
    socialLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SocialLink", socialLinkSchema);
