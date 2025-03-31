// src/auth/auth.helper.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterAuthRequest, LoginAuthRequest } from '../model/auth.model';

@Injectable()
export class AuthHelper {
    // Jumlah round untuk bcrypt hashing
    private readonly BCRYPT_SALT_ROUNDS = 10;

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Validasi kredensial login user
     * @param request Data login (username dan password)
     * @throws UnauthorizedException Jika kredensial tidak valid
     * @returns User data jika valid
     */
    async validateCredentials({ username, password }: LoginAuthRequest) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: { 
                id: true, 
                username: true, 
                email: true, 
                passwordHash: true, 
                isActive: true, 
                createdAt: true 
            },
        });

        // Cek keberadaan user dan kecocokan password
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException('Username atau password salah');
        }

        // Cek status aktif user
        if (!user.isActive) {
            throw new UnauthorizedException('Akun dinonaktifkan');
        }

        return user;
    }

    /**
     * Cek keberadaan user dengan email/username yang sama
     * @param request Data register user
     * @throws ConflictException Jika data sudah ada
     */
    async checkExistingUser({ email, username }: RegisterAuthRequest) {
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existing) {
            throw new ConflictException(
                existing.email === email 
                    ? 'Email sudah digunakan' 
                    : 'Username sudah terdaftar'
            );
        }
    }

    /**
     * Hash password menggunakan bcrypt
     * @param password Password plaintext
     * @returns Password yang sudah di-hash
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
    }
}