import express from "express";
import passport from "passport";

import upload from "../middlewares/upload.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import productController from "../controllers/productController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/:slug", productController.getSingleProduct);
router.get(
  "/category-wise-product/:category",
  productController.getCategoryWiseProduct
);
router.get('/discount/:percentage', productController.getProductsByDiscount);
router.get("/", productController.getAllProducts);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.get("/review/all", productController.getAllReview);
// POST and GET routes for /api/products
router
  .route("/")
  .post(
    upload.array("productImages", 10),
    isAdmin,
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getSingleProduct)
  .delete(isAdmin, productController.deleteProduct)
  .patch(
    upload.array("productImages", 10),
    isAdmin,
    productController.updateProduct
  );

router.post("/review/:slug", productController.createProductReview);

router
  .route("/review/:slug/:reviewId")
  .patch(productController.updateProductReview)
  .delete(productController.deleteProductReview);

router.patch("/review/status", productController.updateReviewStatus);

export default router;
