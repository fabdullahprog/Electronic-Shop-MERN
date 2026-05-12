import { Request, Response } from 'express';
import Product from '../models/Product';
import mongoose from 'mongoose';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, sort, page = 1, limit = 12, featured, trending, inStock } = req.query;
    const query: Record<string, unknown> = { isActive: true };
    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) { query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) }; }
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;
    const sortMap: Record<string, object> = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratings: -1 }, popular: { numReviews: -1 }, newest: { createdAt: -1 } };
    const sortOption = sortMap[sort as string] || { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([Product.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(Number(limit)), Product.countDocuments(query)]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { slug: id }], isActive: true }
      : { slug: id, isActive: true };
    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
    res.json({ success: true, product });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try { const product = await Product.create(req.body); res.status(201).json({ success: true, product }); }
  catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
    res.json({ success: true, product });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const getTrendingProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isTrending: true, isActive: true }).populate('category', 'name').limit(5);
    res.json({ success: true, products });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).limit(8).populate('category', 'name');
    res.json({ success: true, products: related });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try { const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: '' } }); res.json({ success: true, brands }); }
  catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};
