
import CategoryModel from "../models/CategoryModel.js";
import ProductModel from "../models/ProductModel.js";
import { s3 } from "../config/aws.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import slugify from "slugify";

// Helpers
const uploadToS3 = async (file, folder = "categories") => {
  const fileName = file.originalname.replace(/\s+/g, "_");
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}_${fileName}`;

  const params = {
    Bucket: process.env.SPACES_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(params));
  return `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${key}`;
};

const deleteFromS3 = async (imageUrl) => {
  if (!imageUrl) return;
  const key = imageUrl.split(".com/")[1];
  const params = {
    Bucket: process.env.SPACES_BUCKET_NAME,
    Key: key,
  };
  await s3.send(new DeleteObjectCommand(params));
};

class CategoryController {
  static createCategory = async (req, res) => {
    try {
      const { categoryName } = req.body;
      const categoryImage = req.file;

      if (!categoryName || !categoryImage) {
        return res.status(400).send({
          status: "failed",
          message: `${
            !categoryName ? "Category Name" : "Category Image"
          } is required`,
        });
      }

      const slug = slugify(categoryName.trim().toLowerCase());
      const existing = await CategoryModel.findOne({ slug });
      if (existing) {
        return res.status(400).send({
          status: "failed",
          message: "Category with the same name already exists",
        });
      }

      const imageUrl = await uploadToS3(categoryImage);

      const newCategory = await CategoryModel.create({
        categoryName,
        categoryImage: imageUrl,
        slug,
      });

      res.status(201).send({
        status: "success",
        message: "Category created successfully",
        category: newCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: error.message || "Error creating category",
      });
    }
  };

  static getAllCategories = async (_req, res) => {
    try {
      const categories = await CategoryModel.find().populate("products");

      res.status(200).send({
        status: "success",
        message: "Categories with products fetched successfully",
        categories: categories,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: error.message || "Error fetching categories with products",
      });
    }
  };

  static getSingleCategory = async (req, res) => {
    try {
      const category = await CategoryModel.findOne({ slug: req.params.slug });
      if (!category) {
        return res.status(404).send({
          status: "failed",
          message: "Category not found",
        });
      }
      res.status(200).send({
        status: "success",
        message: "Category fetched successfully",
        category,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: error.message || "Error fetching category",
      });
    }
  };

  static updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryName } = req.body;
      const categoryImage = req.file;

      if (!categoryName) {
        return res.status(400).send({
          status: "failed",
          message: "Category Name is required",
        });
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        return res.status(404).send({
          status: "failed",
          message: "Category not found",
        });
      }

      const existing = await CategoryModel.findOne({
        slug: slugify(categoryName.trim().toLowerCase()),
      });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).send({
          status: "failed",
          message: "Category with the same name already exists",
        });
      }

      let imageUrl = category.categoryImage;
      if (categoryImage) {
        await deleteFromS3(imageUrl);
        imageUrl = await uploadToS3(categoryImage);
      }

      category.categoryName = categoryName;
      category.slug = slugify(categoryName.trim().toLowerCase());
      category.categoryImage = imageUrl;
      await ProductModel.updateMany(
        { category: category._id },
        { $set: { categoryName: category.categoryName } }
      );
      await category.save();

      res.status(200).send({
        status: "success",
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: error.message || "Error updating category",
      });
    }
  };

  static deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);
      if (!category) {
        return res.status(404).send({
          status: "failed",
          message: "Category not found",
        });
      }
      const products = await ProductModel.find({ category: id });
      for (const product of products) {
        for (const imageUrl of product.productImageUrls) {
          await deleteFromS3(imageUrl);
        }
      }
      await ProductModel.deleteMany({ category: id });
      await deleteFromS3(category.categoryImage);
      await CategoryModel.findByIdAndDelete(id);

      res.status(200).send({
        status: "success",
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: "failed",
        message: error.message || "Error deleting category",
      });
    }
  };
}

export default CategoryController;
