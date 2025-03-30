// src/common/error.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ZodError } from 'zod'; // Untuk menangani error validasi Zod
import { Response } from 'express'; // Type Response dari Express

// Deklarasi filter dengan decorator @Catch untuk menangani ZodError dan HttpException
@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
    // Logger untuk mencatat error
    private readonly logger = new Logger(ErrorFilter.name);

    // Method utama yang akan dipanggil ketika ada exception
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Penanganan untuk error validasi Zod
        if (exception instanceof ZodError) {
            this.logger.warn('Validation error', { errors: exception.errors });

            response.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                code: HttpStatus.BAD_REQUEST,
                message: 'Validation failed',
                // Transformasi error Zod menjadi format yang lebih rapi
                errors: exception.errors.map((err) => ({
                    path: err.path.join('.'), // Gabungkan path array menjadi string
                    message: err.message,
                    code: err.code,
                })),
                timestamp: new Date().toISOString(),
            });
        } 
        // Penanganan untuk HttpException (error HTTP standar Nest)
        else if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const responseBody = exception.getResponse();

            this.logger.warn('HTTP Exception', { status, responseBody });

            response.status(status).json({
                success: false,
                code: status,
                // Handle berbagai tipe response body
                message: typeof responseBody === 'string'
                    ? responseBody
                    : (responseBody as any).message,
                errors: typeof responseBody === 'object' ? responseBody : null,
                timestamp: new Date().toISOString(),
            });
        } 
        // Penanganan untuk error tak terduga lainnya
        else {
            this.logger.error('Unexpected error', exception);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                timestamp: new Date().toISOString(),
            });
        }
    }
}