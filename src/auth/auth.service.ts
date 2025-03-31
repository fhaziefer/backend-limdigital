// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { AuthHelper } from './auth.helper';
import { SessionService } from '../session/session.service';
import { PrismaErrorHandler } from '../common/error/prisma.error.handler';
import { AuthValidation } from './auth.validation';
import { RegisterAuthRequest, LoginAuthRequest, AuthResponse } from '../model/auth.model';
import { ClientInfo } from '../model/session.model';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly validationService: ValidationService,
        private readonly authHelper: AuthHelper,
        private readonly sessionService: SessionService,
        private readonly errorHandler: PrismaErrorHandler,
        private readonly prisma: PrismaService,
    ) {}

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
            const user = await this.prisma.user.create({
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
}