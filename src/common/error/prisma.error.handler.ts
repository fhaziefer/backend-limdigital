// src/common/error/prisma.error.handler.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaErrorHandler {
    /**
     * Handle error khusus dari Prisma
     * @param error Error object
     * @throws ConflictException Untuk error duplikasi data
     * @throws InternalServerErrorException Untuk error database lainnya
     */
    handle(error: unknown): never {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002': // Violasi constraint unik
                    throw new ConflictException('Data sudah terdaftar');
                case 'P2003': // Violasi foreign key
                    throw new InternalServerErrorException('Referensi data tidak valid');
                default: // Error Prisma lainnya
                    throw new InternalServerErrorException('Kesalahan database');
            }
        }
        // Re-throw error yang tidak dikenali
        throw error; 
    }
}