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
     * Membuat session baru untuk user
     * @param userId ID user pemilik session
     * @param clientInfo Informasi client (opsional)
     * @returns Promise<string> Session token
     */
    async createSession(userId: string, clientInfo?: Partial<ClientInfo>): Promise<string> {
        const sessionToken = uuid();
        const expiresAt = this.getSessionExpiry();

        await this.repository.create({
            sessionToken,
            userId,
            expiresAt,
            isActive: true,
            lastActivity: new Date(),
            ...clientInfo
        });

        return sessionToken;
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