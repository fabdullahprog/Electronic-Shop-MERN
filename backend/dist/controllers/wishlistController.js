"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.getWishlist = void 0;
const User_1 = __importDefault(require("../models/User"));
const getWishlist = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).populate('wishlist');
        res.json({ success: true, wishlist: user?.wishlist || [] });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getWishlist = getWishlist;
const toggleWishlist = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        const productId = req.params.productId;
        const index = user.wishlist.findIndex(id => id.toString() === productId);
        let action;
        if (index > -1) {
            user.wishlist.splice(index, 1);
            action = 'removed';
        }
        else {
            user.wishlist.push(productId);
            action = 'added';
        }
        await user.save();
        res.json({ success: true, action, wishlist: user.wishlist });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.toggleWishlist = toggleWishlist;
//# sourceMappingURL=wishlistController.js.map