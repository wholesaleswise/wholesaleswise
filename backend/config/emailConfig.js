import dotenv from "dotenv";
dotenv.config(); // ✅ Load env variables from .env file

import sgMail from "@sendgrid/mail";

// ✅ Check if API key exists before setting
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY is not defined in environment variables.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY); // ✅ Set the SendGrid API key
}

export default sgMail;
