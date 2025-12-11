import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadConfig } from '../config/app';
import { AppError } from '../middleware/errorHandler';
import { FileUpload } from '../types/interfaces';

export class FileService {
    private static uploadDir = uploadConfig.uploadDir;

    // Ensure upload directory exists
    static ensureUploadDir(): void {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // Configure multer storage
    static getStorage() {
        this.ensureUploadDir();

        return multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (_req, file, cb) => {
                const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            },
        });
    }

    // File filter
    static fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
        const allowedTypes = uploadConfig.allowedFileTypes;

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`File type ${file.mimetype} is not allowed`, 400));
        }
    }

    // Get multer upload middleware
    static getUploadMiddleware() {
        return multer({
            storage: this.getStorage(),
            fileFilter: this.fileFilter,
            limits: {
                fileSize: uploadConfig.maxFileSize,
            },
        });
    }

    // Process uploaded file
    static processUploadedFile(file: Express.Multer.File): FileUpload {
        return {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/uploads/${file.filename}`,
        };
    }

    // Delete file
    static deleteFile(filename: string): void {
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // Get file path
    static getFilePath(filename: string): string {
        return path.join(this.uploadDir, filename);
    }

    // Check if file exists
    static fileExists(filename: string): boolean {
        return fs.existsSync(this.getFilePath(filename));
    }
}
