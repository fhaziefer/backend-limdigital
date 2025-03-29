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

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger(ErrorFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof ZodError) {
            this.logger.warn('Validation error', { errors: exception.errors });

            response.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                code: HttpStatus.BAD_REQUEST,
                message: 'Validation failed',
                errors: exception.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                })),
                timestamp: new Date().toISOString(),
            });
        } else if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const responseBody = exception.getResponse();

            this.logger.warn('HTTP Exception', { status, responseBody });

            response.status(status).json({
                success: false,
                code: status,
                message: typeof responseBody === 'string'
                    ? responseBody
                    : (responseBody as any).message,
                errors: typeof responseBody === 'object' ? responseBody : null,
                timestamp: new Date().toISOString(),
            });
        } else {
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