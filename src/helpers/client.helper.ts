// src/common/client.helper.ts
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js'; // Library untuk parsing User-Agent

@Injectable()
export class ClientHelper {
    /**
     * Mengekstrak informasi client dari request
     * @param req Objek Request Express
     * @returns Object berisi informasi client:
     *   - ipAddress: Alamat IP client
     *   - userAgent: String User-Agent asli
     *   - deviceType: Jenis device (mobile/tablet/desktop)
     *   - browser: Nama browser
     *   - os: Sistem operasi
     */
    extractClientInfo(req: Request): {
        ipAddress: string;
        userAgent: string;
        deviceType: string;
        browser: string;
        os: string;
    } {
        // Dapatkan IP address dari berbagai header yang mungkin
        const ipAddress = this.getClientIp(req);
        // Ambil User-Agent header atau default 'unknown'
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Deteksi tools development seperti Postman/Insomnia
        if (this.isDevelopmentTool(userAgent)) {
            return {
                ipAddress,
                userAgent,
                deviceType: 'development',
                browser: 'Postman/Insomnia',
                os: 'Development Tool'
            };
        }

        // Parse User-Agent untuk mendapatkan detail browser dan OS
        const parsedUA = this.parseUserAgent(userAgent);

        return {
            ipAddress,
            userAgent,
            // Normalisasi tipe device (fallback jika tidak terdeteksi)
            deviceType: this.normalizeDeviceType(parsedUA.device.type, userAgent),
            // Normalisasi nama browser (fallback jika tidak terdeteksi)
            browser: this.normalizeBrowser(parsedUA.browser.name, userAgent),
            // Normalisasi OS (fallback jika tidak terdeteksi)
            os: this.normalizeOS(parsedUA.os.name, userAgent)
        };
    }

    /**
     * Mendapatkan IP address client dari berbagai header yang mungkin
     */
    private getClientIp(req: Request): string {
        return (
            req.headers['cf-connecting-ip'] || // Cloudflare
            req.headers['x-real-ip'] || // Nginx
            req.headers['x-forwarded-for']?.toString().split(',')[0] || // Load balancer
            req.ip || // Express default
            req.socket.remoteAddress || // Fallback
            'unknown'
        ).toString().trim();
    }

    /**
     * Deteksi apakah request berasal dari development tool
     */
    private isDevelopmentTool(userAgent: string): boolean {
        return userAgent.includes('PostmanRuntime') ||
            userAgent.includes('insomnia');
    }

    /**
     * Parse User-Agent string menggunakan ua-parser-js
     */
    private parseUserAgent(userAgent: string) {
        const parser = new UAParser(userAgent);
        return parser.getResult();
    }

    /**
     * Normalisasi tipe device dengan fallback ke regex detection
     */
    private normalizeDeviceType(deviceType: string | undefined, userAgent: string): string {
        if (deviceType) return deviceType;

        // Fallback detection berdasarkan regex
        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return 'mobile';
        if (/tablet|ipad/i.test(userAgent)) return 'tablet';
        if (/smart-tv|tv|hbbtv|appletv|googletv|crkey/i.test(userAgent)) return 'smarttv';
        return 'desktop'; // Default
    }

    /**
     * Normalisasi nama browser dengan fallback ke regex detection
     */
    private normalizeBrowser(browser: string | undefined, userAgent: string): string {
        if (browser) return browser;

        // Daftar pattern untuk deteksi browser
        const browsers = [
            { pattern: /chrome|chromium|crios/i, name: 'Chrome' },
            { pattern: /firefox|fxios/i, name: 'Firefox' },
            { pattern: /safari/i, name: 'Safari' },
            { pattern: /opr|opera/i, name: 'Opera' },
            { pattern: /edge|edg|edga|edgios|edg/i, name: 'Edge' },
            { pattern: /msie|trident/i, name: 'Internet Explorer' },
        ];

        // Cek setiap pattern browser
        for (const { pattern, name } of browsers) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }

    /**
     * Normalisasi sistem operasi dengan fallback ke regex detection
     */
    private normalizeOS(os: string | undefined, userAgent: string): string {
        if (os) return os;

        // Daftar pattern untuk deteksi OS
        const osPatterns = [
            { pattern: /windows nt/i, name: 'Windows' },
            { pattern: /mac os|macintosh/i, name: 'macOS' },
            { pattern: /linux/i, name: 'Linux' },
            { pattern: /android/i, name: 'Android' },
            { pattern: /ios|iphone|ipad|ipod/i, name: 'iOS' },
        ];

        // Cek setiap pattern OS
        for (const { pattern, name } of osPatterns) {
            if (pattern.test(userAgent)) return name;
        }

        return 'unknown';
    }
}