// src/session/session.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.module';
import { SessionInfo } from '../model/session.model';

@Injectable()
export class SessionRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Membuat session baru di database
     * @param data Data session tanpa ID dan createdAt (akan diisi otomatis)
     * @returns Promise<SessionInfo> Data session yang baru dibuat
     */
    async create(data: Omit<SessionInfo, 'id' | 'createdAt'>): Promise<SessionInfo> {
        return this.prisma.session.create({ 
            data: {
                ...data,
                createdAt: new Date(),
                lastActivity: new Date()
            } 
        });
    }

    /**
     * Menghapus semua session yang sudah expired
     * @param date Batas waktu expired
     * @returns Promise<{count: number}> Jumlah session yang dihapus
     */
    async deleteExpiredSessions(date: Date): Promise<{ count: number }> {
        return this.prisma.session.deleteMany({
            where: { expiresAt: { lte: date } },
        });
    }

    /**
     * Menghapus session expired untuk user tertentu
     * @param userId ID user target
     * @param date Batas waktu expired
     * @returns Promise<{count: number}> Jumlah session yang dihapus
     */
    async deleteExpiredSessionsForUser(userId: string, date: Date): Promise<{ count: number }> {
        return this.prisma.session.deleteMany({
            where: { userId, expiresAt: { lte: date } },
        });
    }
}