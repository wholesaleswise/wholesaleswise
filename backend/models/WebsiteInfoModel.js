import mongoose from "mongoose";

const WebsiteInfoSchema = new mongoose.Schema(
  {
    logoImage: {
      type: String,
    },
    websiteName: {
      type: String,
      required: true,
    },
    keywords: {
      type: String,
      required: true,
    },
    supportNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tawkToId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WebsiteInfo", WebsiteInfoSchema);
