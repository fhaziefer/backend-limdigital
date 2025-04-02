// src/common/prisma.module.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Prisma ORM client
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Prisma Service - Database ORM service wrapper
 * Layanan Prisma - Pembungkus layanan ORM database
 *
 * @extends PrismaClient - Extends Prisma's base client
 * @implements OnModuleInit - Initializes database connection when module starts
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(
        /**
         * Injected Winston logger for database operations logging
         * Logger Winston yang diinjeksi untuk pencatatan operasi database
         */
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        super({
            /**
             * Prisma logging configuration:
             * - query: Log all SQL queries
             * - error: Log database errors
             * - info: Log informational messages
             * - warn: Log warnings
             *
             * Konfigurasi logging Prisma:
             * - query: Mencatat semua query SQL
             * - error: Mencatat error database
             * - info: Mencatat pesan informasi
             * - warn: Mencatat peringatan
             */
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
            ],
        });
    }

    /**
     * Module initialization hook
     * Establishes database connection and sets up event listeners
     *
     * Hook inisialisasi modul
     * Membuka koneksi database dan menyiapkan pendengar event
     */
    async onModuleInit() {
        // Establish database connection
        // Membuka koneksi database
        await this.$connect();

        /**
         * Query event listener
         * Logs: SQL query, parameters, and execution duration
         *
         * Pendengar event query
         * Mencatat: Query SQL, parameter, dan durasi eksekusi
         */
        this.$on('query' as never, (e: any) => {
            this.logger.debug('SQL Query: ' + e.query);
            this.logger.debug('Parameters: ' + e.params);
            this.logger.debug('Execution Time: ' + e.duration + 'ms');
        });

        /**
         * Error event listener
         * Logs database errors with stack trace
         *
         * Pendengar event error
         * Mencatat error database dengan stack trace
         */
        this.$on('error' as never, (e: any) => {
            this.logger.error('Database Error: ' + e.message, e.stack);
        });

        /**
         * Info event listener
         * Logs informational database messages
         *
         * Pendengar event info
         * Mencatat pesan informasi database
         */
        this.$on('info' as never, (e: any) => {
            this.logger.info('Database Info: ' + e.message);
        });

        /**
         * Warning event listener
         * Logs database warnings
         *
         * Pendengar event warning
         * Mencatat peringatan database
         */
        this.$on('warn' as never, (e: any) => {
            this.logger.warn('Database Warning: ' + e.message);
        });
    }

    /**
     * Module destruction hook (optional)
     * Closes database connection when application shuts down
     *
     * Hook penghancuran modul (opsional)
     * Menutup koneksi database saat aplikasi dimatikan
     */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}