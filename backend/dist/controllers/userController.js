"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddress = exports.getUser = exports.updateUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};
        if (search)
            query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        const [users, total] = await Promise.all([User_1.default.find(query).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)), User_1.default.countDocuments(query)]);
        res.json({ success: true, users, total });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getAllUsers = getAllUsers;
const updateUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, user });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.updateUser = updateUser;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getUser = getUser;
const addAddress = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        if (req.body.isDefault)
            user.addresses.forEach(a => { a.isDefault = false; });
        user.addresses.push(req.body);
        await user.save();
        res.json({ success: true, addresses: user.addresses });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.addAddress = addAddress;
//# sourceMappingURL=userController.js.map