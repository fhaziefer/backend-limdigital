// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
// Import komponen-komponen auth
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
// Import modul common yang berisi shared providers
import { CommonModule } from "src/common/common.module";

// Deklarasi module dengan decorator @Module
@Module({
    // Import CommonModule yang berisi PrismaService, ValidationService, dan Logger
    imports: [CommonModule],
    
    // Providers (services) yang akan tersedia dalam module ini
    providers: [AuthService],
    
    // Controller yang termasuk dalam module ini
    controllers: [AuthController]
})
export class AuthModule {
    // Class kosong karena cukup menggunakan decorator untuk konfigurasi
}