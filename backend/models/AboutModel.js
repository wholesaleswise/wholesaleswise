import mongoose, { Schema } from "mongoose";

const aboutSchema = new Schema(
  {
    aboutContent: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const About = mongoose.model("About", aboutSchema);

export default About;
