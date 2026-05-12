"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/trending', productController_1.getTrendingProducts);
router.get('/brands', productController_1.getBrands);
router.get('/:id/related', productController_1.getRelatedProducts);
router.get('/:id', productController_1.getProduct);
router.post('/', authMiddleware_1.protect, authMiddleware_1.admin, productController_1.createProduct);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.admin, productController_1.updateProduct);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.admin, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map