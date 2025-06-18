import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";
import Review from "../models/Review.js";
import { s3 } from "../config/aws.js";
import mongoose from "mongoose";
import slugify from "slugify";
class ProductController {
  // Create a new product with image upload
  static createProduct = async (req, res) => {
    try {
      const {
        productName,
        productDescription,
        SKU,
        productPrice,
        category,
        productTotalStockQty,
        discount,
        keywords,
      } = req.body;

      const productImages = req.files;

      // Validation
      switch (true) {
        case !productName:
          return res.status(400).send({ message: "Product Name is required" });
        case !productDescription:
          return res
            .status(400)
            .send({ message: "Product Description is required" });
        case !SKU:
          return res.status(400).send({ message: "SKU is required" });
        case !productPrice:
          return res.status(400).send({ message: "Price is required" });
        case !category:
          return res.status(400).send({ message: "Category is required" });
        case !keywords:
          return res.status(400).send({ message: "keywords is required" });
        case !productTotalStockQty:
          return res
            .status(400)
            .send({ message: "Total stock quantity is required" });
      }

      if (discount < 0 || discount > 100) {
        return res
          .status(400)
          .send({ message: "Discount percentage must be between 0 and 100." });
      }

      // Validate if the category ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).send({ message: "Invalid category ID format" });
      }

      // Check if the category exists in the database
      const existingCategory = await CategoryModel.findById(category);
      if (!existingCategory) {
        return res.status(400).send({ message: "Category does not exist" });
      }

      // Check if the product name already exists
      const trimmedProductName = productName.trim().toLowerCase();
      const existingProduct = await ProductModel.findOne({
        slug: slugify(trimmedProductName),
      });
      if (existingProduct) {
        return res.status(400).send({
          message: "Product with the same name already exists",
        });
      }
      if (!productImages || productImages.length === 0) {
        return res
          .status(400)
          .send({ message: "At least one image is required" });
      }

      const imageUrls = [];

      for (const image of productImages) {
        const FileName = image.originalname.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const params = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `products/${timestamp}_${FileName}`,
          Body: image.buffer,
          ContentType: image.mimetype,
          ACL: "public-read",
        };

        try {
          const command = new PutObjectCommand(params);
          const result = await s3.send(command);
          imageUrls.push(
            `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/products/${timestamp}_${FileName}`
          );
        } catch (error) {
          return res.status(500).send({
            message: error.message || "Image upload failed",
          });
        }
      }
      if (imageUrls.length === 0) {
        return res.status(500).send({
          message: "Image upload failed",
        });
      }
      const gpsPrice = parseFloat((productPrice * 1.1).toFixed(2));
      // Create new product
      const product = new ProductModel({
        productName,
        productDescription,
        SKU,
        productPrice: gpsPrice,
        category,
        productTotalStockQty,
        productImageUrls: imageUrls,
        discount,
        keywords,
        slug: slugify(trimmedProductName),
      });

      await product.save();

      res.status(201).send({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: error.message || "Error in creating product",
        error,
      });
    }
  };

  // Get all products method
  static getAllProducts = async (req, res) => {
    try {
      const products = await ProductModel.find({}).populate("category");

      res.status(200).send({
        success: true,
        message: "All products fetched successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: error.message || "Error in fetching products",
        error,
      });
    }
  };

  // Get single product method
  static getSingleProduct = async (req, res) => {
    try {
      const { slug } = req.params;
      console.log(slug);
      const product = await ProductModel.findOne({ slug: slug })
        .populate("category")
        .populate({
          path: "review",
          match: { productSlug: slug },
          populate: {
            path: "userId",
            model: "user",
            select: "picture",
          },
        });

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      res.status(200).send({
        success: true,
        message: "Product fetched successfully",
        product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: error.message || "Error while getting product",
        error,
      });
    }
  };

  //update product
  static updateProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        productName,
        productDescription,
        SKU,
        productPrice,
        category,
        productTotalStockQty,
        discount,
        productImageDBUrls,
        keywords,
      } = req.body;

      const productImages = req.files;

      // Validation (ensure all fields are present)
      if (!productName)
        return res.status(400).send({ message: "Product Name is required" });
      if (!productDescription)
        return res
          .status(400)
          .send({ message: "Product Description is required" });
      if (!SKU) return res.status(400).send({ message: "SKU is required" });
      if (!productPrice)
        return res.status(400).send({ message: "Price is required" });
      if (!category)
        return res.status(400).send({ message: "Category is required" });
      if (!productTotalStockQty)
        return res
          .status(400)
          .send({ message: "Total stock quantity is required" });
      if (!keywords)
        return res.status(400).send({ message: "keywords is required" });

      if (discount < 0 || discount > 100) {
        return res
          .status(400)
          .send({ message: "Discount percentage must be between 0 and 100." });
      }

      // Check if the category exists in the database
      const existingCategory = await CategoryModel.findById(category);
      if (!existingCategory) {
        return res.status(400).send({ message: "Category does not exist" });
      }

      // Find the product to update
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }
      if (productImageDBUrls.length > 0) {
      }

      // Handling image URLs (old and new images)
      const existingImageUrls = product?.productImageUrls || [];
      const newImageUrls = productImageDBUrls;

      // Step 1: Filter out images that are not in the new list
      const deleteImagesList = existingImageUrls.filter((existingUrl) => {
        return !newImageUrls.includes(existingUrl);
      });

      // Delete old images that are no longer in the new list
      for (const deleteImage of deleteImagesList) {
        const key = deleteImage.split("/").pop();

        const deleteParams = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `products/${key}`,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      const imageUrls = [];
      for (const image of productImages) {
        const FileName = image.originalname.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const params = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `products/${timestamp}_${FileName}`,
          Body: image.buffer,
          ContentType: image.mimetype,
          ACL: "public-read",
        };

        try {
          const command = new PutObjectCommand(params);
          const result = await s3.send(command);
          imageUrls.push(
            `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/products/${timestamp}_${FileName}`
          );
        } catch (error) {
          return res.status(400).send({
            message: error.message || "Image upload failed",
          });
        }
      }

      if (imageUrls.length === 0 && newImageUrls.length === 0) {
        return res.status(400).send({ message: "Image upload failed" });
      }
      const oldImage = productImageDBUrls;
      let result;
      if (productImageDBUrls.length === 0) {
        result = productImageDBUrls;
      } else {
        result = productImageDBUrls.split(/,(?=https:\/\/)/);
      }

      const newImageUrlstosave = [...result, ...imageUrls];
      console.log(newImageUrlstosave);
      const updatedImageUrls = oldImage
        ? [...newImageUrlstosave]
        : [...imageUrls];

      let gpsPrice = product.productPrice;

      if (productPrice != product.productPrice) {
        gpsPrice = parseFloat((productPrice * 1.1).toFixed(2));
        console.log(`Original price updated. New GPS price: ${gpsPrice}`);
      } else {
        console.log("Price unchanged. Skipping GPS update.");
      }

      const updateData = {
        productName,
        productDescription,
        SKU,
        productPrice: gpsPrice,
        category,
        productTotalStockQty,
        productImageUrls: updatedImageUrls,
        discount,
        keywords,
      };

      // Update the product in the database
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      res.status(200).send({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Error in updating product",
      });
    }
  };

  static deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the id is valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid product ID format" });
      }

      // Find the product to delete
      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      // Delete product images from DigitalOcean Spaces
      for (const oldImageUrl of product.productImageUrls) {
        const key = oldImageUrl.split("/").pop();
        const deleteParams = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `products/${key}`,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      // Delete the product from the database
      const result = await ProductModel.findByIdAndDelete(id);
      console.log(result);

      res.status(200).send({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        error,
      });
    }
  };

  static createProductReview = async (req, res) => {
    const { rating, reviewContent, reviewerName, userId } = req.body;
    const { slug } = req.params;
    console.log(rating, slug, reviewContent, reviewerName, userId);

    try {
      // Validation
      if (!rating || !reviewContent) {
        return res.status(400).send({
          success: false,
          message: "Please provide rating and review",
        });
      }
      if (!reviewerName || !userId) {
        return res.status(400).send({
          success: false,
          message: "Please Login first!",
        });
      }

      // Check if the product exists
      const product = await ProductModel.findOne({ slug });
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }

      // Check if the user has already reviewed this product
      const alreadyReviewed = await Review.findOne({
        productSlug: slug,
        userId,
      });
      if (alreadyReviewed) {
        return res.status(400).send({
          success: false,
          message: "You have already reviewed this product",
        });
      }

      // Create a new review
      const newReview = await Review.create({
        productSlug: slug,
        reviewerName,
        reviewContent,
        rating,
        userId,
      });

      // Fetch updated reviews for the product
      const productReviews = await Review.find({ productSlug: slug });

      // Calculate the new number of reviews and the average rating
      const numReviews = productReviews.length;
      const ratingSum = productReviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const avgRating = numReviews > 0 ? Math.floor(ratingSum / numReviews) : 0;
      console.log(avgRating);

      // Update the product with the new average rating and number of reviews
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { slug },
        {
          $set: {
            rating: avgRating, // Set the new average rating
            numReviews: numReviews, // Set the new number of reviews
          },
          $push: { review: newReview }, // Add the new review reference
        },
        { new: true }
      );

      // Send the response
      res.status(200).send({
        success: true,
        message: "Review added successfully",
        product: updatedProduct, // Optionally return the updated product
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message:
          error.message || "Something went wrong. Please try again later.",
      });
    }
  };

  // Get all reviews method
  static getAllReview = async (req, res) => {
    try {
      // Fetch all reviews from the Review collection
      const reviews = await Review.find({});
      res.status(200).send({
        success: true,
        message: "All reviews fetched successfully",
        reviews, // Return the fetched reviews
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: error.message || "Error in fetching reviews",
        error: error.message,
      });
    }
  };

  static updateProductReview = async (req, res) => {
    const { rating, reviewContent, userId } = req.body;
    const { slug, reviewId } = req.params; // Assuming reviewId is passed as a parameter
    // Assuming userId is passed from the authenticated user's session

    console.log(rating, slug, reviewContent, reviewId, userId);

    try {
      // Validation
      if (!rating || !reviewContent) {
        return res.status(400).send({
          success: false,
          message: "Please provide rating and review content",
        });
      }

      // Check if the product exists
      const product = await ProductModel.findOne({ slug });
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }

      // Check if the review exists
      const review = await Review.findOne({ _id: reviewId, productSlug: slug });
      if (!review) {
        return res.status(404).send({
          success: false,
          message: "Review not found",
        });
      }

      // Check if the logged-in user is the author of the review
      if (review.userId.toString() !== userId) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to update this review",
        });
      }

      // Update the review
      review.rating = rating;
      review.reviewContent = reviewContent;

      const updatedReview = await review.save(); // Save the updated review

      // Fetch updated reviews for the product
      const productReviews = await Review.find({ productSlug: slug });

      // Calculate the new number of reviews and the average rating
      const numReviews = productReviews.length;
      const ratingSum = productReviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const avgRating = numReviews > 0 ? Math.floor(ratingSum / numReviews) : 0;
      console.log(avgRating);

      const updatedProduct = await ProductModel.findOneAndUpdate(
        { slug },
        {
          $set: {
            rating: avgRating,
            numReviews: numReviews,
          },
        },
        { new: true }
      );

      // Send the response
      res.status(200).send({
        success: true,
        message: "Review updated successfully",
        product: updatedProduct,
        review: updatedReview,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message:
          error.message || "Something went wrong. Please try again later.",
      });
    }
  };

  static updateReviewStatus = async (req, res) => {
    const { reviewId, newStatus } = req.body;
    try {
      const updatedReview = await Review.findByIdAndUpdate(reviewId, {
        status: [newStatus],
      });

      if (updatedReview) {
        res
          .status(200)
          .send({ success: true, message: "Review status updated" });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Failed to update review status",
      });
    }
  };

  static deleteProductReview = async (req, res) => {
    const userId = req.user._id;
    const { slug, reviewId } = req.params;
    console.log(slug, reviewId, userId);

    try {
      // Check if the product exists
      const product = await ProductModel.findOne({ slug });
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }

      // Check if the review exists
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).send({
          success: false,
          message: "Review not found",
        });
      }

      // Check if the user who is deleting the review is the same user who posted it
      if (review.userId.toString() !== userId.toString()) {
        return res.status(403).send({
          success: false,
          message: "You can only delete your own reviews",
        });
      }

      // Remove the review from the Review collection
      await Review.findByIdAndDelete(reviewId);

      // Update the Product's review list, number of reviews, and rating
      const updatedReviews = await Review.find({ productSlug: slug });

      const numReviews = updatedReviews.length;
      const ratingSum = updatedReviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const avgRating = numReviews > 0 ? Math.floor(ratingSum / numReviews) : 0;

      // Update the product with the new review count and rating
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { slug },
        {
          $set: {
            rating: avgRating, // Update average rating
            numReviews: numReviews, // Update number of reviews
          },
          $pull: { review: reviewId }, // Remove the review reference from the product
        },
        { new: true }
      );

      // Send response
      res.status(200).send({
        success: true,
        message: "Review deleted successfully",
        product: updatedProduct, // Optionally return the updated product
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message:
          error.message || "Something went wrong. Please try again later.",
      });
    }
  };

  static getCategoryWiseProduct = async (req, res) => {
    try {
      const { category } = req.params;
      // const product = await ProductModel.find({ category });

      const product = await ProductModel.find()
        .populate({
          path: "category",
          match: { categoryName: category },
        })
        .exec();
      const filteredProducts = product.filter(
        (product) => product.category !== null
      );

      res.send({
        products: filteredProducts,
        message: "Product",
        success: true,
        error: false,
      });
    } catch (err) {
      res.status(400).send({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  };

  static getProductsByDiscount = async (req, res) => {
    try {
      const { percentage } = req.params;
      const exactDiscount = parseFloat(percentage);

      if (isNaN(exactDiscount)) {
        return res.status(400).send({ message: "Invalid discount percentage" });
      }

      const products = await ProductModel.find({
        discount: exactDiscount,
      });

      res.status(200).send({
        success: true,
        message: `Products with exactly ${exactDiscount}% discount`,
        products,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: error.message || "Error while getting discounted products",
        error,
      });
    }
  };
}

export default ProductController;
