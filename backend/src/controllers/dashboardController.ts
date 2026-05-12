import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueAgg, recentOrders, ordersByStatus, lowStockProducts, topProducts] = await Promise.all([
      Order.countDocuments(), User.countDocuments({ role: 'user' }), Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $match: { orderStatus: { $nin: ['cancelled', 'returned'] } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock images').limit(10),
      Order.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { totalSold: -1 } }, { $limit: 5 }]),
    ]);
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $nin: ['cancelled', 'returned'] } } }, { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }]);
    res.json({ success: true, stats: { totalOrders, totalUsers, totalProducts, totalRevenue: revenueAgg[0]?.total || 0 }, recentOrders, ordersByStatus, monthlyRevenue, lowStockProducts, topProducts });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};
