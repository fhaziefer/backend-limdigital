// src/common/common.module.ts
import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
// Import services and helpers to be provided
// Import service dan helper yang akan disediakan
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { ClientHelper } from '../helpers/client.helper';
import HijriHelper from 'src/helpers/hijri.helper';
import { PrismaErrorHandler } from './error/prisma.error.handler';
import { AuthMiddleware } from './auth.middleware';

/**
 * Global Common Module that provides shared services and configurations
 * Modul Common global yang menyediakan layanan dan konfigurasi bersama
 * 
 * @Global() decorator makes all exports available application-wide
 * @Global() membuat semua ekspor tersedia di seluruh aplikasi
 */
@Global()
@Module({
    imports: [
        /**
         * Winston logger configuration (JSON format, console transport)
         * Konfigurasi logger Winston (format JSON, transport console)
         */
        WinstonModule.forRoot({
            format: winston.format.json(), // JSON output format // Format output JSON
            transports: [new winston.transports.Console()], // Log to console // Log ke console
        }),

        /**
         * Environment variables configuration
         * Konfigurasi variabel environment
         */
        ConfigModule.forRoot({
            isGlobal: true, // Available globally // Tersedia secara global
            envFilePath: '.env', // Location of env file // Lokasi file env
            validationOptions: {
                allowUnknown: true, // Allow undefined variables // Izinkan variabel tidak terdefinisi
                abortEarly: false, // Show all errors at once // Tampilkan semua error sekaligus
            },
        }),
    ],
    providers: [
        /**
         * Core application services
         * Layanan inti aplikasi
         */
        PrismaService, // Database connection service // Layanan koneksi database
        PrismaErrorHandler, // Prisma error handling service // Layanan penanganan error Prisma
        ValidationService, // Data validation service // Layanan validasi data
        ClientHelper, // Client information extraction helper // Helper ekstraksi info client
        HijriHelper, // Hijri calendar conversion helper // Helper konversi kalender Hijriah

        /**
         * Global exception filter provider
         * Penyedia filter exception global
         */
        {
            provide: APP_FILTER, // Token for global filter // Token untuk filter global
            useClass: ErrorFilter, // Use ErrorFilter class // Gunakan kelas ErrorFilter
        },
    ],
    exports: [
        /**
         * Services and helpers to be available for other modules
         * Layanan dan helper yang tersedia untuk modul lain
         */
        PrismaService,
        PrismaErrorHandler,
        ValidationService,
        ClientHelper,
        HijriHelper
    ],
})
export class CommonModule implements NestModule {
    /**
     * Configure middleware for the module
     * Mengkonfigurasi middleware untuk modul
     * 
     * @param consumer Middleware consumer instance
     *                Instance konsumen middleware
     */
    configure(consumer: MiddlewareConsumer) {
        /**
         * Apply AuthMiddleware to:
         * - All routes under /api
         * - Specific /auth/logout route
         * 
         * Terapkan AuthMiddleware ke:
         * - Semua rute di bawah /api
         * - Rute spesifik /auth/logout
         */
        consumer.apply(AuthMiddleware).forRoutes(
            { path: '/api/*', method: RequestMethod.ALL },
            { path: '/auth/logout', method: RequestMethod.DELETE }
        );
    }
}