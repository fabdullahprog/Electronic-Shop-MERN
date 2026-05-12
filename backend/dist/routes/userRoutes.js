"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getAllUsers);
router.get('/:id', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getUser);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.updateUser);
router.post('/address', authMiddleware_1.protect, userController_1.addAddress);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map