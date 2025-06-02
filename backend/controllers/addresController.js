import AddressModel from "../models/DeliveryAddressModel.js";

const sendSuccess = (res, message, data = {}) =>
  res.status(200).json({ status: "success", message, ...data });

const sendError = (res, code, message) =>
  res.status(code).json({ status: "failed", message });

class AddressController {
  // Add a new address
  static addAddress = async (req, res) => {
    const { Address, DeliveryCharge } = req.body;

    if (!Address || !DeliveryCharge) {
      return sendError(res, 400, "Address and delivery charge are required");
    }

    try {
      const existing = await AddressModel.findOne({ Address });
      if (existing) {
        return sendError(res, 400, "Address with the same name already exists");
      }

      const newAddress = await AddressModel.create({ Address, DeliveryCharge });
      return res.status(201).json({
        status: "success",
        message: "Address added successfully",
        address: newAddress,
      });
    } catch (error) {
      return sendError(res, 500, error.message || "Error adding address");
    }
  };

  // Get all addresses
  static getAllAddresses = async (req, res) => {
    try {
      const addresses = await AddressModel.find();
      return sendSuccess(res, "Addresses retrieved successfully", {
        addresses,
      });
    } catch (error) {
      return sendError(res, 500, error.message || "Error fetching addresses");
    }
  };

  // Get one address by ID
  static getAddressById = async (req, res) => {
    try {
      const address = await AddressModel.findById(req.params.id);
      if (!address) return sendError(res, 404, "Address not found");

      return sendSuccess(res, "Address retrieved successfully", { address });
    } catch (error) {
      return sendError(res, 500, error.message || "Error fetching address");
    }
  };

  // Update address by ID
  static updateAddress = async (req, res) => {
    const { id } = req.params;
    const { Address, DeliveryCharge } = req.body;

    try {
      const updated = await AddressModel.findByIdAndUpdate(
        id,
        { $set: { Address, DeliveryCharge } },
        { new: true }
      );

      if (!updated) return sendError(res, 404, "Address not found");

      return sendSuccess(res, "Address updated successfully", {
        address: updated,
      });
    } catch (error) {
      return sendError(res, 500, error.message || "Error updating address");
    }
  };

  // Delete address by ID
  static deleteAddress = async (req, res) => {
    try {
      const deleted = await AddressModel.findByIdAndDelete(req.params.id);
      if (!deleted) return sendError(res, 404, "Address not found");

      return sendSuccess(res, "Address deleted successfully", {
        address: deleted,
      });
    } catch (error) {
      return sendError(res, 500, error.message || "Error deleting address");
    }
  };
}

export default AddressController;
