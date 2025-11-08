import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  category: { type: String },
  basePrice: { type: Number, default: 0 },
  status: { type: String, enum: ["listed", "sold", "unsold"], default: "listed" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
