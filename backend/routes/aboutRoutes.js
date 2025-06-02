import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import AboutController from "../controllers/aboutController.js";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

// Public routes
router.get("/", AboutController.getAllAbout);
router.get("/:id", AboutController.getAboutById);

// Protected routes
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

router.post("/", isAdmin, AboutController.addAbout);

// Admin-only routes
router.use(isAdmin);

router
  .route("/:id")
  .patch(AboutController.updateAbout)
  .delete(AboutController.deleteAbout);

export default router;
