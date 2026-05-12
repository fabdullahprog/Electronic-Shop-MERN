"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, orderController_1.createOrder);
router.get('/my-orders', authMiddleware_1.protect, orderController_1.getMyOrders);
router.get('/admin', authMiddleware_1.protect, authMiddleware_1.admin, orderController_1.getAllOrders);
router.get('/:id', authMiddleware_1.protect, orderController_1.getOrder);
router.put('/:id/status', authMiddleware_1.protect, authMiddleware_1.admin, orderController_1.updateOrderStatus);
router.put('/:id/cancel', authMiddleware_1.protect, orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map