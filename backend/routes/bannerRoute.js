import express from "express";
import passport from "passport";

import upload from "../middlewares/upload.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import BannerController from "../controllers/bannerController.js";

import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/", BannerController.getAllBanners);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.use(isAdmin);

router
  .route("/")
  .post(upload.single("BannerImage"), BannerController.createBanner);

router
  .route("/:id")
  .delete(BannerController.deleteBanner)
  .patch(upload.single("BannerImage"), BannerController.updateBanner)
  .get(BannerController.getSingleBanner);

export default router;
