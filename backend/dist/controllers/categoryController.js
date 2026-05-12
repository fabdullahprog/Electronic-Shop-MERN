"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true }).populate('parent', 'name slug').sort({ order: 1, name: 1 });
        res.json({ success: true, categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res) => {
    try {
        const cat = await Category_1.default.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
        if (!cat) {
            res.status(404).json({ success: false, message: 'Not found' });
            return;
        }
        res.json({ success: true, category: cat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategory = getCategory;
const createCategory = async (req, res) => {
    try {
        const cat = await Category_1.default.create(req.body);
        res.status(201).json({ success: true, category: cat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const cat = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, category: cat });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        await Category_1.default.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map