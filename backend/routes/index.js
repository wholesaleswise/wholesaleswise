import express from "express";

import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoute.js";
import categoryRoutes from "./categoryRoute.js";
import cartRoutes from "./cartRoutes.js";
import addressRoutes from "./addressRoute.js";
import socialLinkRoutes from "./socialLinkRoutes.js";
import websiteInfoRoutes from "./websiteInfoRoutes.js";
import bannerRoutes from "./bannerRoute.js";
import orderRoutes from "./orderRoute.js";
import termsCondition from "./termsConditionRoutes.js";
import privacyPolicy from "./privacyPolicyRoutes.js";
import contact from "./contactRoutes.js";
import about from "./aboutRoutes.js";
import couponRoutes from "./couponRoutes.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/delivery", addressRoutes);
router.use("/banner", bannerRoutes);
router.use("/info", websiteInfoRoutes);
router.use("/social", socialLinkRoutes);
router.use("/terms-condition", termsCondition);
router.use("/coupons", couponRoutes);
router.use("/privacy-policy", privacyPolicy);
router.use("/contact", contact);
router.use("/about-us", about);
router.use("/", orderRoutes);

export default router;
