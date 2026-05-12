import { Request, Response } from "express";
import Category from "../models/Category";

export const getCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cat = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    });
    if (!cat) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.json({ success: true, category: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { parent, ...rest } = req.body;

    // ---------- NEW: Validate parent ID if provided ----------
    if (parent && parent !== "") {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
        return;
      }
    }

    const catData = {
      ...rest,
      parent: parent && parent !== "" ? parent : undefined, // set to undefined (removes field) if empty
    };

    const cat = await Category.create(catData);
    res.status(201).json({ success: true, category: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { parent, ...rest } = req.body;

    // ---------- NEW: Validate parent ID and prevent self‑parent ----------
    if (parent && parent !== "") {
      if (parent === req.params.id) {
        res.status(400).json({
          success: false,
          message: "A category cannot be its own parent",
        });
        return;
      }
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
        return;
      }
    }

    const updateData = {
      ...rest,
      parent: parent && parent !== "" ? parent : undefined,
    };

    const cat = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!cat) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, category: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
