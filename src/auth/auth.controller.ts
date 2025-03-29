// src/auth/auth.controller.ts
import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponseBuilder } from '../model/web.model';
import { LoginAuthRequest, RegisterAuthRequest } from '../model/auth.model';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

@Controller('/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
        const clientInfo = this.extractClientInfo(req);
        const result = await this.authService.login(request, clientInfo);
        return WebResponseBuilder.success(result, 'Login successful');
    }

    private extractClientInfo(req: Request): {
        ipAddress: string;
        userAgent: string;
        deviceType: string;
        browser: string;
        os: string;
    } {
        const ipAddress = this.getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Handle khusus untuk Postman/Insomnia
        if (userAgent.includes('PostmanRuntime') || userAgent.includes('insomnia')) {
            return {
                ipAddress,
                userAgent,
                deviceType: 'development',
                browser: 'Postman/Insomnia',
                os: 'Development Tool'
            };
        }

        const parser = new UAParser(userAgent);
        const { browser, os, device } = parser.getResult();

        return {
            ipAddress,
            userAgent,
            deviceType: this.normalizeDeviceType(device.type, userAgent),
            browser: this.normalizeBrowser(browser.name, userAgent),
            os: this.normalizeOS(os.name, userAgent)
        };
    }

    private getClientIp(req: Request): string {
        return (
            req.headers['cf-connecting-ip'] ||
            req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for']?.toString().split(',')[0] ||
            req.ip ||
            req.socket.remoteAddress ||
            'unknown'
        ).toString().trim();
    }

    private normalizeDeviceType(deviceType: string | undefined, userAgent: string): string {
        if (deviceType) return deviceType;

        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return 'mobile';
        if (/tablet|ipad/i.test(userAgent)) return 'tablet';
        if (/smart-tv|tv|hbbtv|appletv|googletv|crkey/i.test(userAgent)) return 'smarttv';
        return 'desktop';
    }

    private normalizeBrowser(browser: string | undefined, userAgent: string): string {
        if (browser) return browser;

        const browsers = [
            { pattern: /chrome|chromium|crios/i, name: 'Chrome' },
            { pattern: /firefox|fxios/i, name: 'Firefox' },
            { pattern: /safari/i, name: 'Safari' },
            { pattern: /opr|opera/i, name: 'Opera' },
            { pattern: /edge|edg|edga|edgios|edg/i, name: 'Edge' },
            { pattern: /msie|trident/i, name: 'Internet Explorer' },
        ];

        for (const { pattern, name } of browsers) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }

    private normalizeOS(os: string | undefined, userAgent: string): string {
        if (os) return os;

        const osPatterns = [
            { pattern: /windows nt/i, name: 'Windows' },
            { pattern: /mac os|macintosh/i, name: 'macOS' },
            { pattern: /linux/i, name: 'Linux' },
            { pattern: /android/i, name: 'Android' },
            { pattern: /ios|iphone|ipad|ipod/i, name: 'iOS' },
        ];

        for (const { pattern, name } of osPatterns) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }
}