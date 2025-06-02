import SocialLinkModel from "../models/SocialLinkModel.js";

class SocialLinkController {
  // Add a new SocialLink
  static addSocialLink = async (req, res) => {
    const { socialLink, socialLinkName } = req.body;

    if (!socialLink || !socialLinkName) {
      return res.status(400).json({
        message: "Both socialLink and socialLinkName are required.",
      });
    }

    try {
      // Check if a social link with the same name exists (case-insensitive)
      const existingSocialLink = await SocialLinkModel.findOne({
        socialLinkName: socialLinkName.toLowerCase(),
      });

      if (existingSocialLink) {
        return res.status(400).json({
          message: "A SocialLink with the same name already exists.",
        });
      }

      // Create a new social link document
      const newSocialLink = new SocialLinkModel({
        socialLink,
        socialLinkName: socialLinkName.toLowerCase(),
      });

      // Save the new social link to the database
      await newSocialLink.save();

      return res.status(201).json({
        message: "SocialLink added successfully.",
        socialLink: newSocialLink,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error adding SocialLink.",
        message:
          error.message || "An error occurred while saving the SocialLink.",
      });
    }
  };

  // Get all SocialLinks
  static getAllSocialLinks = async (req, res) => {
    try {
      const socialLinks = await SocialLinkModel.find();
      return res.status(200).json(socialLinks);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching SocialLinks.",
        message: "An error occurred while fetching the SocialLinks.",
      });
    }
  };

  // Get a specific SocialLink by ID
  static getSocialLinkById = async (req, res) => {
    const { id } = req.params;

    try {
      const socialLink = await SocialLinkModel.findById(id);

      if (!socialLink) {
        return res.status(404).json({
          message: "SocialLink not found.",
        });
      }

      return res.status(200).json(socialLink);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Error fetching SocialLink.",
        message: "An error occurred while fetching the SocialLink.",
      });
    }
  };

  // Update a SocialLink by ID
  static updateSocialLink = async (req, res) => {
    const { id } = req.params;
    const { socialLink, socialLinkName } = req.body;

    if (!socialLink || !socialLinkName) {
      return res.status(400).json({
        message: "Both socialLink and socialLinkName are required for update.",
      });
    }

    try {
      const updatedSocialLink = await SocialLinkModel.findByIdAndUpdate(
        id,
        { socialLink, socialLinkName: socialLinkName.toLowerCase() },
        { new: true }
      );

      if (!updatedSocialLink) {
        return res.status(404).json({
          message: "SocialLink not found.",
        });
      }

      return res.status(200).json({
        message: "SocialLink updated successfully.",
        socialLink: updatedSocialLink,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error updating SocialLink.",
        message:
          error.message || "An error occurred while updating the SocialLink.",
      });
    }
  };

  // Delete a SocialLink by ID
  static deleteSocialLink = async (req, res) => {
    const { id } = req.params;

    try {
      const deletedSocialLink = await SocialLinkModel.findByIdAndDelete(id);

      if (!deletedSocialLink) {
        return res.status(404).json({
          message: "SocialLink not found.",
        });
      }

      return res.status(200).json({
        message: "SocialLink deleted successfully.",
        socialLink: deletedSocialLink,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error deleting SocialLink.",
        message:
          error.message || "An error occurred while deleting the SocialLink.",
      });
    }
  };
}

export default SocialLinkController;
