// src/common/error/prisma.error.handler.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaErrorHandler {
    /**
     * Handle specific errors from Prisma
     * @param error Error object
     * @throws ConflictException for duplicate data errors
     * @throws InternalServerErrorException for other database errors
     */
    handle(error: unknown): never {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002': // Unique constraint violation
                    throw new ConflictException('Data already exists');
                case 'P2003': // Foreign key constraint violation
                    throw new InternalServerErrorException('Invalid data reference');
                default: // Other Prisma errors
                    throw new InternalServerErrorException('Database error occurred');
            }
        }
        // Re-throw unrecognized errors
        throw error; 
    }
}