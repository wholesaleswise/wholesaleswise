import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import ContactController from "../controllers/contactController.js";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

// Public routes
router.get("/", ContactController.getAllContacts);
router.get("/:id", ContactController.getContactById);

// Protected routes
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));
router.use(isAdmin);

router.post("/", ContactController.addContact);
router
  .route("/:id")
  .patch(ContactController.updateContact)
  .delete(ContactController.deleteContact);

export default router;
