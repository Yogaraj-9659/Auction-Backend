export const me = async (req, res) => {
  res.json(req.user);
};

import Auction from "../models/Auction.js";

export const myBids = async (req, res) => {
  const auctions = await Auction.find({ "bids.user": req.user._id }).populate("product");
  const history = auctions.map(a => ({
    auctionId: a._id,
    product: a.product?.title,
    type: a.type,
    status: a.status,
    yourBids: a.bids.filter(b => String(b.user) === String(req.user._id))
  }));
  res.json(history);
};
