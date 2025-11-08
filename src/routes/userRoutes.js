import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { me, myBids } from "../controllers/userController.js";

const router = Router();
router.get("/me", auth, me);
router.get("/bids", auth, myBids);

export default router;
