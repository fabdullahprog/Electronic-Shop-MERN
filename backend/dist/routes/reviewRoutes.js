"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, reviewController_1.createReview);
router.get('/product/:productId', reviewController_1.getProductReviews);
router.get('/admin', authMiddleware_1.protect, authMiddleware_1.admin, reviewController_1.getAllReviews);
router.delete('/:id', authMiddleware_1.protect, reviewController_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map