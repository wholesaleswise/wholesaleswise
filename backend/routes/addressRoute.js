import express from "express";

import AddressController from "../controllers/addresController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.route("/address").get(AddressController.getAllAddresses);

// Protected routes
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));
router.use(isAdmin);

router.post("/address", AddressController.addAddress);
router
  .route("/address/:id")
  .patch(AddressController.updateAddress)
  .delete(AddressController.deleteAddress);
export default router;
