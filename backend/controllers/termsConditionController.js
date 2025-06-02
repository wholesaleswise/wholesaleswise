import TermsCondition from "../models/TermsConditionModel.js";

class TermsConditionController {
  //  Create new Terms & Conditions
  static addTermsCondition = async (req, res) => {
    const { termsCondition } = req.body;

    if (!termsCondition) {
      return res.status(400).json({
        message: "Terms & Conditions content is required.",
      });
    }
    const existingTermsCondition = await TermsCondition.findOne();
    if (existingTermsCondition) {
      return res.status(400).send({
        message: "Terms & Condition already exists",
      });
    }
    try {
      const newTerms = new TermsCondition({ termsCondition });
      await newTerms.save();

      return res.status(201).json({
        message: "Terms & Conditions added successfully.",
        data: newTerms,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error saving Terms & Conditions.",
        message: error.message,
      });
    }
  };

  //  Get all Terms & Conditions
  static getAllTermsConditions = async (req, res) => {
    try {
      //findOne() use
      const terms = await TermsCondition.find().sort({ createdAt: -1 });
      return res.status(200).json(terms);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching Terms & Conditions.",
        message: error.message,
      });
    }
  };

  //  Get a single TermsCondition by ID
  static getTermsConditionById = async (req, res) => {
    const { id } = req.params;

    try {
      const term = await TermsCondition.findById(id);

      if (!term) {
        return res.status(404).json({
          message: "Terms & Conditions not found.",
        });
      }

      return res.status(200).json(term);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching Terms & Conditions.",
        message: error.message,
      });
    }
  };

  //  Update TermsCondition by ID
  static updateTermsCondition = async (req, res) => {
    const { id } = req.params;
    const { termsCondition } = req.body;

    if (!termsCondition) {
      return res.status(400).json({
        message: "Terms & Conditions content is required for update.",
      });
    }

    try {
      const updated = await TermsCondition.findByIdAndUpdate(
        id,
        { termsCondition },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Terms & Conditions not found.",
        });
      }

      return res.status(200).json({
        message: "Terms & Conditions updated successfully.",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error updating Terms & Conditions.",
        message: error.message,
      });
    }
  };

  //  Delete TermsCondition by ID
  static deleteTermsCondition = async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await TermsCondition.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Terms & Conditions not found.",
        });
      }

      return res.status(200).json({
        message: "Terms & Conditions deleted successfully.",
        data: deleted,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error deleting Terms & Conditions.",
        message: error.message,
      });
    }
  };
}

export default TermsConditionController;
