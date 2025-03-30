// src/common/validation.service.ts
import { Injectable } from '@nestjs/common';
// Import tipe ZodType dari Zod untuk validasi schema
import { ZodType } from 'zod';

@Injectable()
export class ValidationService {
    /**
     * Method untuk validasi data terhadap schema Zod
     * @param zodType Schema Zod yang akan digunakan untuk validasi
     * @param data Data yang akan divalidasi (unknown type)
     * @returns Data yang sudah divalidasi dan di-type sesuai generic T
     * @throws ZodError jika validasi gagal
     */
    validate<T>(zodType: ZodType<T>, data: unknown): T {
        // Lakukan validasi menggunakan safeParse untuk menghindari throw langsung
        const result = zodType.safeParse(data);
        
        // Jika validasi gagal, lempar error ZodError
        if (!result.success) {
            throw result.error; 
            // Error akan ditangkap oleh ErrorFilter di layer atas
            // dan di-transform menjadi response yang user-friendly
        }
        
        // Jika validasi sukses, kembalikan data yang sudah di-type
        return result.data;
    }
}