// src/auth/auth.controller.ts
import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponseBuilder } from '../model/web.model';
import { LoginAuthRequest, RegisterAuthRequest } from '../model/auth.model';
import { Request } from 'express';
import { ClientHelper } from '../helpers/client.helper';

@Controller('/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private clientHelper: ClientHelper
    ) { }

    @Post('/register')
    async register(@Body() request: RegisterAuthRequest) {
        const result = await this.authService.register(request);
        return WebResponseBuilder.success(result, 'Registration successful');
    }

    @Post('/login')
    async login(
        @Body() request: LoginAuthRequest,
        @Req() req: Request,
    ) {
        const clientInfo = this.clientHelper.extractClientInfo(req);
        const result = await this.authService.login(request, clientInfo);
        return WebResponseBuilder.success(result, 'Login successful');
    }
}