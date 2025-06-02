import express from "express";
import passport from "passport";

import { isAdmin } from "../middlewares/isAdmin.js";
import SocialLinkController from "../controllers/socialLinkController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/social-link/:id", SocialLinkController.getSocialLinkById);
router.get("/social-link", SocialLinkController.getAllSocialLinks);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.route("/social-link").post(isAdmin, SocialLinkController.addSocialLink);

router.use(isAdmin);

router
  .route("/social-link/:id")
  .patch(SocialLinkController.updateSocialLink)
  .delete(SocialLinkController.deleteSocialLink);

export default router;
