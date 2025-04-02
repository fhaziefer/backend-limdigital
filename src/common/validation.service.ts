// src/common/validation.service.ts
import { Injectable } from '@nestjs/common';
import { ZodType, ZodError } from 'zod'; // Zod schema validation types

/**
 * Validation Service - Handles data validation using Zod schemas
 * Layanan Validasi - Menangani validasi data menggunakan skema Zod
 * 
 * @Injectable decorator makes this service available for dependency injection
 * Decorator @Injectable membuat layanan ini tersedia untuk dependency injection
 */
@Injectable()
export class ValidationService {
    /**
     * Validates data against a Zod schema
     * Memvalidasi data terhadap skema Zod
     * 
     * @template T - The expected type after validation
     *              Tipe yang diharapkan setelah validasi
     * @param zodType - Zod schema definition
     *                 Definisi skema Zod
     * @param data - Unknown data to be validated
     *              Data yang akan divalidasi (tipe unknown)
     * @returns Validated data of type T
     *          Data yang sudah divalidasi dengan tipe T
     * @throws {ZodError} When validation fails
     *                   Ketika validasi gagal
     * 
     * @example
     * // Example usage:
     * // Contoh penggunaan:
     * const userSchema = z.object({
     *   username: z.string(),
     *   age: z.number()
     * });
     * 
     * const validated = validationService.validate(userSchema, inputData);
     */
    validate<T>(zodType: ZodType<T>, data: unknown): T {
        /**
         * Safe parsing prevents direct throwing of errors
         * Parsing aman mencegah error langsung terlempar
         */
        const result = zodType.safeParse(data);
        
        /**
         * If validation fails, throw the ZodError
         * which will be caught by the global ErrorFilter
         * 
         * Jika validasi gagal, lempar ZodError
         * yang akan ditangkap oleh ErrorFilter global
         */
        if (!result.success) {
            throw result.error;
        }
        
        /**
         * Return the validated and typed data
         * Mengembalikan data yang sudah divalidasi dan di-typed
         */
        return result.data;
    }

    /**
     * Async version of validate for promise-based schemas
     * Versi async dari validate untuk skema berbasis promise
     * 
     * @param zodType - Zod schema that may contain async refinements
     *                 Skema Zod yang mungkin mengandung refinements async
     */
    async validateAsync<T>(zodType: ZodType<T>, data: unknown): Promise<T> {
        const result = await zodType.safeParseAsync(data);
        
        if (!result.success) {
            throw result.error;
        }
        
        return result.data;
    }

    /**
     * Partial validation that returns validation success/failure
     * without throwing exceptions
     * 
     * Validasi parsial yang mengembalikan status sukses/gagal
     * tanpa melempar exception
     */
    tryValidate<T>(zodType: ZodType<T>, data: unknown): 
        { success: true; data: T } | { success: false; error: ZodError } {
        const result = zodType.safeParse(data);
        return result.success 
            ? { success: true, data: result.data }
            : { success: false, error: result.error };
    }
}