import { Router } from "express";
import { createProduct, getMyProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { auth, isSeller } from "../middleware/auth.js";

const router = Router();
router.use(auth, isSeller);
router.post("/", createProduct);
router.get("/", getMyProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
