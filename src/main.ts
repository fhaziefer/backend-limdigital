// src/main.ts
// Import core NestJS factory dan module
import { NestFactory } from '@nestjs/core';
// Import root application module
import { AppModule } from './app.module';
// Import Winston logger provider
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  // 1. Membuat instance aplikasi NestJS
  const app = await NestFactory.create(AppModule);

  // 2. Konfigurasi logger global
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER); // Dapatkan logger instance
  app.useLogger(logger); // Set logger sebagai logger global aplikasi

  // 4. Setting Cors
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  // 4. Start aplikasi
  await app.listen(process.env.PORT ?? 3000); // Gunakan PORT dari env atau default 3000
  
  // 5. Log informasi startup
  console.log(`App running on PORT: ${process.env.PORT || 3000}`);
}

// 5. Jalankan aplikasi
bootstrap();