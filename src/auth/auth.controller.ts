// src/auth/auth.controller.ts
import { Body, Controller, Post, Req, Headers, Delete, Put, Get, Query } from '@nestjs/common';
// Import service dan komponen pendukung
import { AuthService } from './auth.service';
import { WebResponseBuilder } from '../model/web.model';
import { LoginAuthRequest, RegisterAuthRequest, UpdatePasswordRequest } from '../model/auth.model';
import { Request } from 'express';
import { ClientHelper } from '../helpers/client.helper';
import { User } from '../model/user.model';
import { Auth } from '../common/auth.decorator';

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
    async register(
        @Body() request: RegisterAuthRequest, // Data register dari body request
        @Req() req: Request, // Objek request Express
    ) {
        // Ekstrak informasi client (IP, user agent, dll) dari request
        const clientInfo = this.clientHelper.extractClientInfo(req);
        // Panggil method register dari AuthService
        const result = await this.authService.register(request, clientInfo);
        // Return response standar menggunakan WebResponseBuilder
        return WebResponseBuilder.successCreated(result, 'Registration successful');
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
        return WebResponseBuilder.successCreated(result, 'Login successful');
    }

    /**
     * Endpoint DELETE /api/logout for user logout
     * @param user Authenticated user from @Auth decorator
     * @param authorization Authorization header with Bearer token
     * @param req Request object for client info
     * @returns Standard web response
     */
    @Delete('/logout')
    async logout(
        @Auth() user: User,
        @Headers('authorization') authorization: string,
        @Req() req: Request,
    ) {
        const clientInfo = this.clientHelper.extractClientInfo(req);
        const result = await this.authService.logout(user.id, authorization, clientInfo);
        return WebResponseBuilder.successOk(result, 'Logout successful');
    }

    @Put('/password')
    async updatePassword(
        @Auth() user: User,
        @Body() request: UpdatePasswordRequest,
        @Req() req: Request
    ) {
        const clientInfo = this.clientHelper.extractClientInfo(req);
        const result = await this.authService.updatePassword(user.id, request, clientInfo);
        return WebResponseBuilder.successCreated(result, 'Password berhasil diperbarui');
    }

    @Post('/send-verification')
    async sendVerification(
        @Auth() user: User,
    ) {
        const result = await this.authService.sendVerificationEmail(user.id);
        return WebResponseBuilder.successOk(result, 'Email verifikasi telah dikirim');
    }

    @Post('/verify-email')
    async verifyEmail(
        @Auth() user: User,
        @Body('otp') otp: string,
    ) {
        const isValid = await this.authService.verifyEmail(user.id, otp);

        if (!isValid) {
            return WebResponseBuilder.badRequest('OTP tidak valid atau sudah kadaluarsa');
        }

        return WebResponseBuilder.successOk(
            { email: user.email, verified: true },
            'Email berhasil diverifikasi',
        );
    }

    @Get('/check-verification')
    async checkVerification(
        @Auth() user: User,
    ) {
        const result = await this.authService.checkVerificationStatus(user.id);
        return WebResponseBuilder.successOk(result, 'Status verifikasi email');
    }

}