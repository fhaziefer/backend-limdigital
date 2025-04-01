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
 * Global exception filter that handles all types of errors in the application
 * - Handles ZodError (validation errors)
 * - Handles HttpException (known HTTP errors)
 * - Handles generic Errors (unexpected errors)
 * 
 * This filter formats all error responses according to the WebResponse standard
 */
@Catch(ZodError, HttpException, Error)
export class ErrorFilter implements ExceptionFilter {
    // Logger instance for error tracking
    private readonly logger = new Logger(ErrorFilter.name);

    /**
     * Main method that handles exceptions
     * @param exception The thrown exception
     * @param host ArgumentsHost for accessing request/response objects
     */
    catch(exception: unknown, host: ArgumentsHost) {
        // Get HTTP context from ArgumentsHost
        const ctx = host.switchToHttp();
        // Get Express response object
        const response = ctx.getResponse<Response>();

        // ==============================================
        // VALIDATION ERROR HANDLING (ZodError)
        // ==============================================
        if (exception instanceof ZodError) {
            // Log validation error warning
            this.logger.warn('Validation error', { errors: exception.errors });

            // Format validation errors into a cleaner structure
            const validationErrors = exception.errors.map(err => ({
                path: err.path.join('.'),  // Convert path array to string
                message: err.message,      // Error message from Zod
                code: err.code,           // Error code from Zod
            }));

            // Send response with:
            // - 400 (Bad Request) status code
            // - Standardized validation error format
            response
                .status(HttpStatus.BAD_REQUEST)
                .json(WebResponseBuilder.validationError(validationErrors));
            return;
        }

        // ==============================================
        // HTTP EXCEPTION HANDLING (Known errors)
        // ==============================================
        if (exception instanceof HttpException) {
            // Get status code and response body from exception
            const status = exception.getStatus();
            const responseBody = exception.getResponse();

            // Default message and errors
            let message = 'An error occurred';
            let errors: unknown = undefined;

            // Handle response body which can be either string or object
            if (typeof responseBody === 'string') {
                // If response body is directly a string
                message = responseBody;
            } else if (typeof responseBody === 'object') {
                // If response body is an object, extract message and errors
                message = (responseBody as any).message || message;
                errors = (responseBody as any).errors || undefined;
            }

            // Log HTTP exception warning
            this.logger.warn('HTTP Exception', { status, responseBody });

            // Handle specific status codes with appropriate response builders
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
                    // For other status codes, use default format
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
        // UNEXPECTED ERROR HANDLING (Generic errors)
        // ==============================================
        if (exception instanceof Error) {
            // Log error with stack trace for debugging
            this.logger.error('Unexpected error', exception.stack || exception.message);

            // Send internal server error response
            // Include error details in development mode
            // Only generic message in production mode
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
        // UNKNOWN ERROR HANDLING (Fallback)
        // ==============================================
        // If error doesn't match any of the above types
        this.logger.error('Unknown error type', exception);
        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(WebResponseBuilder.serverError('Unknown error occurred'));
    }
}