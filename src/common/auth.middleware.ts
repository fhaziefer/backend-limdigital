// src/auth/auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../common/prisma.service";
import { User } from "../model/user.model";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Middleware untuk menangani autentikasi via session token
     * @param req Request object yang akan di-attach user jika valid
     * @param res Response object
     * @param next Next function untuk melanjutkan pipeline
     * @throws UnauthorizedException Jika token tidak valid/session expired
     */
    async use(req: Request & { user?: User }, res: Response, next: NextFunction) {
        try {
            // 1. Ekstrak token dari header Authorization
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                return next(); // Lanjut tanpa user jika tidak ada token
            }

            // 2. Validasi format token (Bearer <token>)
            const [bearer, token] = authHeader.split(' ');

            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException('Invalid token format');
            }

            // 3. Cari session yang valid di database
            const session = await this.prismaService.session.findFirst({
                where: {
                    sessionToken: token,
                    isActive: true,
                    expiresAt: { gt: new Date() } // Hanya session yang belum expired
                },
                include: {
                    user: true // Include data user terkait
                }
            });

            if (!session) {
                throw new UnauthorizedException('Invalid or expired session');
            }

            // 4. Attach user ke request object
            req.user = session.user;
            next();
        } catch (error) {
            // 5. Handle error
            if (error instanceof UnauthorizedException) {
                return next(error); // Lempar error auth ke exception filter
            }

            // Log error unexpected untuk debugging
            console.error('AuthMiddleware error:', error);
            next(new UnauthorizedException('Authentication failed'));
        }
    }
}