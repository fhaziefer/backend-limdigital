// src/common/client.helper.ts
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class ClientHelper {
    /**
     * Mengekstrak informasi client dari request untuk disimpan di database
     * Extracts client information from request to be stored in database
     * 
     * @param req Objek Request Express / Express Request object
     * @returns Informasi client yang sudah dinormalisasi / Normalized client info
     */
    extractClientInfo(req: Request): {
        ipAddress: string;     // Alamat IP client / Client IP address
        userAgent: string;     // User-Agent string / User-Agent string
        deviceType: string;    // Jenis device / Device type
        browser: string;       // Nama browser / Browser name
        os: string;            // Sistem operasi / Operating system
    } {
        // Default values untuk menghindari null / Default values to avoid null
        const defaults = {
            ipAddress: 'unknown',
            userAgent: 'unknown',
            deviceType: 'desktop',
            browser: 'unknown',
            os: 'unknown'
        };

        // Dapatkan IP address dan User-Agent / Get IP address and User-Agent
        const ipAddress = this.getClientIp(req) || defaults.ipAddress;
        const userAgent = this.getUserAgent(req) || defaults.userAgent;

        // 1. Deteksi environment testing terlebih dahulu / Detect test environment first
        if (this.isTestEnvironment(userAgent)) {
            return {
                ipAddress: '127.0.0.1', // Gunakan IP local untuk testing / Use local IP for testing
                userAgent,
                deviceType: 'testing',
                browser: 'Jest/Test',
                os: 'Test Environment'
            };
        }

        // 2. Deteksi development tools / Detect development tools
        if (this.isDevelopmentTool(userAgent)) {
            return {
                ipAddress,
                userAgent,
                deviceType: 'development',
                browser: this.getDevToolName(userAgent),
                os: 'Development Tool'
            };
        }

        // 3. Parse User-Agent untuk traffic production / Parse User-Agent for production traffic
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        return {
            ipAddress,
            userAgent,
            deviceType: this.normalizeDeviceType(result.device?.type, userAgent),
            browser: this.normalizeBrowser(result.browser?.name, userAgent),
            os: this.normalizeOS(result.os?.name, userAgent)
        };
    }

    /**
     * Mendapatkan IP address client dengan prioritas:
     * 1. Header khusus testing (x-test-ip)
     * 2. Header standar (x-forwarded-for, cf-connecting-ip, dll)
     * 3. IP dari express (req.ip)
     * 4. Socket remote address
     * 
     * Gets client IP address with priority:
     * 1. Testing header (x-test-ip)
     * 2. Standard headers (x-forwarded-for, cf-connecting-ip, etc)
     * 3. Express IP (req.ip)
     * 4. Socket remote address
     */
    private getClientIp(req: Request): string {
        return (
            req.headers['x-test-ip']?.toString() ||        // Untuk testing / For testing
            req.headers['cf-connecting-ip']?.toString() || // Cloudflare
            req.headers['x-real-ip']?.toString() ||        // Nginx
            req.headers['x-forwarded-for']?.toString().split(',')[0] || // Load balancer
            req.ip ||                                      // Express default
            req.socket.remoteAddress ||                    // Fallback
            'unknown'                                      // Default value
        ).trim();
    }

    /**
     * Mendapatkan User-Agent string dengan prioritas:
     * 1. Header khusus testing (x-test-user-agent)
     * 2. Standard user-agent header
     * 
     * Gets User-Agent string with priority:
     * 1. Testing header (x-test-user-agent)
     * 2. Standard user-agent header
     */
    private getUserAgent(req: Request): string {
        return (
            req.headers['x-test-user-agent']?.toString() || // Untuk testing / For testing
            req.headers['user-agent']?.toString() ||        // Standard header
            'unknown'                                       // Default value
        );
    }

    /**
     * Deteksi apakah request berasal dari environment testing
     * Detects if request comes from test environment
     */
    private isTestEnvironment(userAgent: string): boolean {
        return userAgent.includes('Jest') ||       // Jest test runner
            userAgent.includes('Mocha') ||      // Mocha test runner
            userAgent.includes('Node.js') ||    // Node.js direct calls
            userAgent.includes('jsdom');       // JSDOM (browser testing)
    }

    /**
     * Deteksi apakah request berasal dari development tool
     * Detects if request comes from development tool
     */
    private isDevelopmentTool(userAgent: string): boolean {
        return userAgent.includes('PostmanRuntime') ||  // Postman
            userAgent.includes('insomnia') ||        // Insomnia
            userAgent.includes('Thunder Client') ||  // Thunder Client
            userAgent.includes('curl');              // cURL
    }

    /**
     * Mendapatkan nama development tool dari User-Agent
     * Gets development tool name from User-Agent
     */
    private getDevToolName(userAgent: string): string {
        if (userAgent.includes('PostmanRuntime')) return 'Postman';
        if (userAgent.includes('insomnia')) return 'Insomnia';
        if (userAgent.includes('Thunder Client')) return 'Thunder Client';
        if (userAgent.includes('curl')) return 'cURL';
        return 'Development Tool'; // Fallback
    }

    /**
     * Normalisasi tipe device dengan fallback ke regex detection
     * Normalizes device type with regex fallback
     */
    private normalizeDeviceType(deviceType: string | undefined, userAgent: string): string {
        if (deviceType) return deviceType;

        // Mobile detection / Deteksi mobile
        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return 'mobile';

        // Tablet detection / Deteksi tablet
        if (/tablet|ipad/i.test(userAgent)) return 'tablet';

        // Smart TV detection / Deteksi smart TV
        if (/smart-tv|tv|hbbtv|appletv|googletv|crkey/i.test(userAgent)) return 'smarttv';

        // Bot detection / Deteksi bot
        if (/bot|crawl|spider/i.test(userAgent)) return 'bot';

        return 'desktop'; // Default
    }

    /**
     * Normalisasi nama browser dengan fallback ke regex detection
     * Normalizes browser name with regex fallback
     */
    private normalizeBrowser(browser: string | undefined, userAgent: string): string {
        if (browser) return browser;

        const browsers = [
            { pattern: /chrome|chromium|crios/i, name: 'Chrome' },
            { pattern: /firefox|fxios/i, name: 'Firefox' },
            { pattern: /safari/i, name: 'Safari' },
            { pattern: /opr|opera/i, name: 'Opera' },
            { pattern: /edge|edg|edga|edgios|edg/i, name: 'Edge' },
            { pattern: /msie|trident/i, name: 'Internet Explorer' },
            { pattern: /samsungbrowser/i, name: 'Samsung Browser' },
        ];

        for (const { pattern, name } of browsers) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }

    /**
     * Normalisasi sistem operasi dengan fallback ke regex detection
     * Normalizes operating system with regex fallback
     */
    private normalizeOS(os: string | undefined, userAgent: string): string {
        if (os) return os;

        const osPatterns = [
            { pattern: /windows nt/i, name: 'Windows' },
            { pattern: /mac os|macintosh/i, name: 'macOS' },
            { pattern: /linux/i, name: 'Linux' },
            { pattern: /android/i, name: 'Android' },
            { pattern: /ios|iphone|ipad|ipod/i, name: 'iOS' },
            { pattern: /ubuntu/i, name: 'Ubuntu' },
        ];

        for (const { pattern, name } of osPatterns) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }
}