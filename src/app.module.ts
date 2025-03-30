// src/app.module.ts
// Import decorator Module dari NestJS
import { Module } from '@nestjs/common';
// Import modul-modul aplikasi
import { CommonModule } from './common/common.module'; // Modul untuk shared services
import { AuthModule } from './auth/auth.module'; // Modul untuk fitur autentikasi

@Module({
  imports: [
    CommonModule, // Modul berisi PrismaService, ValidationService, Logger, dll
    AuthModule    // Modul berisi AuthService, AuthController, dll
  ],
  controllers: [], // Tidak ada controller di root module
  providers: [],   // Tidak ada provider di root module
})
export class AppModule {}