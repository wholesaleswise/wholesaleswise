import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    contactContent: {
      type: String,
      required: true,
      trim: true,
    },
    mapEmbedUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
