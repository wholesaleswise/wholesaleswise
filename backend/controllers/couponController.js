import Coupon from "../models/Coupon.js";
import orderModel from "../models/OrderModel.js";

class CouponController {
  static createCoupon = async (req, res) => {
    const { code, discount, expiresAt, startDate, maxUses, maxUsesPerUser } =
      req.body;

    if (!code || !discount || !expiresAt) {
      return res
        .status(400)
        .json({ message: "Code, discount and expiry are required." });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(409).json({ message: "Coupon already exists." });
    }

    try {
      const coupon = new Coupon({
        code,
        discount,
        expiresAt,
        startDate: startDate || new Date(),
        maxUses: maxUses || null,
        maxUsesPerUser: maxUsesPerUser || 1,
        active: true,
      });
      await coupon.save();
      return res.status(201).json({ message: "Coupon created", coupon });
    } catch (error) {
      return res.status(500).json({ message: "Error creating coupon", error });
    }
  };

  static getAllCoupons = async (req, res) => {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coupons", error });
    }
  };

  static getCouponById = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      res.status(200).json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static updateCoupon = async (req, res) => {
    const {
      code,
      discount,
      expiresAt,
      startDate,
      maxUses,
      maxUsesPerUser,
      active,
    } = req.body;
    try {
      const updated = await Coupon.findByIdAndUpdate(
        req.params.id,
        {
          code,
          discount,
          expiresAt,
          startDate,
          maxUses,
          maxUsesPerUser,
          active,
        },
        { new: true }
      );
      if (!updated)
        return res.status(404).json({ message: "Coupon not found" });
      res.status(200).json({ message: "Coupon updated", updated });
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static deleteCoupon = async (req, res) => {
    try {
      const deleted = await Coupon.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "Coupon not found" });
      res.status(200).json({ message: "Coupon deleted", deleted });
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static applyCoupon = async (req, res) => {
    const { code } = req.body;
    const userId = req.user?._id;

    try {
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: login required" });
      }

      // Find coupon by code
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      if (!coupon.active) {
        return res.status(400).json({ message: "Coupon is inactive" });
      }

      const now = new Date();
      if (now < coupon.startDate) {
        return res.status(400).json({ message: "Coupon is not active yet" });
      }
      if (now > coupon.expiresAt) {
        return res.status(400).json({ message: "Coupon expired" });
      }

      // Check global usage limit (maxUses)
      // Count how many orders used this coupon in total
      const totalUsedCount = await orderModel.countDocuments({
        "couponDetails.code": code,
      });
      if (coupon.maxUses !== null && totalUsedCount >= coupon.maxUses) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // Check per-user usage limit (maxUsesPerUser)
      // Count how many orders this user placed with this coupon
      const userUsedCount = await orderModel.countDocuments({
        "UserDetails.userId": userId.toString(),
        "couponDetails.code": code,
      });
      console.log(totalUsedCount, userUsedCount);
      if (
        coupon.maxUsesPerUser !== null &&
        userUsedCount >= coupon.maxUsesPerUser
      ) {
        return res.status(400).json({
          message:
            "You have already used this coupon the maximum number of times",
        });
      }

      // If all checks pass, return success and discount info
      return res.status(200).json({
        message: "Coupon is valid",
        discount: coupon.discount,
        code: coupon.code,
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      return res.status(500).json({ message: "Error applying coupon", error });
    }
  };
}

export default CouponController;
