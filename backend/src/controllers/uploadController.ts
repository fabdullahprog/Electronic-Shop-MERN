import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => { if (file.mimetype.startsWith('image/')) cb(null, true); else cb(new Error('Only images')); } }).array('images', 5);

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) { res.status(400).json({ success: false, message: 'No images' }); return; }
    const results = await Promise.all(files.map(file => new Promise<{url:string;public_id:string}>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'Electronic_db', resource_type: 'image' }, (err, result) => {
        if (err || !result) reject(err); else resolve({ url: result.secure_url, public_id: result.public_id });
      }).end(file.buffer);
    })));
    res.json({ success: true, images: results });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try { await cloudinary.uploader.destroy(req.body.public_id); res.json({ success: true, message: 'Deleted' }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
