import multer from 'multer';
import { Request } from 'express';
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

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype.startsWith('audio/')
    ) {
        cb(null, true);
    } else {
        const error = new AppError('Not an image, PDF, or audio file! Please upload only supported formats.', STATUS_CODE.BAD_REQUEST);
        (cb as (err: Error | null, success: boolean) => void)(error as unknown as Error, false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024, 
    },
    fileFilter: fileFilter,
});
