// src/auth/auth.validation.ts
import { z, ZodType } from 'zod';

export class AuthValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string()
            .min(3, { message: "Username harus minimal 3 karakter" })
            .max(20, { message: "Username maksimal 20 karakter" })
            .regex(
                /^[a-z0-9._]+$/,
                { 
                    message: "Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)" 
                }
            )
            .refine(val => !/\s/.test(val), {
                message: "Username tidak boleh mengandung spasi"
            })
            .refine(val => !val.startsWith('.') && !val.startsWith('_'), {
                message: "Username tidak boleh diawali dengan titik atau underscore"
            })
            .refine(val => !/^[0-9]/.test(val), {
                message: "Username tidak boleh diawali dengan angka"
            }),
            
        email: z.string()
            .email({ message: "Format email tidak valid" })
            .regex(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                { message: "Format email tidak diperbolehkan" }
            ),
            
        password: z.string()
            .min(8, { message: "Password harus minimal 8 karakter" })
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                {
                    message: "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka"
                }
            )
    });

    static readonly LOGIN: ZodType = z.object({
        username: z.string()
            .min(3, { message: "Username harus minimal 3 karakter" })
            .regex(
                /^[a-z0-9._]+$/,
                { 
                    message: "Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)" 
                }
            )
            .refine(val => !/\s/.test(val), {
                message: "Username tidak boleh mengandung spasi"
            }),
            
        password: z.string()
            .min(8, { message: "Password harus minimal 8 karakter" })
    });
}