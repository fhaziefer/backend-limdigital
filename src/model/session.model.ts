// src/model/session.model.ts
/**
 * Informasi client yang mengakses sistem
 * @property ipAddress - Alamat IP client
 * @property userAgent - Browser/device user agent
 * @property deviceType - Jenis device (mobile/desktop)
 * @property browser - Nama browser
 * @property os - Sistem operasi
 */
export interface ClientInfo {
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
}

/**
 * Data session yang disimpan di database
 * @property id - ID unik session
 * @property sessionToken - Token unik session
 * @property userId - ID user pemilik session
 * @property ipAddress - Alamat IP saat login (opsional)
 * @property userAgent - Device user agent (opsional)
 * @property deviceType - Jenis device (opsional)
 * @property browser - Browser yang digunakan (opsional)
 * @property os - Sistem operasi (opsional)
 * @property isActive - Status aktif session
 * @property createdAt - Waktu pembuatan session
 * @property expiresAt - Waktu kadaluarsa session
 * @property lastActivity - Waktu aktivitas terakhir
 */
export interface SessionInfo {
    id: string;
    sessionToken: string;
    userId: string;
    ipAddress?: string | null;  // Tambahkan null sebagai opsi
    userAgent?: string | null;
    deviceType?: string | null;
    browser?: string | null;
    os?: string | null;
    isActive: boolean;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
}