import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import PrivacyPolicyController from "../controllers/privacyPolicyController.js";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

// Public routes
router.get("/", PrivacyPolicyController.getAllPrivacyPolicies);
router.get("/:id", PrivacyPolicyController.getPrivacyPolicyById);

// Protected routes
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.post("/", isAdmin, PrivacyPolicyController.addPrivacyPolicy);

// Admin-only routes
router.use(isAdmin);

router
  .route("/:id")
  .patch(PrivacyPolicyController.updatePrivacyPolicy)
  .delete(PrivacyPolicyController.deletePrivacyPolicy);

export default router;
