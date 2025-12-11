import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};

export const createTransporter = () => {
    return nodemailer.createTransport(emailConfig);
};

export const emailFrom = process.env.EMAIL_FROM || 'noreply@projectmanagement.com';
