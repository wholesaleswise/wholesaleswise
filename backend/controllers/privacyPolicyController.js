import PrivacyPolicy from "../models/PrivacyPoliciesModel.js";

class PrivacyPolicyController {
  // Create new Privacy Policy
  static addPrivacyPolicy = async (req, res) => {
    const { privacyPolicy } = req.body;

    if (!privacyPolicy) {
      return res.status(400).json({
        message: "Privacy Policy content is required.",
      });
    }
    const existingPrivacyPolicy = await PrivacyPolicy.findOne();
    if (existingPrivacyPolicy) {
      return res.status(400).send({
        message: "Privacy Policy already exists",
      });
    }
    try {
      const newPolicy = new PrivacyPolicy({ privacyPolicy });
      await newPolicy.save();

      return res.status(201).json({
        message: "Privacy Policy added successfully.",
        data: newPolicy,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error saving Privacy Policy.",
        message: error.message,
      });
    }
  };

  // Get all Privacy Policies
  static getAllPrivacyPolicies = async (req, res) => {
    try {
      const policies = await PrivacyPolicy.find().sort({ createdAt: -1 });
      return res.status(200).json(policies);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching Privacy Policies.",
        message: error.message,
      });
    }
  };

  // Get a single Privacy Policy by ID
  static getPrivacyPolicyById = async (req, res) => {
    const { id } = req.params;

    try {
      const policy = await PrivacyPolicy.findById(id);

      if (!policy) {
        return res.status(404).json({
          message: "Privacy Policy not found.",
        });
      }

      return res.status(200).json(policy);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching Privacy Policy.",
        message: error.message,
      });
    }
  };

  // Update Privacy Policy by ID
  static updatePrivacyPolicy = async (req, res) => {
    const { id } = req.params;
    const { privacyPolicy } = req.body;

    if (!privacyPolicy) {
      return res.status(400).json({
        message: "Privacy Policy content is required for update.",
      });
    }

    try {
      const updated = await PrivacyPolicy.findByIdAndUpdate(
        id,
        { privacyPolicy },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Privacy Policy not found.",
        });
      }

      return res.status(200).json({
        message: "Privacy Policy updated successfully.",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error updating Privacy Policy.",
        message: error.message,
      });
    }
  };

  // Delete Privacy Policy by ID
  static deletePrivacyPolicy = async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await PrivacyPolicy.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Privacy Policy not found.",
        });
      }

      return res.status(200).json({
        message: "Privacy Policy deleted successfully.",
        data: deleted,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error deleting Privacy Policy.",
        message: error.message,
      });
    }
  };
}

export default PrivacyPolicyController;
