// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';
import { ValidationService } from '../common/validation.service';
import { AuthHelper } from './auth.helper';
import { SessionService } from '../session/session.service';
import { PrismaErrorHandler } from '../common/error/prisma.error.handler';
import { AuthValidation } from './auth.validation';
import { RegisterAuthRequest, LoginAuthRequest, AuthResponse, LogoutResponse, UpdatePasswordRequest, UpdatePasswordResponse } from '../model/auth.model';
import { ClientInfo } from '../model/session.model';
import * as otpGenerator from 'otp-generator';
import { MailService } from '../common/mail.service';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly OTP_LENGTH = 6;
    private readonly OTP_EXPIRY_MINUTES = 15;
    constructor(
        private readonly validationService: ValidationService,
        private readonly authHelper: AuthHelper,
        private readonly sessionService: SessionService,
        private readonly errorHandler: PrismaErrorHandler,
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Proses registrasi user baru
     * @param request Data registrasi user
     * @returns Data user yang berhasil registrasi
     * @throws ConflictException Jika email/username sudah digunakan
     * @throws InternalServerErrorException Jika terjadi kesalahan database
     */
    async register(request: RegisterAuthRequest, clientInfo: ClientInfo): Promise<AuthResponse> {
        // Validasi input
        const validated = this.validationService.validate(
            AuthValidation.REGISTER,
            request
        );

        // Cek keberadaan user
        await this.authHelper.checkExistingUser(validated);

        try {
            // Hash password
            const hashedPassword = await this.authHelper.hashPassword(validated.password);

            // Buat user baru
            const user = await this.prismaService.user.create({
                data: {
                    username: validated.username,
                    email: validated.email,
                    passwordHash: hashedPassword,
                    isActive: true,
                    profile: { create: { fullName: validated.username } }
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true
                }
            });

            // Buat session
            const token = await this.sessionService.createOrUpdateSession(user.id, clientInfo);

            return {
                ...user,
                token,
                isActive: true,
                createdAt: user.createdAt.toISOString()
            };
        } catch (error) {
            // Handle error khusus dari Prisma
            this.errorHandler.handle(error);
        }
    }

    /**
     * Proses login user
     * @param request Data login user
     * @param clientInfo Informasi device/client
     * @returns Data user + token session
     * @throws UnauthorizedException Jika kredensial salah/akun tidak aktif
     */
    async login(
        request: LoginAuthRequest,
        clientInfo: ClientInfo
    ): Promise<AuthResponse> {
        // Validasi input
        const validated = this.validationService.validate(
            AuthValidation.LOGIN,
            request
        );

        // Validasi kredensial
        const user = await this.authHelper.validateCredentials(validated);

        // Bersihkan session expired user ini
        await this.sessionService.cleanupExpiredSessionsForUser(user.id);

        // Buat session baru
        const token = await this.sessionService.createOrUpdateSession(user.id, clientInfo);

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            token,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString()
        };
    }

    /**
    * Logout user by invalidating session token
    * @param userId ID of the user to logout
    * @param sessionToken Session token to invalidate
    * @param clientInfo Client information (optional)
    * @returns Logout response
    * @throws UnauthorizedException if session is invalid
    */
    async logout(
        userId: string,
        sessionToken: string,
        clientInfo: ClientInfo
    ): Promise<LogoutResponse> {
        try {
            // Remove Bearer prefix if present
            const token = sessionToken.replace('Bearer ', '');

            // Delete the session from database
            const deletedSession = await this.prismaService.session.deleteMany({
                where: {
                    userId,
                    sessionToken: token,
                    isActive: true
                }
            });

            if (deletedSession.count === 0) {
                throw new UnauthorizedException('Invalid or expired session');
            }

            return {
                success: true,
                message: 'Logout successful',
                timestamp: new Date().toISOString(),
                sessionToken: token
            };
        } catch (error) {
            this.errorHandler.handle(error);
        }
    }

    /**
     * Update user password and return new session token
     * @param userId ID of user changing password
     * @param request Password update data
     * @param clientInfo Client information
     * @returns AuthResponse with new token
     * @throws UnauthorizedException if current password is invalid
     * @throws BadRequestException if validation fails
     */
    async updatePassword(
        userId: string,
        request: UpdatePasswordRequest,
        clientInfo: ClientInfo
    ): Promise<UpdatePasswordResponse> {
        try {
            // Validasi input
            const validated = this.validationService.validate(
                AuthValidation.UPDATE_PASSWORD,
                request
            );

            // Get user with password hash
            const user = await this.prismaService.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    passwordHash: true,
                    isActive: true,
                    createdAt: true,
                    passwordChangedAt: true
                }
            });

            if (!user) {
                throw new UnauthorizedException('User tidak ditemukan');
            }

            // Verify current password
            const isPasswordValid = await this.authHelper.verifyPassword(
                validated.currentPassword,
                user.passwordHash
            );

            if (!isPasswordValid) {
                throw new UnauthorizedException('Password saat ini salah');
            }

            // Validasi password baru tidak sama dengan yang lama
            const isNewPasswordSame = await this.authHelper.verifyPassword(
                validated.newPassword,
                user.passwordHash
            );

            if (isNewPasswordSame) {
                throw new BadRequestException('Password baru tidak boleh sama dengan password saat ini');
            }

            // Hash new password
            const newPasswordHash = await this.authHelper.hashPassword(validated.newPassword);

            // Update password
            await this.prismaService.user.update({
                where: { id: userId },
                data: {
                    passwordHash: newPasswordHash,
                    passwordChangedAt: new Date()
                }
            });

            // Invalidate all old sessions and create new one
            await this.sessionService.invalidateAllSessions(userId);
            const newToken = await this.sessionService.createOrUpdateSession(userId, clientInfo);

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                token: newToken,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
                passwordChangedAt: user.passwordChangedAt?.toISOString()
            };
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = {};
                error.errors.forEach(err => {
                    const path = err.path.join('.');
                    validationErrors[path] = err.message;
                });

                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Validasi gagal',
                    errors: validationErrors
                });
            }
            this.errorHandler.handle(error);
        }
    }

    // Generate OTP dan simpan ke database
    private async generateAndSaveOtp(userId: string): Promise<string> {
        const otp = otpGenerator.generate(this.OTP_LENGTH, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

        // Get user
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
                emailVerified: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        await this.prismaService.user.update({
            where: { id: user.id },
            data: {
                verificationToken: otp,
                verificationExpires: expiresAt,
            },
        });

        return otp;
    }

    // Kirim email verifikasi
    async sendVerificationEmail(userId: string): Promise<void> {
        const otp = await this.generateAndSaveOtp(userId);
        const appName = this.configService.get<string>('APP_NAME');

        // Get user
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
                emailVerified: true,
                profile: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        await this.mailService.sendEmail(
            user.email,
            'Test',
            'verification',
            {
                username: user.profile?.fullName,
                otp,
                expiryMinutes: this.OTP_EXPIRY_MINUTES,
                appName,
                currentYear: new Date().getFullYear()
            }
        );
    }

    // Verifikasi OTP
    async verifyEmail(userId: string, otp: string): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });

        // Validasi: pastikan user, verificationToken, dan verificationExpires ada
        if (
            !user ||
            !user.verificationToken ||
            !user.verificationExpires ||
            user.verificationToken !== otp
        ) {
            return false;
        }

        // Validasi: cek apakah OTP sudah kadaluarsa
        if (new Date(user.verificationExpires) < new Date()) {
            return false;
        }

        // Update status verifikasi
        await this.prismaService.user.update({
            where: { email: user.email },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationExpires: null,
            },
        });

        return true;
    }

    // Cek status verifikasi
    async checkVerificationStatus(userId: string): Promise<{ verified: boolean }> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true },
        });

        return { verified: user?.emailVerified || false };
    }

}