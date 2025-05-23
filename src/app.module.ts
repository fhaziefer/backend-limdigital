// src/app.module.ts
// Import decorator Module dari NestJS
import { Module } from '@nestjs/common';
// Import modul-modul aplikasi
import { CommonModule } from './common/common.module'; // Modul untuk shared services
import { AuthModule } from './auth/auth.module'; // Modul untuk fitur autentikasi
import { SessionModule } from './session/session.module';
import { ConfigModule } from '@nestjs/config';
import { UndanganModule } from './undangan/undangan.module';
import { PdfModule } from './pdf/pdf.module';
import { StampModule } from './stamp/stamp.module';

@Module({
  imports: [
    CommonModule, // Modul berisi PrismaService, ValidationService, Logger, dll
    AuthModule,    // Modul berisi AuthService, AuthController, dll
    SessionModule, // Modul berisi SessionService, SessionRepository, dll
    ConfigModule.forRoot({
      isGlobal: true, // agar bisa diakses di seluruh aplikasi
      envFilePath: '.env' // baca file .env
    }),
    UndanganModule,
    PdfModule,
    StampModule
  ],
  controllers: [], // Tidak ada controller di root module
  providers: [],   // Tidak ada provider di root module
  exports: [StampModule, PdfModule, UndanganModule]
})
export class AppModule { }