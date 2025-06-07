import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,

      unique: true,
    },

    productDescription: {
      type: String,
      required: true,
    },
    SKU: {
      type: String,
      required: true,
    },
    keywords: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    productTotalStockQty: {
      type: Number,
      required: true,
    },
    productImageUrls: [{ type: String }],

    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,

      default: 0,
    },
    review: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    discount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
