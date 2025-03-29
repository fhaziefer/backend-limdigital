// src/model/web.model.ts
import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

export interface WebResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
    errors?: unknown;
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface WebResponseList<T> extends WebResponse<T[]> {
    meta: PaginationMeta;
}

export class WebResponseBuilder {
    static success<T>(
        data: T,
        message = 'Success',
        code = HttpStatus.OK,
    ): WebResponse<T> {
        return {
            success: true,
            code,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    static error<T = null>(
        message: string,
        code = HttpStatus.INTERNAL_SERVER_ERROR,
        errors?: unknown,
    ): WebResponse<T> {
        return {
            success: false,
            code,
            message,
            data: null as unknown as T, // Type assertion
            errors,
            timestamp: new Date().toISOString(),
        };
    }

    static validationError<T = null>(errors: unknown): WebResponse<T> {
        return this.error<T>('Validation failed', HttpStatus.BAD_REQUEST, errors);
    }

    static notFound<T = null>(message = 'Data not found'): WebResponse<T> {
        return this.error<T>(message, HttpStatus.NOT_FOUND);
    }

    static unauthorized<T = null>(message = 'Unauthorized'): WebResponse<T> {
        return this.error<T>(message, HttpStatus.UNAUTHORIZED);
    }

}

export const WebResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
    z.object({
        success: z.boolean(),
        code: z.number(),
        message: z.string(),
        data: dataSchema.optional(),
        errors: z.unknown().optional(),
        timestamp: z.string(),
    });