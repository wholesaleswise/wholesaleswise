import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    productSlug: {
      type: mongoose.Schema.Types.String,
      ref: "Products",
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
    },
    reviewContent: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: { type: [String], enum: ["hide", "show"], default: ["show"] },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
