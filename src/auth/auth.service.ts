// src/auth/auth.service.ts
import { 
    ConflictException, 
    Injectable, 
    InternalServerErrorException, 
    UnauthorizedException,
    Inject 
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.module';
import { ValidationService } from '../common/validation.service';
import { LoginAuthRequest, RegisterAuthRequest, AuthResponse } from '../model/auth.model';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt'; // Library untuk hashing password
import { v4 as uuid } from 'uuid'; // Library untuk generate unique ID
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Deklarasi class AuthService dengan decorator @Injectable untuk dependency injection
@Injectable()
export class AuthService {
    // Konstanta untuk konfigurasi
    private readonly BCRYPT_SALT_ROUNDS = 10; // Jumlah round untuk bcrypt hashing
    private readonly SESSION_EXPIRY_DAYS = 7; // Masa berlaku session dalam hari

    // Constructor dengan dependency injection
    constructor(
        private readonly validationService: ValidationService, // Service untuk validasi
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, // Logger untuk logging
        private readonly prisma: PrismaService, // Prisma service untuk database
    ) {}

    // Method untuk registrasi user baru
    async register(request: RegisterAuthRequest): Promise<AuthResponse> {
        // Validasi request menggunakan validation service
        const registerRequest = this.validationService.validate(
            AuthValidation.REGISTER,
            request,
        );

        // Cek apakah user dengan email/username sudah ada
        await this.checkExistingUser(registerRequest);

        // Hash password menggunakan bcrypt
        const hashedPassword = await bcrypt.hash(
            registerRequest.password, 
            this.BCRYPT_SALT_ROUNDS
        );

        try {
            // Gunakan transaction untuk atomic operation
            return await this.prisma.$transaction(async (tx) => {
                // Buat user baru di database
                const user = await tx.user.create({
                    data: {
                        username: registerRequest.username,
                        email: registerRequest.email,
                        passwordHash: hashedPassword,
                        isActive: true,
                        profile: {
                            create: {
                                fullName: registerRequest.username,
                            }
                        }
                    },
                    // Hanya select field yang diperlukan untuk response
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        createdAt: true
                    }
                });

                // Buat session untuk user yang baru registrasi
                const session = await tx.session.create({
                    data: {
                        sessionToken: uuid(), // Generate random token
                        userId: user.id,
                        expiresAt: this.getSessionExpiry(), // Set expiry date
                        isActive: true,
                        lastActivity: new Date()
                    }
                });

                // Return response dengan data user dan token
                return {
                    ...user,
                    token: session.sessionToken,
                    isActive: true,
                    createdAt: user.createdAt.toISOString()
                };
            });
        } catch (error) {
            // Log error jika terjadi masalah
            this.logger.error('Registration failed', { error });
            // Handle error khusus dari Prisma
            this.handlePrismaError(error);
            throw error; 
        }
    }

    // Method untuk login user
    async login(
        request: LoginAuthRequest,
        clientInfo: { // Informasi client yang login
            ipAddress: string;
            userAgent: string;
            deviceType: string;
            browser: string;
            os: string;
        },
    ): Promise<AuthResponse> {
        // Validasi request login
        const loginRequest = this.validationService.validate(
            AuthValidation.LOGIN,
            request,
        );

        // Validasi credentials user
        const user = await this.validateCredentials(loginRequest);

        // Buat session baru untuk user yang login
        const session = await this.createSession(user.id, clientInfo);

        // Return response dengan data user dan token
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            token: session.sessionToken,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString()
        };
    }

    // Method private untuk validasi credentials user
    private async validateCredentials(request: LoginAuthRequest) {
        // Cari user berdasarkan username
        const user = await this.prisma.user.findUnique({
            where: { username: request.username },
            select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
                isActive: true,
                createdAt: true
            }
        });

        // Jika user tidak ditemukan, throw error
        if (!user) {
            throw new UnauthorizedException('Username atau password salah');
        }

        // Bandingkan password yang diinput dengan hash di database
        const isValid = await bcrypt.compare(
            request.password, 
            user.passwordHash
        );

        // Jika password tidak valid, throw error
        if (!isValid) {
            throw new UnauthorizedException('Username atau password salah');
        }

        // Cek apakah akun aktif
        if (!user.isActive) {
            throw new UnauthorizedException('Akun dinonaktifkan');
        }

        return user;
    }

    // Method untuk membuat session baru
    private async createSession(
        userId: string,
        clientInfo?: { // Informasi opsional tentang client
            ipAddress: string;
            userAgent: string;
            deviceType: string;
            browser: string;
            os: string;
        }
    ) {
        // Data device yang akan disimpan
        const deviceData = {
            type: clientInfo?.deviceType,
            browser: clientInfo?.browser,
            os: clientInfo?.os,
            source: clientInfo?.userAgent.includes('PostmanRuntime') 
                ? 'postman' 
                : clientInfo?.userAgent.includes('insomnia') 
                    ? 'insomnia' 
                    : 'browser',
            detectedAt: new Date().toISOString()
        };
    
        // Buat session di database
        return this.prisma.session.create({
            data: {
                sessionToken: uuid(), // Generate random token
                userId,
                expiresAt: this.getSessionExpiry(), // Set expiry date
                ipAddress: clientInfo?.ipAddress,
                userAgent: clientInfo?.userAgent,
                deviceType: clientInfo?.deviceType,
                browser: clientInfo?.browser,
                os: clientInfo?.os,
                lastActivity: new Date(),
                isActive: true
            }
        });
    }

    // Method untuk menghitung tanggal kadaluarsa session
    private getSessionExpiry(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);
        return expiresAt;
    }

    // Method untuk mengecek apakah user sudah ada di database
    private async checkExistingUser(request: RegisterAuthRequest) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: request.email },
                    { username: request.username }
                ]
            }
        });

        // Jika user sudah ada, throw error dengan pesan sesuai field yang duplicate
        if (existing) {
            throw new ConflictException(
                existing.email === request.email 
                    ? 'Email sudah digunakan' 
                    : 'Username sudah digunakan'
            );
        }
    }

    // Method untuk menangani error khusus dari Prisma
    private handlePrismaError(error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002': // Error constraint unique violation
                    throw new ConflictException('Unique constraint violation');
                case 'P2003': // Error foreign key constraint
                    throw new InternalServerErrorException('Referenced user not found');
                default: // Error Prisma lainnya
                    throw new InternalServerErrorException('Database operation failed');
            }
        }
        // Error lainnya yang tidak diketahui
        throw new InternalServerErrorException('Unexpected error occurred');
    }
}