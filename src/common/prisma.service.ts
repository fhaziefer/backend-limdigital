// src/common/prisma.module.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Client ORM Prisma
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(
        // Inject Winston logger untuk logging database
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        super({
            // Konfigurasi logging Prisma
            log: [
                { emit: 'event', level: 'query' }, // Log semua query SQL
                { emit: 'event', level: 'error' },  // Log error database
                { emit: 'event', level: 'info' },   // Log informasi
                { emit: 'event', level: 'warn' },   // Log warning
            ],
        });
    }

    // Method yang dijalankan ketika module diinisialisasi
    async onModuleInit() {
        // Membuka koneksi ke database
        await this.$connect();

        // Event listener untuk query SQL
        this.$on('query' as never, (e: any) => {
            this.logger.debug('Query: ' + e.query);       // Log query
            this.logger.debug('Params: ' + e.params);    // Log parameter
            this.logger.debug('Duration: ' + e.duration + 'ms'); // Log durasi
        });

        // Event listener untuk error database
        this.$on('error' as never, (e: any) => {
            this.logger.error('Error: ' + e.message);    // Log error
        });

        // Event listener untuk info database
        this.$on('info' as never, (e: any) => {
            this.logger.info('Info: ' + e.message);      // Log informasi
        });

        // Event listener untuk warning database
        this.$on('warn' as never, (e: any) => {
            this.logger.warn('Warning: ' + e.message);   // Log peringatan
        });
    }
}