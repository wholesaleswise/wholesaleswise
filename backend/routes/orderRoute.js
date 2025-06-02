import express from "express";
import passport from "passport";

import { isAdmin } from "../middlewares/isAdmin.js";
import orderController from "../controllers/orderController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.post("/order-paypal", orderController.orderDataPaypal);
router.post("/order-stripe/checkout/stripe", orderController.addOrderStripe);
router.post("/order-paypal/:orderID/capture", orderController.captureData);

router.get("/my-order", orderController.getUserOrderController);

router.get("/check-order-status", orderController.CheckOrderStatus);
router.get("/order-details/:id", orderController.getSingleOrder);

router.use(isAdmin);

router.get("/all-orders", orderController.getAllOrderController);
router.patch("/order-status/:orderId", orderController.updateOrderStatus);

export default router;
