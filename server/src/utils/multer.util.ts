import multer from 'multer';
import { AppError } from './appError.util';
import { STATUS_CODE } from '../constants/status';
import path from 'path';
import fs from 'fs';

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp_uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images and PDFs (for certifications)
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image or PDF! Please upload only images or PDFs.', STATUS_CODE.BAD_REQUEST) as any, false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});
