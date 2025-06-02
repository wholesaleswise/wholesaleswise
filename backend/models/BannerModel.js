import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    BannerImage: {
      type: String,
      required: true,
    },

    productLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
