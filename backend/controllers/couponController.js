import Coupon from "../models/Coupon.js";

class CouponController {
  static createCoupon = async (req, res) => {
    const { code, discount, expiresAt } = req.body;

    if (!code || !discount || !expiresAt) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(409).json({ message: "Coupon already exists." });
    }

    try {
      const coupon = new Coupon({ code, discount, expiresAt });
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
      if (!coupon) return res.status(404).json({ message: "Not found" });
      res.status(200).json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static updateCoupon = async (req, res) => {
    const { code, discount, expiresAt } = req.body;
    try {
      const updated = await Coupon.findByIdAndUpdate(
        req.params.id,
        { code, discount, expiresAt },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.status(200).json({ message: "Updated", updated });
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static deleteCoupon = async (req, res) => {
    try {
      const deleted = await Coupon.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.status(200).json({ message: "Deleted", deleted });
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };

  static applyCoupon = async (req, res) => {
    const { code } = req.body;
    try {
      const coupon = await Coupon.findOne({ code });
      if (!coupon) return res.status(404).json({ message: "Invalid code" });

      const now = new Date();
      const expiryTime = new Date(coupon.expiresAt).getTime();

      if (expiryTime < now.getTime()) {
        return res.status(400).json({ message: "Coupon expired" });
      }

      res.status(200).json({
        message: "Coupon valid",
        discount: coupon.discount,
        code: coupon.code,
      });
    } catch (error) {
      res.status(500).json({ message: "Error", error });
    }
  };
}

export default CouponController;
