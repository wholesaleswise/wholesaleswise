import express from "express";
import passport from "passport";

import upload from "../middlewares/upload.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import CategoryController from "../controllers/categoryController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/:slug", CategoryController.getSingleCategory);
router.get("/", CategoryController.getAllCategories);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router
  .route("/:id")
  .delete(CategoryController.deleteCategory)
  .patch(upload.single("categoryImage"), CategoryController.updateCategory);

router
  .route("/")
  .post(
    isAdmin,
    upload.single("categoryImage"),
    CategoryController.createCategory
  );

export default router;
