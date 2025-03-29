// src/auth/auth.validation.ts
import { RegisterAuthRequestSchema, LoginAuthRequestSchema } from '../model/auth.model';

export class AuthValidation {
    static readonly REGISTER = RegisterAuthRequestSchema;
    static readonly LOGIN = LoginAuthRequestSchema;
}