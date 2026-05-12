"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discountController_1 = require("../controllers/discountController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/validate', authMiddleware_1.protect, discountController_1.validateCoupon);
router.get('/', authMiddleware_1.protect, authMiddleware_1.admin, discountController_1.getDiscounts);
router.post('/', authMiddleware_1.protect, authMiddleware_1.admin, discountController_1.createDiscount);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.admin, discountController_1.updateDiscount);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.admin, discountController_1.deleteDiscount);
exports.default = router;
//# sourceMappingURL=discountRoutes.js.map