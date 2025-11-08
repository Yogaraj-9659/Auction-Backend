import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  const { title, description, images, category, basePrice } = req.body;
  const product = await Product.create({
    seller: req.user._id, title, description, images: images || [], category, basePrice
  });
  res.json(product);
};

export const getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOneAndUpdate({ _id: id, seller: req.user._id }, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOneAndDelete({ _id: id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
