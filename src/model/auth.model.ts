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