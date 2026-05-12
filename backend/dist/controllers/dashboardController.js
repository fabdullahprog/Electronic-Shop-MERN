"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const getDashboardStats = async (_req, res) => {
    try {
        const [totalOrders, totalUsers, totalProducts, revenueAgg, recentOrders, ordersByStatus, lowStockProducts, topProducts] = await Promise.all([
            Order_1.default.countDocuments(), User_1.default.countDocuments({ role: 'user' }), Product_1.default.countDocuments({ isActive: true }),
            Order_1.default.aggregate([{ $match: { orderStatus: { $nin: ['cancelled', 'returned'] } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
            Order_1.default.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
            Order_1.default.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
            Product_1.default.find({ stock: { $lte: 5 }, isActive: true }).select('name stock images').limit(10),
            Order_1.default.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { totalSold: -1 } }, { $limit: 5 }]),
        ]);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Order_1.default.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $nin: ['cancelled', 'returned'] } } }, { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }]);
        res.json({ success: true, stats: { totalOrders, totalUsers, totalProducts, totalRevenue: revenueAgg[0]?.total || 0 }, recentOrders, ordersByStatus, monthlyRevenue, lowStockProducts, topProducts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map