// src/model/auth.model.ts
import { z } from 'zod';

export class RegisterAuthRequest {
    username: string;
    email: string;
    password: string;
}

export class LoginAuthRequest {
    username: string;
    password: string;
}

export class AuthResponse {
    id: string;
    username: string;
    email: string;
    token?: string;
    isActive?: boolean;
    createdAt?: string;
}

// Zod schemas
export const RegisterAuthRequestSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6)
});

export const LoginAuthRequestSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
});