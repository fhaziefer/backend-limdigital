// src/model/web.model.ts

// Core module imports
import { HttpStatus } from '@nestjs/common'; // Standard HTTP status codes
import { z } from 'zod'; // Schema validation library

/**
 * Standard API response interface
 * 
 * @template T Type of the data payload
 * 
 * @property {boolean} success - Indicates if the request was successful
 * @property {number} code - HTTP status code
 * @property {string} message - Human-readable response message
 * @property {T} [data] - Optional response payload
 * @property {unknown} [errors] - Optional error details
 * @property {string} timestamp - ISO format timestamp of response
 */
export interface WebResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
    errors?: unknown;
    timestamp: string;
}

/**
 * Pagination metadata interface
 * 
 * @property {number} page - Current page number (1-based index)
 * @property {number} size - Number of items per page
 * @property {number} totalItems - Total number of items across all pages
 * @property {number} totalPages - Total number of pages
 */
export interface PaginationMeta {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

/**
 * Paginated list response interface
 * 
 * @template T Type of items in the data array
 * @extends WebResponse<T[]> - Extends base response with array data type
 * 
 * @property {PaginationMeta} meta - Pagination metadata
 */
export interface WebResponseList<T> extends WebResponse<T[]> {
    meta: PaginationMeta;
}

/**
 * Standardized response builder for consistent API responses
 * 
 * Provides static methods to create success and error responses
 * following the application's response format standard.
 */
export class WebResponseBuilder {
    /**
     * Creates a successful 200 OK response
     * 
     * @template T Type of response data
     * @param {T} data - Response payload data
     * @param {string} [message='Success'] - Optional success message
     * @returns {WebResponse<T>} Standardized success response
     * 
     * @example
     * WebResponseBuilder.successOk(userData, 'User retrieved successfully');
     */
    static successOk<T>(
        data: T,
        message = 'Success',
    ): WebResponse<T> {
        return {
            success: true,
            code: HttpStatus.OK,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a successful 201 Created response
     * 
     * @template T Type of response data
     * @param {T} data - Created resource data
     * @param {string} [message='Resource created successfully'] - Optional message
     * @returns {WebResponse<T>} Standardized creation response
     * 
     * @example
     * WebResponseBuilder.successCreated(newUser, 'User registered');
     */
    static successCreated<T>(
        data: T,
        message = 'Resource created successfully',
    ): WebResponse<T> {
        return {
            success: true,
            code: HttpStatus.CREATED,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a successful 204 No Content response
     * 
     * @returns {WebResponse<null>} Empty success response
     * 
     * @example
     * WebResponseBuilder.successNoContent();
     */
    static successNoContent(): WebResponse<null> {
        return {
            success: true,
            code: HttpStatus.NO_CONTENT,
            message: 'No content',
            data: null,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 400 Bad Request error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Bad Request'] - Error message
     * @param {unknown} [errors] - Optional error details
     * @returns {WebResponse<T>} Standardized error response
     * 
     * @example
     * WebResponseBuilder.badRequest('Invalid input', validationErrors);
     */
    static badRequest<T = null>(message = 'Bad Request', errors?: unknown): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.BAD_REQUEST,
            message,
            data: null as unknown as T,
            errors,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 422 Unprocessable Entity validation error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {unknown} errors - Validation error details
     * @returns {WebResponse<T>} Standardized validation error response
     * 
     * @example
     * WebResponseBuilder.validationError(zodErrors);
     */
    static validationError<T = null>(errors: unknown): WebResponse<T> {
        return this.badRequest<T>('Validation failed', errors);
    }

    /**
     * Creates a 401 Unauthorized error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {WebResponse<T>} Standardized unauthorized response
     * 
     * @example
     * WebResponseBuilder.unauthorized('Invalid credentials');
     */
    static unauthorized<T = null>(message = 'Unauthorized'): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.UNAUTHORIZED,
            message,
            data: null as unknown as T,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 403 Forbidden error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Forbidden'] - Error message
     * @returns {WebResponse<T>} Standardized forbidden response
     * 
     * @example
     * WebResponseBuilder.forbidden('Insufficient permissions');
     */
    static forbidden<T = null>(message = 'Forbidden'): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.FORBIDDEN,
            message,
            data: null as unknown as T,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 404 Not Found error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Resource not found'] - Error message
     * @returns {WebResponse<T>} Standardized not found response
     * 
     * @example
     * WebResponseBuilder.notFound('User not found');
     */
    static notFound<T = null>(message = 'Resource not found'): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.NOT_FOUND,
            message,
            data: null as unknown as T,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 409 Conflict error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Conflict occurred'] - Error message
     * @returns {WebResponse<T>} Standardized conflict response
     * 
     * @example
     * WebResponseBuilder.conflict('Email already exists');
     */
    static conflict<T = null>(message = 'Conflict occurred'): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.CONFLICT,
            message,
            data: null as unknown as T,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Creates a 500 Internal Server Error response
     * 
     * @template T Type parameter (defaults to null)
     * @param {string} [message='Internal server error'] - Error message
     * @param {unknown} [errors] - Optional error details (only in development)
     * @returns {WebResponse<T>} Standardized server error response
     * 
     * @example
     * WebResponseBuilder.serverError('Database connection failed', error.stack);
     */
    static serverError<T = null>(message = 'Internal server error', errors?: unknown): WebResponse<T> {
        return {
            success: false,
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message,
            data: null as unknown as T,
            errors,
            timestamp: new Date().toISOString(),
        };
    }
}

/**
 * Creates a Zod schema for validating WebResponse objects
 * 
 * @template T Type of the expected data payload
 * @param {z.ZodType<T>} dataSchema - Zod schema for the data payload
 * @returns {z.ZodObject} Zod schema for WebResponse
 * 
 * @example
 * const UserResponseSchema = WebResponseSchema(z.object({
 *   id: z.string(),
 *   name: z.string()
 * }));
 */
export const WebResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
    z.object({
        success: z.boolean(),
        code: z.number(),
        message: z.string(),
        data: dataSchema.optional(),
        errors: z.unknown().optional(),
        timestamp: z.string(),
    });