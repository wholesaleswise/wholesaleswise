import WebsiteInfoModel from "../models/WebsiteInfoModel.js";
import { s3 } from "../config/aws.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

class WebsiteInfoController {
  // CREATE
  static createInfo = async (req, res) => {
    try {
      const { websiteName, supportNumber, email, address, tawkToId, keywords } =
        req.body;
      const logoImage = req.file;

      if (!websiteName || !supportNumber || !email || !address || !keywords) {
        return res.status(400).send({
          message:
            "websiteName,supportNumber,email,keywords and address are required",
        });
      }

      const exists = await WebsiteInfoModel.findOne();
      if (exists) {
        return res.status(400).send({ message: "Website info already exists" });
      }

      let imageUrl = "";
      if (logoImage) {
        const fileName = logoImage.originalname.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const key = `websitelogo/${timestamp}_${fileName}`;

        const params = {
          Bucket: process.env.SPACES_BUCKET_NAME,
          Key: key,
          Body: logoImage.buffer,
          ContentType: logoImage.mimetype,
          ACL: "public-read",
        };

        try {
          await s3.send(new PutObjectCommand(params));
          imageUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${key}`;
        } catch (err) {
          return res.status(400).send({
            message: err.message || "Image upload failed",
            error: err.message,
          });
        }
      }

      const newInfo = await WebsiteInfoModel.create({
        logoImage: imageUrl,
        websiteName,
        keywords,
        supportNumber,
        email,
        address,
        tawkToId,
      });

      res.status(201).send({
        success: true,
        message: "Website info created successfully",
        data: newInfo,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Failed to create website info",
        error: error.message,
      });
    }
  };

  // GET website info
  static getInfo = async (req, res) => {
    try {
      const info = await WebsiteInfoModel.findOne();
      console.log(info);
      if (!info) {
        return res.status(404).send({
          success: false,
          message: "Website info not found",
        });
      }

      res.status(200).send({
        success: true,
        message: "Website info fetched successfully",
        data: info,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Failed to fetch website info",
        error: error.message,
      });
    }
  };

  // UPDATE
  static updateInfo = async (req, res) => {
    try {
      const { websiteName, supportNumber, email, address, tawkToId, keywords } =
        req.body;
      const logoImage = req.file;

      let info;
      try {
        info = await WebsiteInfoModel.findOne();
        if (!info) {
          return res.status(404).send({ message: "Website info not found" });
        }
      } catch (dbError) {
        return res.status(500).send({
          message: dbError.message || "Failed to fetch website info",
          error: dbError.message,
        });
      }

      if (logoImage) {
        const fileName = logoImage.originalname.replace(/\s+/g, "_");
        const timestamp = Date.now();
        const key = `websitelogo/${timestamp}_${fileName}`;

        if (info.logoImage) {
          const oldKey = info.logoImage.split("/").slice(-2).join("/");
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.SPACES_BUCKET_NAME,
                Key: oldKey,
              })
            );
          } catch (err) {
            return res.status(500).send({
              message: err.message || "Failed to delete old image from storage",
              error: err.message,
            });
          }
        }

        try {
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.SPACES_BUCKET_NAME,
              Key: key,
              Body: logoImage.buffer,
              ContentType: logoImage.mimetype,
              ACL: "public-read",
            })
          );
          info.logoImage = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${key}`;
        } catch (err) {
          return res.status(400).send({
            message: err.message || "New image upload failed",
            error: err.message,
          });
        }
      }

      if (websiteName) info.websiteName = websiteName;
      if (supportNumber) info.supportNumber = supportNumber;
      if (email) info.email = email;
      if (address) info.address = address;
      if (keywords) info.keywords = keywords;
      if (tawkToId) info.tawkToId = tawkToId;
      try {
        await info.save();
      } catch (saveError) {
        return res.status(500).send({
          message: saveError.message || "Failed to save updated website info",
          error: saveError.message,
        });
      }

      res.status(200).send({
        success: true,
        message: "Website info updated successfully",
        data: info,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Unexpected server error",
      });
    }
  };
}

export default WebsiteInfoController;
