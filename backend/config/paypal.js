import paypal from "paypal-rest-sdk";

// PayPal Configuration
const paypalconfig = paypal.configure({
  mode: "sandbox", // Change this to "live" when moving to production
  client_id: process.env.PAYPAL_CLIENT_ID, // Use environment variables to securely store your credentials
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Export the PayPal configuration so it can be used in other parts of the application
export default paypalconfig;
