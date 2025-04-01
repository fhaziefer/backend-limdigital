// src/common/error.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';
import { WebResponseBuilder } from '../model/web.model';

/**
 * Global exception filter untuk menangani semua jenis error yang terjadi di aplikasi
 * - Menangani ZodError (error validasi)
 * - Menangani HttpException (error HTTP yang diketahui)
 * - Menangani Error umum (unexpected errors)
 * 
 * Filter ini akan memformat semua error response sesuai standar WebResponse
 */
@Catch(ZodError, HttpException, Error)
export class ErrorFilter implements ExceptionFilter {
    // Logger instance untuk mencatat error
    private readonly logger = new Logger(ErrorFilter.name);

    /**
     * Method utama yang menangani exception
     * @param exception Exception yang terjadi
     * @param host ArgumentsHost untuk mengakses request/response
     */
    catch(exception: unknown, host: ArgumentsHost) {
        // Dapatkan context HTTP dari ArgumentsHost
        const ctx = host.switchToHttp();
        // Dapatkan response object dari Express
        const response = ctx.getResponse<Response>();

        // ==============================================
        // PENANGANAN ERROR VALIDASI (ZodError)
        // ==============================================
        if (exception instanceof ZodError) {
            // Log warning untuk error validasi
            this.logger.warn('Validation error', { errors: exception.errors });

            // Format error validasi menjadi struktur yang lebih rapi
            const validationErrors = exception.errors.map(err => ({
                path: err.path.join('.'),  // Gabungkan path array menjadi string
                message: err.message,      // Pesan error dari Zod
                code: err.code,           // Kode error dari Zod
            }));

            // Kirim response dengan:
            // - Status code 400 (Bad Request)
            // - Format standar error validasi
            response
                .status(HttpStatus.BAD_REQUEST)
                .json(WebResponseBuilder.validationError(validationErrors));
            return;
        }

        // ==============================================
        // PENANGANAN HTTP EXCEPTION (Error yang diketahui)
        // ==============================================
        if (exception instanceof HttpException) {
            // Dapatkan status code dan response body dari exception
            const status = exception.getStatus();
            const responseBody = exception.getResponse();

            // Default message dan errors
            let message = 'An error occurred';
            let errors: unknown = undefined;

            // Handle response body yang bisa berupa string atau object
            if (typeof responseBody === 'string') {
                // Jika response body berupa string langsung
                message = responseBody;
            } else if (typeof responseBody === 'object') {
                // Jika response body berupa object, coba ekstrak message dan errors
                message = (responseBody as any).message || message;
                errors = (responseBody as any).errors || undefined;
            }

            // Log warning untuk HTTP exception
            this.logger.warn('HTTP Exception', { status, responseBody });

            // Handle status code tertentu dengan response builder yang spesifik
            switch (status) {
                case HttpStatus.UNAUTHORIZED:
                    response.status(status).json(WebResponseBuilder.unauthorized(message));
                    break;
                case HttpStatus.FORBIDDEN:
                    response.status(status).json(WebResponseBuilder.forbidden(message));
                    break;
                case HttpStatus.NOT_FOUND:
                    response.status(status).json(WebResponseBuilder.notFound(message));
                    break;
                case HttpStatus.CONFLICT:
                    response.status(status).json(WebResponseBuilder.conflict(message));
                    break;
                case HttpStatus.BAD_REQUEST:
                    response.status(status).json(WebResponseBuilder.badRequest(message, errors));
                    break;
                default:
                    // Untuk status code lain, gunakan format default
                    response.status(status).json({
                        success: false,
                        code: status,
                        message,
                        errors,
                        timestamp: new Date().toISOString(),
                    });
            }
            return;
        }

        // ==============================================
        // PENANGANAN UNEXPECTED ERROR (Error umum)
        // ==============================================
        if (exception instanceof Error) {
            // Log error dengan stack trace untuk debugging
            this.logger.error('Unexpected error', exception.stack || exception.message);

            // Kirim response error internal server
            // Di development mode, sertakan detail error
            // Di production mode, hanya kirim pesan umum
            response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(WebResponseBuilder.serverError(
                    'Internal server error',
                    process.env.NODE_ENV === 'development'
                        ? {
                            message: exception.message,
                            stack: exception.stack
                        }
                        : undefined
                ));
            return;
        }

        // ==============================================
        // PENANGANAN UNKNOWN ERROR (Fallback)
        // ==============================================
        // Jika error tidak termasuk dalam jenis di atas
        this.logger.error('Unknown error type', exception);
        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(WebResponseBuilder.serverError('Unknown error occurred'));
    }
}