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
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    private readonly BCRYPT_SALT_ROUNDS = 10;
    private readonly SESSION_EXPIRY_DAYS = 7;

    constructor(
        private readonly validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService,
    ) {}

    async register(request: RegisterAuthRequest): Promise<AuthResponse> {
        const registerRequest = this.validationService.validate(
            AuthValidation.REGISTER,
            request,
        );

        await this.checkExistingUser(registerRequest);

        const hashedPassword = await bcrypt.hash(
            registerRequest.password, 
            this.BCRYPT_SALT_ROUNDS
        );

        try {
            return await this.prisma.$transaction(async (tx) => {
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
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        createdAt: true
                    }
                });

                const session = await tx.session.create({
                    data: {
                        sessionToken: uuid(),
                        userId: user.id,
                        expiresAt: this.getSessionExpiry(),
                        isActive: true,
                        lastActivity: new Date()
                    }
                });

                return {
                    ...user,
                    token: session.sessionToken,
                    isActive: true,
                    createdAt: user.createdAt.toISOString()
                };
            });
        } catch (error) {
            this.logger.error('Registration failed', { error });
            this.handlePrismaError(error);
            throw error; 
        }
    }

    async login(
        request: LoginAuthRequest,
        clientInfo: {
            ipAddress: string;
            userAgent: string;
            deviceType: string;
            browser: string;
            os: string;
        },
    ): Promise<AuthResponse> {
        const loginRequest = this.validationService.validate(
            AuthValidation.LOGIN,
            request,
        );

        const user = await this.validateCredentials(loginRequest);

        const session = await this.createSession(user.id, clientInfo);

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            token: session.sessionToken,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString()
        };
    }

    private async validateCredentials(request: LoginAuthRequest) {
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

        if (!user) {
            throw new UnauthorizedException('Username atau password salah');
        }

        const isValid = await bcrypt.compare(
            request.password, 
            user.passwordHash
        );

        if (!isValid) {
            throw new UnauthorizedException('Username atau password salah');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Akun dinonaktifkan');
        }

        return user;
    }

    private async createSession(
        userId: string,
        clientInfo?: {
            ipAddress: string;
            userAgent: string;
            deviceType: string;
            browser: string;
            os: string;
        }
    ) {
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
    
        return this.prisma.session.create({
            data: {
                sessionToken: uuid(),
                userId,
                expiresAt: this.getSessionExpiry(),
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

    private getSessionExpiry(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);
        return expiresAt;
    }

    private async checkExistingUser(request: RegisterAuthRequest) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: request.email },
                    { username: request.username }
                ]
            }
        });

        if (existing) {
            throw new ConflictException(
                existing.email === request.email 
                    ? 'Email sudah digunakan' 
                    : 'Username sudah digunakan'
            );
        }
    }

    private handlePrismaError(error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    throw new ConflictException('Unique constraint violation');
                case 'P2003':
                    throw new InternalServerErrorException('Referenced user not found');
                default:
                    throw new InternalServerErrorException('Database operation failed');
            }
        }
        throw new InternalServerErrorException('Unexpected error occurred');
    }
}