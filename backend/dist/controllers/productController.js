"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = exports.getRelatedProducts = exports.getTrendingProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice, sort, page = 1, limit = 12, featured, trending, inStock } = req.query;
        const query = { isActive: true };
        if (keyword)
            query.$text = { $search: keyword };
        if (category)
            query.category = category;
        if (brand)
            query.brand = { $regex: brand, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
        }
        if (inStock === 'true')
            query.stock = { $gt: 0 };
        if (featured === 'true')
            query.isFeatured = true;
        if (trending === 'true')
            query.isTrending = true;
        const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratings: -1 }, popular: { numReviews: -1 }, newest: { createdAt: -1 } };
        const sortOption = sortMap[sort] || { createdAt: -1 };
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([Product_1.default.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(Number(limit)), Product_1.default.countDocuments(query)]);
        res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        const query = mongoose_1.default.Types.ObjectId.isValid(id)
            ? { $or: [{ _id: id }, { slug: id }], isActive: true }
            : { slug: id, isActive: true };
        const product = await Product_1.default.findOne(query).populate('category', 'name slug');
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        const product = await Product_1.default.create(req.body);
        res.status(201).json({ success: true, product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        await Product_1.default.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const getTrendingProducts = async (_req, res) => {
    try {
        const products = await Product_1.default.find({ isTrending: true, isActive: true }).populate('category', 'name').limit(5);
        res.json({ success: true, products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTrendingProducts = getTrendingProducts;
const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        const related = await Product_1.default.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).limit(8).populate('category', 'name');
        res.json({ success: true, products: related });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRelatedProducts = getRelatedProducts;
const getBrands = async (_req, res) => {
    try {
        const brands = await Product_1.default.distinct('brand', { isActive: true, brand: { $ne: '' } });
        res.json({ success: true, brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBrands = getBrands;
//# sourceMappingURL=productController.js.map