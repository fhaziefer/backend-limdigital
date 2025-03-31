// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
// Import service dan helper yang akan disediakan
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { ClientHelper } from '../helpers/client.helper';
import HijriHelper from 'src/helpers/hijri.helper';
import { PrismaErrorHandler } from './error/prisma.error.handler';

// Deklarasi module sebagai global dengan decorator @Global()
@Global()
@Module({
    imports: [
        // Konfigurasi Winston logger (JSON format, console transport)
        WinstonModule.forRoot({
            format: winston.format.json(), // Format output log sebagai JSON
            transports: [new winston.transports.Console()], // Output log ke console
        }),
        // Konfigurasi environment variables
        ConfigModule.forRoot({
            isGlobal: true, // Module tersedia global di seluruh aplikasi
            envFilePath: '.env', // Lokasi file environment
            validationOptions: {
                allowUnknown: true, // Izinkan variabel yang tidak didefinisikan
                abortEarly: false, // Tampilkan semua error sekaligus
            },
        }),
    ],
    providers: [
        PrismaService, // Service untuk koneksi database Prisma
        PrismaErrorHandler, // Service untuk error Prisma
        ValidationService, // Service untuk validasi data
        ClientHelper, // Helper untuk ekstrak info client
        HijriHelper, // Helper untuk konversi kalender Hijriah
        // Global error filter untuk menangani semua exception
        {
            provide: APP_FILTER,
            useClass: ErrorFilter,
        },
    ],
    exports: [
        // Service dan helper yang bisa diakses oleh modul lain
        PrismaService,
        PrismaErrorHandler,
        ValidationService,
        ClientHelper,
        HijriHelper
    ],
})
export class CommonModule { }