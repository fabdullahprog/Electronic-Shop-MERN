"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, authMiddleware_1.admin, uploadController_1.uploadMiddleware, uploadController_1.uploadImages);
router.delete('/', authMiddleware_1.protect, authMiddleware_1.admin, uploadController_1.deleteImage);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map