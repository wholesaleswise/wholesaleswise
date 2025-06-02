import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import TermsConditionController from "../controllers/termsConditionController.js";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";

const router = express.Router();

router.get("/", TermsConditionController.getAllTermsConditions);
router.get("/:id", TermsConditionController.getTermsConditionById);

router.use(accessTokenAutoRefresh);
router.use(passport.authenticate("jwt", { session: false }));
router.use(isAdmin);

router.route("/").post(TermsConditionController.addTermsCondition);
router
  .route("/:id")
  .patch(TermsConditionController.updateTermsCondition)
  .delete(TermsConditionController.deleteTermsCondition);

export default router;
