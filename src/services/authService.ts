import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { jwtConfig } from '../config/jwt';
import { JwtPayload } from '../types/interfaces';

export class AuthService {
    // Generate access token
    static generateAccessToken(userId: string, email: string, role: string, orgId: string): string {
        const payload = { userId, email, role, orgId };
        // @ts-ignore - JWT library type mismatch with expiresIn
        const options: SignOptions = { expiresIn: jwtConfig.accessExpiry };
        return jwt.sign(payload, jwtConfig.accessSecret, options);
    }

    // Generate refresh token
    static generateRefreshToken(userId: string): string {
        const payload = { userId };
        // @ts-ignore - JWT library type mismatch with expiresIn
        const options: SignOptions = { expiresIn: jwtConfig.refreshExpiry };
        return jwt.sign(payload, jwtConfig.refreshSecret, options);
    }

    // Verify refresh token
    static verifyRefreshToken(token: string): JwtPayload {
        return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
    }

    // Store refresh token
    static async storeRefreshToken(user: User, token: string): Promise<void> {
        user.refreshToken = token;
        await user.save();
    }

    // Revoke refresh token
    static async revokeRefreshToken(user: User): Promise<void> {
        user.refreshToken = undefined;
        await user.save();
    }

    // Generate password reset token
    static generatePasswordResetToken(): string {
        const payload = { purpose: 'password-reset' };
        const options: SignOptions = { expiresIn: '1h' };
        return jwt.sign(payload, jwtConfig.accessSecret, options);
    }

    // Verify password reset token
    static verifyPasswordResetToken(token: string): JwtPayload {
        return jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;
    }

    // Generate MFA token
    static generateMFAToken(userId: string): string {
        const payload = { userId, mfa: true };
        const options: SignOptions = { expiresIn: '5m' };
        return jwt.sign(payload, jwtConfig.accessSecret, options);
    }

    // Verify MFA token
    static verifyMFAToken(token: string): JwtPayload {
        return jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;
    }
}
