// src/auth/auth.validation.ts
import { z, ZodType } from 'zod';

export class AuthValidation {
    // Schema validasi untuk registrasi user
    static readonly REGISTER: ZodType = z.object({
        username: z.string()
            // Validasi panjang username (3-20 karakter)
            .min(3, { message: "Username harus minimal 3 karakter" })
            .max(20, { message: "Username maksimal 20 karakter" })
            // Validasi karakter yang diperbolehkan
            .regex(
                /^[a-z0-9._]+$/,
                {
                    message: "Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)"
                }
            )
            // Validasi tidak boleh ada spasi
            .refine(val => !/\s/.test(val), {
                message: "Username tidak boleh mengandung spasi"
            })
            // Validasi tidak boleh diawali dengan . atau _
            .refine(val => !val.startsWith('.') && !val.startsWith('_'), {
                message: "Username tidak boleh diawali dengan titik atau underscore"
            })
            // Validasi tidak boleh diawali dengan angka
            .refine(val => !/^[0-9]/.test(val), {
                message: "Username tidak boleh diawali dengan angka"
            }),

        email: z.string()
            // Validasi format email standar
            .email({ message: "Format email tidak valid" })
            // Validasi regex tambahan untuk email
            .regex(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                { message: "Format email tidak diperbolehkan" }
            ),

        password: z.string()
            // Validasi panjang password minimal 8 karakter
            .min(8, { message: "Password harus minimal 8 karakter" })
            // Validasi kompleksitas password
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                {
                    message: "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka"
                }
            )
    });

    // Schema validasi untuk login user
    static readonly LOGIN: ZodType = z.object({
        username: z.string()
            // Validasi panjang username minimal 3 karakter
            .min(3, { message: "Username harus minimal 3 karakter" })
            // Validasi karakter yang diperbolehkan
            .regex(
                /^[a-z0-9._]+$/,
                {
                    message: "Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)"
                }
            )
            // Validasi tidak boleh ada spasi
            .refine(val => !/\s/.test(val), {
                message: "Username tidak boleh mengandung spasi"
            }),

        password: z.string()
            // Validasi panjang password minimal 8 karakter
            .min(8, { message: "Password harus minimal 8 karakter" })
    });

    static readonly UPDATE_PASSWORD: ZodType = z.object({
        currentPassword: z.string().min(1, {
            message: "Password saat ini harus diisi"
        }),
        newPassword: z.string()
            .min(8, {
                message: "Password baru harus minimal 8 karakter"
            })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
                message: "Password baru harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka"
            }),
        confirmPassword: z.string()
    }).superRefine((data, ctx) => {
        if (data.newPassword === data.currentPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password baru tidak boleh sama dengan password saat ini",
                path: ["newPassword"]
            });
        }

        if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Konfirmasi password tidak cocok",
                path: ["confirmPassword"]
            });
        }
    });

}