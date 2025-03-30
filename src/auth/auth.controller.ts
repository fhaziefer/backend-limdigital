// src/auth/auth.controller.ts
import { Body, Controller, Post, Req } from '@nestjs/common';
// Import service dan komponen pendukung
import { AuthService } from './auth.service';
import { WebResponseBuilder } from '../model/web.model';
import { LoginAuthRequest, RegisterAuthRequest } from '../model/auth.model';
import { Request } from 'express';
import { ClientHelper } from '../helpers/client.helper';

// Deklarasi controller dengan base route '/auth'
@Controller('/auth')
export class AuthController {
    // Dependency injection untuk AuthService dan ClientHelper
    constructor(
        private authService: AuthService, // Service untuk handle logic autentikasi
        private clientHelper: ClientHelper // Helper untuk ekstrak info client
    ) { }

    // Endpoint POST /auth/register untuk registrasi user baru
    @Post('/register')
    async register(@Body() request: RegisterAuthRequest) {
        // Panggil method register dari AuthService
        const result = await this.authService.register(request);
        // Return response standar menggunakan WebResponseBuilder
        return WebResponseBuilder.success(result, 'Registration successful');
    }

    // Endpoint POST /auth/login untuk login user
    @Post('/login')
    async login(
        @Body() request: LoginAuthRequest, // Data login dari body request
        @Req() req: Request, // Objek request Express
    ) {
        // Ekstrak informasi client (IP, user agent, dll) dari request
        const clientInfo = this.clientHelper.extractClientInfo(req);
        // Panggil method login dari AuthService dengan data login dan info client
        const result = await this.authService.login(request, clientInfo);
        // Return response standar menggunakan WebResponseBuilder
        return WebResponseBuilder.success(result, 'Login successful');
    }
}