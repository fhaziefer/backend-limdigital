// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
// Import auth components
// Import komponen-komponen auth
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
// Import common module containing shared providers
// Import modul common yang berisi shared providers
import { CommonModule } from "../common/common.module";
import { AuthHelper } from "./auth.helper";
import { SessionModule } from "../session/session.module";

/**
 * Auth Module - Responsible for authentication related functionality
 * Modul Auth - Bertanggung jawab untuk fungsionalitas terkait autentikasi
 * 
 * @Module decorator defines:
 * - imports: modules that export providers required in this module
 * - providers: services that will be instantiated by Nest injector
 * - controllers: controllers that belong to this module
 * 
 * Decorator @Module mendefinisikan:
 * - imports: modul yang mengekspor provider yang dibutuhkan
 * - providers: layanan yang akan diinstansiasi oleh Nest injector
 * - controllers: controller yang termasuk dalam modul ini
 */
@Module({
    /**
     * Imported Modules:
     * - CommonModule: provides shared services (Prisma, Validation, Logger)
     * - SessionModule: provides session management functionality
     * 
     * Modul yang Diimpor:
     * - CommonModule: menyediakan layanan bersama (Prisma, Validasi, Logger)
     * - SessionModule: menyediakan fungsi manajemen sesi
     */
    imports: [CommonModule, SessionModule],

    /**
     * Module Providers:
     * - AuthService: main authentication service
     * - AuthHelper: authentication helper utilities
     * 
     * Provider Modul:
     * - AuthService: layanan autentikasi utama
     * - AuthHelper: utilitas bantuan autentikasi
     */
    providers: [AuthService, AuthHelper],

    /**
     * Module Exports (if needed):
     * - AuthService: if other modules need to use it
     * 
     * Ekspor Modul (jika diperlukan):
     * - AuthService: jika modul lain perlu menggunakannya
     */
    exports: [AuthService],

    /**
     * Module Controllers:
     * - AuthController: handles authentication HTTP endpoints
     * 
     * Kontroller Modul:
     * - AuthController: menangani endpoint HTTP autentikasi
     */
    controllers: [AuthController]
})
export class AuthModule {
    /**
     * Empty class - all configuration is done through decorators
     * Kelas kosong - semua konfigurasi dilakukan melalui decorator
     * 
     * Note: NestJS modules are primarily configured through the @Module decorator
     * Catatan: Modul NestJS terutama dikonfigurasi melalui decorator @Module
     */
}