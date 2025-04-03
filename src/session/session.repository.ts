// src/session/session.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SessionInfo } from '../model/session.model';
import { ClientInfo } from '../model/session.model';

@Injectable()
export class SessionRepository {
    constructor(private readonly prisma: PrismaService) { }

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

    /**
 * Mencari session yang sudah ada dengan client info yang sama
 * @param userId ID user pemilik session
 * @param clientInfo Informasi client untuk dicocokkan
 * @returns Session yang aktif dan belum expired, atau null jika tidak ditemukan
 */
    async findExistingSession(userId: string, clientInfo: Partial<ClientInfo>) {
        return this.prisma.session.findFirst({
            where: {
                userId,
                ipAddress: clientInfo.ipAddress,       // Cocokkan IP Address
                userAgent: clientInfo.userAgent,       // Cocokkan User Agent
                deviceType: clientInfo.deviceType,     // Cocokkan Tipe Device
                browser: clientInfo.browser,           // Cocokkan Browser
                os: clientInfo.os,                     // Cocokkan Sistem Operasi
                isActive: true,                        // Hanya session aktif
                expiresAt: { gt: new Date() }          // Hanya yang belum expired
            }
        });
    }

    /**
     * Memperbarui waktu kadaluarsa session
     * @param sessionId ID session yang akan diperbarui
     * @param expiresAt Waktu kadaluarsa baru
     * @returns Session yang sudah diperbarui
     */
    async updateSessionExpiry(sessionId: number, expiresAt: Date) {
        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                expiresAt,                            // Update waktu kadaluarsa
                lastActivity: new Date()              // Update waktu aktivitas terakhir
            }
        });
    }

    /**
    * Mark all active sessions as inactive for a user
    * @param userId ID of user
    */
    async invalidateAllSessions(userId: string): Promise<{ count: number }> {
        return this.prisma.session.updateMany({
            where: {
                userId,
                isActive: true
            },
            data: {
                isActive: false,
                expiresAt: new Date() // Force immediate expiration
            }
        });
    }

}