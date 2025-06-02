import express from "express";
import passport from "passport";

import CartController from "../controllers/cartController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.route("/").post(CartController.addToCart).get(CartController.getMyCarts);
router.route("/delete-all").delete(CartController.deleteAllCartItems);
router
  .route("/:productId")
  .patch(CartController.updateCartItem)
  .delete(CartController.deleteMyCartItem);

export default router;
