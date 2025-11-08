import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const auctionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["traditional", "reverse", "sealed"], default: "traditional" },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  startPrice: { type: Number, default: 0 },
  reservePrice: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  bids: [bidSchema],
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  endsAt: { type: Date }
});

export default mongoose.model("Auction", auctionSchema);
