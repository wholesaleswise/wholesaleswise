import express from "express";
import passport from "passport";

import upload from "../middlewares/upload.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import WebsiteInfoController from "../controllers/websiteInfoController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/website-info", WebsiteInfoController.getInfo);
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));
router.use(isAdmin);

router.post(
  "/website-info",
  upload.single("logoImage"),
  WebsiteInfoController.createInfo
);

router
  .route("/website-info/:id")
  .patch(upload.single("logoImage"), WebsiteInfoController.updateInfo);

export default router;
