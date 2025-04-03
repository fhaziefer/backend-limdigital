// src/session/session.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { v4 as uuid } from 'uuid';
import { SessionRepository } from './session.repository';
import { SessionInfo, ClientInfo } from '../model/session.model';

@Injectable()
export class SessionService implements OnModuleInit {
    // Masa berlaku session 1 hari (akan expire jam 00:00)
    private readonly SESSION_EXPIRY_DAYS = 1;
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly repository: SessionRepository,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    /**
     * Lifecycle hook - Dipanggil saat module diinisialisasi
     */
    onModuleInit() {
        this.scheduleCleanup();
    }

    /**
    * Membuat atau memperbarui session berdasarkan client info
    * @param userId ID user pemilik session
    * @param clientInfo Informasi client (opsional)
    * @returns Token session (baru atau yang sudah ada)
    */
    async createOrUpdateSession(
        userId: string,
        clientInfo?: Partial<ClientInfo>
    ): Promise<string> {
        const expiresAt = this.getSessionExpiry();  // Dapatkan waktu kadaluarsa baru

        // 1. Cari session yang sudah ada dengan client info sama
        const existingSession = await this.repository.findExistingSession(
            userId,
            clientInfo || {}
        );

        // 2. Jika session sudah ada, perbarui waktu kadaluarsa
        if (existingSession) {
            await this.repository.updateSessionExpiry(existingSession.id, expiresAt);
            this.logger.debug(`Memperbarui session yang ada: ${existingSession.id}`);
            return existingSession.sessionToken;     // Kembalikan token yang sama
        }

        // 3. Jika tidak ada, buat session baru
        const sessionToken = uuid();
        await this.repository.create({
            sessionToken,
            userId,
            expiresAt,
            isActive: true,
            lastActivity: new Date(),               // Set waktu aktivitas terakhir
            ...clientInfo                           // Spread client info
        });

        this.logger.log(`Membuat session baru untuk user: ${userId}`);
        return sessionToken;
    }

    /**
     * Invalidate all active sessions for a user
     * @param userId ID of user
     */
    async invalidateAllSessions(userId: string): Promise<void> {
        await this.repository.invalidateAllSessions(userId);
        this.logger.log(`Semua session dinonaktifkan untuk user ${userId}`);
    }

    /**
     * Menghitung waktu kadaluarsa session (jam 00:00 hari berikutnya)
     * @returns Date Waktu kadaluarsa
     */
    private getSessionExpiry(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);
        expiresAt.setHours(0, 0, 0, 0); // Reset ke tengah malam
        return expiresAt;
    }

    /**
     * Membersihkan semua session yang sudah expired
     */
    async cleanupExpiredSessions(): Promise<void> {
        try {
            const now = new Date();
            const result = await this.repository.deleteExpiredSessions(now);
            this.logger.log(`Berhasil menghapus ${result.count} session expired`);
        } catch (error) {
            this.logger.error('Gagal membersihkan session', error.stack);
        }
    }

    /**
     * Membersihkan session expired untuk user tertentu
     * @param userId ID user target
     */
    async cleanupExpiredSessionsForUser(userId: string): Promise<void> {
        try {
            const now = new Date();
            await this.repository.deleteExpiredSessionsForUser(userId, now);
        } catch (error) {
            this.logger.error(
                `Gagal membersihkan session untuk user ${userId}`,
                error.stack
            );
        }
    }

    /**
     * Menjadwalkan pembersihan session harian (jalan setiap jam 00:01)
     */
    private scheduleCleanup(): void {
        try {
            const job = new CronJob('1 0 * * *', () => this.cleanupExpiredSessions());
            this.schedulerRegistry.addCronJob('sessionCleanup', job);
            job.start();
            this.logger.log('Job pembersihan session dijadwalkan setiap jam 00:01');
        } catch (error) {
            this.logger.error('Gagal menjadwalkan pembersihan session', error.stack);
        }
    }
}