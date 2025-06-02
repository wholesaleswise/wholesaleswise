import Contact from "../models/ContactModel.js";

class ContactController {
  // Create new Contact
  static addContact = async (req, res) => {
    const { contactContent, mapEmbedUrl } = req.body;

    if (!contactContent || !mapEmbedUrl) {
      return res.status(400).json({
        message: "Both contactContent and mapEmbedUrl are required.",
      });
    }

    const existingContact = await Contact.findOne();
    if (existingContact) {
      return res.status(400).send({
        message: "Contact already exists",
      });
    }
    try {
      const newContact = new Contact({ contactContent, mapEmbedUrl });
      await newContact.save();

      return res.status(201).json({
        message: "Contact information added successfully.",
        data: newContact,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error saving contact information.",
        message: error.message,
      });
    }
  };

  // Get all Contact entries
  static getAllContacts = async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching contact information.",
        message: error.message,
      });
    }
  };

  // Get a single Contact by ID
  static getContactById = async (req, res) => {
    const { id } = req.params;

    try {
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          message: "Contact information not found.",
        });
      }

      return res.status(200).json(contact);
    } catch (error) {
      return res.status(500).json({
        error: "Error fetching contact information.",
        message: error.message,
      });
    }
  };

  // Update Contact by ID
  static updateContact = async (req, res) => {
    const { id } = req.params;
    const { contactContent, mapEmbedUrl } = req.body;

    if (!contactContent || !mapEmbedUrl) {
      return res.status(400).json({
        message: "Both contactContent and mapEmbedUrl are required for update.",
      });
    }

    try {
      const updated = await Contact.findByIdAndUpdate(
        id,
        { contactContent, mapEmbedUrl },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Contact information not found.",
        });
      }

      return res.status(200).json({
        message: "Contact information updated successfully.",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error updating contact information.",
        message: error.message,
      });
    }
  };

  // Delete Contact by ID
  static deleteContact = async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await Contact.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Contact information not found.",
        });
      }

      return res.status(200).json({
        message: "Contact information deleted successfully.",
        data: deleted,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error deleting contact information.",
        message: error.message,
      });
    }
  };
}

export default ContactController;
