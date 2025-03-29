// src/model/session.model.ts
export interface SessionInfo {
    id: string;
    sessionToken: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
    isActive: boolean;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
}