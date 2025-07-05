import express from "express";
import CouponController from "../controllers/couponController.js";
import passport from "passport";
import { isAdmin } from "../middlewares/isAdmin.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/", CouponController.getAllCoupons);
router.get("/:id", CouponController.getCouponById);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));
router.post("/apply", CouponController.applyCoupon);
router.use(isAdmin);

router.post("/", CouponController.createCoupon);
router.patch("/:id", CouponController.updateCoupon);
router.delete("/:id", CouponController.deleteCoupon);

export default router;
