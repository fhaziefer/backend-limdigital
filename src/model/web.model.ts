// src/model/web.model.ts
// Import modul yang diperlukan
import { HttpStatus } from '@nestjs/common'; // Untuk HTTP status code
import { z } from 'zod'; // Untuk validasi schema

/**
 * Interface untuk response standar API
 * @template T Type untuk data payload
 */
export interface WebResponse<T> {
    success: boolean;    // Status keberhasilan
    code: number;        // HTTP status code
    message: string;     // Pesan untuk client
    data?: T;           // Data payload (opsional)
    errors?: unknown;    // Detail error (opsional)
    timestamp: string;   // Waktu response dalam ISO format
}

/**
 * Interface untuk metadata pagination
 */
export interface PaginationMeta {
    page: number;         // Halaman saat ini
    size: number;         // Item per halaman
    totalItems: number;   // Total seluruh item
    totalPages: number;   // Total halaman
}

/**
 * Interface untuk response list dengan pagination
 * @template T Type untuk array data items
 */
export interface WebResponseList<T> extends WebResponse<T[]> {
    meta: PaginationMeta; // Metadata pagination
}

/**
 * Builder untuk membuat response standar
 */
export class WebResponseBuilder {
    /**
     * Membuat response sukses
     * @param data Data payload
     * @param message Pesan sukses
     * @param code HTTP status code (default 200)
     */
    static success<T>(
        data: T,
        message = 'Success',
        code = HttpStatus.OK,
    ): WebResponse<T> {
        return {
            success: true,
            code,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Membuat response error
     * @param message Pesan error
     * @param code HTTP status code (default 500)
     * @param errors Detail error (opsional)
     */
    static error<T = null>(
        message: string,
        code = HttpStatus.INTERNAL_SERVER_ERROR,
        errors?: unknown,
    ): WebResponse<T> {
        return {
            success: false,
            code,
            message,
            data: null as unknown as T, // Type assertion untuk null data
            errors,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Membuat response error validasi
     * @param errors Detail error validasi
     */
    static validationError<T = null>(errors: unknown): WebResponse<T> {
        return this.error<T>('Validation failed', HttpStatus.BAD_REQUEST, errors);
    }

    /**
     * Membuat response not found
     * @param message Pesan not found (default 'Data not found')
     */
    static notFound<T = null>(message = 'Data not found'): WebResponse<T> {
        return this.error<T>(message, HttpStatus.NOT_FOUND);
    }

    /**
     * Membuat response unauthorized
     * @param message Pesan unauthorized (default 'Unauthorized')
     */
    static unauthorized<T = null>(message = 'Unauthorized'): WebResponse<T> {
        return this.error<T>(message, HttpStatus.UNAUTHORIZED);
    }
}

/**
 * Schema Zod untuk validasi response
 * @param dataSchema Schema Zod untuk data payload
 */
export const WebResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
    z.object({
        success: z.boolean(),
        code: z.number(),
        message: z.string(),
        data: dataSchema.optional(), // Data sesuai schema yang diberikan
        errors: z.unknown().optional(), // Error bisa berbagai bentuk
        timestamp: z.string(), // ISO date string
    });