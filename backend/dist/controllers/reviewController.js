"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = exports.deleteReview = exports.getProductReviews = exports.createReview = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const Order_1 = __importDefault(require("../models/Order"));
const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const existing = await Review_1.default.findOne({ product: productId, user: req.user._id });
        if (existing) {
            res.status(400).json({ success: false, message: 'Already reviewed' });
            return;
        }
        const hasPurchased = await Order_1.default.findOne({ user: req.user._id, 'items.product': productId, orderStatus: 'delivered' });
        const review = await Review_1.default.create({ product: productId, user: req.user._id, rating, title, comment, isVerifiedPurchase: !!hasPurchased });
        res.status(201).json({ success: true, review });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.createReview = createReview;
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review_1.default.find({ product: req.params.productId, isApproved: true }).populate('user', 'name avatar').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getProductReviews = getProductReviews;
const deleteReview = async (req, res) => {
    try {
        const review = await Review_1.default.findById(req.params.id);
        if (!review) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await review.deleteOne();
        res.json({ success: true, message: 'Deleted' });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.deleteReview = deleteReview;
const getAllReviews = async (_req, res) => {
    try {
        const reviews = await Review_1.default.find().populate('user', 'name email').populate('product', 'name').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getAllReviews = getAllReviews;
//# sourceMappingURL=reviewController.js.map