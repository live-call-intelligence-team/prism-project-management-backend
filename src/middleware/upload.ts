import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        // Accept images and docs
        if (file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'text/plain' ||
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/json' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/zip' ||
            file.mimetype === 'application/x-zip-compressed' ||
            file.mimetype === 'text/markdown' ||
            file.mimetype === 'application/x-iwork-numbers-sffnumbers' ||
            file.mimetype === 'application/vnd.apple.numbers' ||
            file.mimetype === 'application/x-iwork-pages-sffpages' ||
            file.mimetype === 'application/vnd.apple.pages' ||
            file.mimetype === 'application/x-iwork-keynote-sffkey' ||
            file.mimetype === 'application/vnd.apple.keynote') {
            cb(null, true);
        } else {
            console.error(`[Upload Middleware] Rejected file type: ${file.mimetype} for file: ${file.originalname}`);
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    }
});

export default upload;
