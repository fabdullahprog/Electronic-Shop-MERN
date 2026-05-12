"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImages = exports.uploadMiddleware = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
cloudinary_1.v2.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => { if (file.mimetype.startsWith('image/'))
        cb(null, true);
    else
        cb(new Error('Only images')); } }).array('images', 5);
const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files?.length) {
            res.status(400).json({ success: false, message: 'No images' });
            return;
        }
        const results = await Promise.all(files.map(file => new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_stream({ folder: 'Electronic_db', resource_type: 'image' }, (err, result) => {
                if (err || !result)
                    reject(err);
                else
                    resolve({ url: result.secure_url, public_id: result.public_id });
            }).end(file.buffer);
        })));
        res.json({ success: true, images: results });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.uploadImages = uploadImages;
const deleteImage = async (req, res) => {
    try {
        await cloudinary_1.v2.uploader.destroy(req.body.public_id);
        res.json({ success: true, message: 'Deleted' });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploadController.js.map