import { Router } from "express";
import { listAuctions, getAuction, createAuction, placeBid, closeAuction } from "../controllers/auctionController.js";
import { auth, isSeller } from "../middleware/auth.js";

const router = Router();
router.get("/", listAuctions);
router.get("/:id", getAuction);
router.post("/", auth, isSeller, createAuction);
router.post("/:id/bid", auth, placeBid);
router.post("/:id/close", auth, isSeller, closeAuction);

export default router;
