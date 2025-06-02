import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    Address: {
      type: String,
      required: true,
    },
    DeliveryCharge: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", AddressSchema);
