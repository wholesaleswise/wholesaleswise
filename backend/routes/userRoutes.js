import express from "express";
import passport from "passport";

import UserController from "../controllers/userController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

// Public Routes

router.post("/register", UserController.userRegistration);
router.post("/verify-email", UserController.verifyEmail);
router.post("/login", UserController.userLogin);

router.post("/reset-password-link", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

router.post("/logout", UserController.userLogout);

// protected by access token auto refresh middleware
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));

// Protected Routes
router.get("/user-protect", UserController.protected);
router.get("/me", UserController.userProfile);
router.get("/get-all-users", UserController.GetUser);
router.patch("/edit-user/:id", UserController.UpdateUser);
router.post("/change-password", UserController.changeUserPassword);

export default router;
