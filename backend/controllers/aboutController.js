import About from "../models/AboutModel.js";

class AboutController {
  static addAbout = async (req, res) => {
    const { aboutContent } = req.body;

    if (!aboutContent) {
      return res.status(400).json({
        message: "About content is required.",
      });
    }

    const existingAbout = await About.findOne();
    if (existingAbout) {
      return res.status(400).send({
        message: "About content already exists",
      });
    }

    try {
      const newAbout = new About({ aboutContent });
      await newAbout.save();

      return res.status(201).json({
        message: "About content added successfully.",
        data: newAbout,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error saving About content.",
        message: error.message,
      });
    }
  };

  static getAllAbout = async (req, res) => {
    try {
      const abouts = await About.find().sort({ createdAt: -1 });
      return res.status(200).json(abouts);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching About content.",
        message: error.message,
      });
    }
  };

  static getAboutById = async (req, res) => {
    const { id } = req.params;

    try {
      const about = await About.findById(id);

      if (!about) {
        return res.status(404).json({
          message: "About content not found.",
        });
      }

      return res.status(200).json(about);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching About content.",
        message: error.message,
      });
    }
  };

  static updateAbout = async (req, res) => {
    const { id } = req.params;
    const { aboutContent } = req.body;

    if (!aboutContent) {
      return res.status(400).json({
        message: "About content is required for update.",
      });
    }

    try {
      const updated = await About.findByIdAndUpdate(
        id,
        { aboutContent },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "About content not found.",
        });
      }

      return res.status(200).json({
        message: "About content updated successfully.",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error updating About content.",
        message: error.message,
      });
    }
  };

  static deleteAbout = async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await About.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          message: "About content not found.",
        });
      }

      return res.status(200).json({
        message: "About content deleted successfully.",
        data: deleted,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error deleting About content.",
        message: error.message,
      });
    }
  };
}

export default AboutController;
