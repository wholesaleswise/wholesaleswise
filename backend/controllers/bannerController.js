import { s3 } from "../config/aws.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import BannerModel from "../models/BannerModel.js";

class BannerController {
  static createBanner = async (req, res) => {
    try {
      const { productLink } = req.body;
      const BannerImage = req.file;

      // Validation
      if (!productLink) {
        return res.status(400).json({
          status: "failed",
          message: "Product Link are required",
        });
      }
      if (!BannerImage) {
        return res.status(400).json({
          status: "failed",
          message: "Banner Image is required",
        });
      }

      const fileName = BannerImage.originalname.replace(/\s+/g, "_");
      const timestamp = Date.now();
      const params = {
        Bucket: process.env.SPACES_BUCKET_NAME,
        Key: `banner/${timestamp}_${fileName}`,
        Body: BannerImage.buffer,
        ContentType: BannerImage.mimetype,
        ACL: "public-read",
      };

      let imageUrl = "";
      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        imageUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/banner/${timestamp}_${fileName}`;
      } catch (error) {
        return res.status(400).json({
          status: "failed",
          message: "Image upload failed",
        });
      }

      // Check if the Banner name already exists
      const existingBanner = await BannerModel.findOne({
        productLink,
      });
      if (existingBanner) {
        return res.status(400).json({
          status: "failed",
          message: "Banner is already exists",
        });
      }

      // Create a new Banner
      const newBanner = new BannerModel({
        BannerImage: imageUrl,
        productLink,
      });
      await newBanner.save();

      return res.status(201).json({
        status: "success",
        message: "Banner created successfully",
        Banner: newBanner,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Error in creating Banner",
      });
    }
  };

  static getAllBanners = async (req, res) => {
    try {
      const Banners = await BannerModel.find();
      return res.status(200).json({
        status: "success",
        message: "Banners fetched successfully",
        Banners,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Error in fetching Banners",
      });
    }
  };

  static getSingleBanner = async (req, res) => {
    try {
      const { id } = req.params;
      const Banner = await BannerModel.findById(id);
      if (!Banner) {
        return res.status(404).json({
          status: "failed",
          message: "Banner not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Banner fetched successfully",
        Banner,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Error in fetching Banner",
      });
    }
  };

  static updateBanner = async (req, res) => {
    try {
      const { id } = req.params;
      const { productLink } = req.body;
      const BannerImage = req.file;
      let imageUrl = "";

      // Validation
      if (!productLink) {
        return res.status(400).json({
          status: "failed",
          message: "Product Link are required",
        });
      }

      // Check if the Banner exists
      const existingBanner = await BannerModel.findById(id);
      if (!existingBanner) {
        return res.status(404).json({
          status: "failed",
          message: "Banner not found",
        });
      }

      // Check if the Banner  already exists (excluding the current Banner)
      const duplicateBanner = await BannerModel.findOne({
        productLink,
      });
      if (duplicateBanner && duplicateBanner._id.toString() !== id) {
        return res.status(400).json({
          status: "failed",
          message: "Banner already exists",
        });
      }

      // If a new image is uploaded, delete the old one and upload the new one
      if (BannerImage) {
        const oldImageKey = existingBanner.BannerImage.split("/").pop();
        const deleteParams = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `categories/${oldImageKey}`,
        };

        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }

        const fileName = BannerImage.originalname.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const uploadParams = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: `banner/${timestamp}_${fileName}`,
          Body: BannerImage.buffer,
          ContentType: BannerImage.mimetype,
          ACL: "public-read",
        };

        try {
          const command = new PutObjectCommand(uploadParams);
          await s3.send(command);
          imageUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/banner/${timestamp}_${fileName}`;
        } catch (error) {
          return res.status(400).json({
            status: "failed",
            message: "Image upload failed",
          });
        }
      } else {
        imageUrl = existingBanner.BannerImage;
      }

      const updatedBanner = await BannerModel.findByIdAndUpdate(
        id,
        {
          BannerImage: imageUrl,
          productLink,
        },
        { new: true }
      );

      if (!updatedBanner) {
        return res.status(404).json({
          status: "failed",
          message: "Banner not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Banner updated successfully",
        Banner: updatedBanner,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Error in updating Banner",
      });
    }
  };

  static deleteBanner = async (req, res) => {
    try {
      const { id } = req.params;

      const Banner = await BannerModel.findById(id);
      if (!Banner) {
        return res.status(404).json({
          status: "failed",
          message: "Banner not found",
        });
      }

      const imageUrl = Banner.BannerImage;
      const fileKey = imageUrl.split("/").slice(-2).join("/");

      if (imageUrl) {
        const deleteParams = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: fileKey,
        };

        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
        } catch (error) {
          return res.status(500).json({
            status: "failed",
            message: "Error deleting the image from DigitalOcean Spaces",
          });
        }
      }

      await BannerModel.findByIdAndDelete(id);

      return res.status(200).json({
        status: "success",
        message: "Banner deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message || "Error in deleting Banner",
      });
    }
  };
}

export default BannerController;
