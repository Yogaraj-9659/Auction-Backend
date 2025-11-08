import Auction from "../models/Auction.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendEmail } from "../config/email.js";

// Helper: notify outbid bidder (simple)
const notifyOutbid = async (prevBidUserId, auction, newAmount) => {
  try {
    const user = await User.findById(prevBidUserId);
    if (!user?.email) return;
    await sendEmail({
      to: user.email,
      subject: "You were outbid",
      text: `Your bid was outbid on "${auction.product}" with a new bid of ₹${newAmount}.`
    });
  } catch (e) {
    console.log("Notify outbid failed:", e.message);
  }
};

export const listAuctions = async (_req, res) => {
  const auctions = await Auction.find({}).populate("product").sort({ createdAt: -1 });
  res.json(auctions);
};

export const getAuction = async (req, res) => {
  const a = await Auction.findById(req.params.id).populate("product").populate("bids.user", "name email");
  if (!a) return res.status(404).json({ message: "Not found" });
  // Hide amounts for sealed bids (only show bid count and if current user is seller or after close you can show summary - keeping simple)
  res.json(a);
};

export const createAuction = async (req, res) => {
  const { productId, type, startPrice, reservePrice, category, endsAt } = req.body;
  const product = await Product.findOne({ _id: productId, seller: req.user._id });
  if (!product) return res.status(404).json({ message: "Product not found" });
  const auction = await Auction.create({
    product: product._id,
    seller: req.user._id,
    type: type || "traditional",
    startPrice: startPrice || product.basePrice || 0,
    reservePrice: reservePrice || 0,
    currentPrice: startPrice || 0,
    category,
    endsAt
  });
  res.json(auction);
};

export const placeBid = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const auction = await Auction.findById(id).populate("product");
  if (!auction) return res.status(404).json({ message: "Auction not found" });
  if (auction.status !== "open") return res.status(400).json({ message: "Auction closed" });
  if (auction.endsAt && new Date(auction.endsAt) < new Date()) return res.status(400).json({ message: "Auction expired" });

  const lastBid = auction.bids[auction.bids.length - 1];
  const lastBidAmount = lastBid?.amount ?? (auction.type === "reverse" ? Infinity : auction.currentPrice);

  // Simple logic per type
  if (auction.type === "traditional") {
    if (amount <= (auction.currentPrice || 0)) return res.status(400).json({ message: "Bid must be higher than current price" });
  } else if (auction.type === "reverse") {
    if (amount >= (isFinite(lastBidAmount) ? lastBidAmount : auction.currentPrice || Number.MAX_SAFE_INTEGER))
      return res.status(400).json({ message: "Bid must be lower than current price" });
  } else if (auction.type === "sealed") {
    // Allow any positive bid; evaluation happens at close
    if (amount <= 0) return res.status(400).json({ message: "Bid must be positive" });
  }

  // Notify previous highest/lowest bidder (skip for first bid)
  if (lastBid && auction.type !== "sealed") {
    await notifyOutbid(lastBid.user, auction, amount);
  }

  auction.bids.push({ user: req.user._id, amount });
  // Update current price for live types
  if (auction.type !== "sealed") {
    auction.currentPrice = amount;
  }
  await auction.save();
  res.json({ message: "Bid placed", auctionId: auction._id });
};

export const closeAuction = async (req, res) => {
  const { id } = req.params;
  const auction = await Auction.findOne({ _id: id, seller: req.user._id }).populate("bids.user", "email name");
  if (!auction) return res.status(404).json({ message: "Auction not found" });
  if (auction.status === "closed") return res.status(400).json({ message: "Already closed" });

  auction.status = "closed";

  // Determine winner
  let winner = null;
  if (auction.type === "traditional") {
    winner = auction.bids.sort((a,b)=>b.amount-a.amount)[0];
  } else if (auction.type === "reverse") {
    winner = auction.bids.sort((a,b)=>a.amount-b.amount)[0];
  } else if (auction.type === "sealed") {
    // Evaluate best bid without having exposed them during auction
    winner = auction.bids.sort((a,b)=>b.amount-a.amount)[0];
  }
  await auction.save();

  if (winner?.user?.email) {
    await sendEmail({
      to: winner.user.email,
      subject: "You won the auction!",
      text: `Congrats! You won the auction for product "${auction.product}" with bid ₹${winner.amount}`
    });
  }

  res.json({ message: "Auction closed", winner: winner ? { user: winner.user, amount: winner.amount } : null });
};
