/**
 * HTTP Response Helpers
 * 
 * Standardized response functions for Next.js API routes.
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS, type HttpStatusCode } from '@/constants';

interface SuccessResponse<T = any> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: {
        message: string;
        errors?: Record<string, string>;
    };
}

/**
 * Send a success response
 */
export function success<T = any>(
    data: T,
    statusCode: HttpStatusCode = HTTP_STATUS.OK
): NextResponse<SuccessResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status: statusCode }
    );
}

/**
 * Send a created response (201)
 */
export function created<T = any>(data: T): NextResponse<SuccessResponse<T>> {
    return success(data, HTTP_STATUS.CREATED);
}

/**
 * Send an error response
 */
export function error(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.BAD_REQUEST,
    errors?: Record<string, string>
): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
        success: false,
        error: {
            message,
        },
    };

    if (errors) {
        response.error.errors = errors;
    }

    return NextResponse.json(response, { status: statusCode });
}

/**
 * Send a bad request response (400)
 */
export function badRequest(
    message: string,
    errors?: Record<string, string>
): NextResponse<ErrorResponse> {
    return error(message, HTTP_STATUS.BAD_REQUEST, errors);
}

/**
 * Send an unauthorized response (401)
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<ErrorResponse> {
    return error(message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Send a forbidden response (403)
 */
export function forbidden(message = 'Forbidden'): NextResponse<ErrorResponse> {
    return error(message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Send a not found response (404)
 */
export function notFound(message = 'Resource not found'): NextResponse<ErrorResponse> {
    return error(message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Send a conflict response (409)
 */
export function conflict(message: string): NextResponse<ErrorResponse> {
    return error(message, HTTP_STATUS.CONFLICT);
}

/**
 * Send an internal server error response (500)
 */
export function serverError(message = 'Internal server error'): NextResponse<ErrorResponse> {
    // In production, log the full error but return generic message
    if (process.env.NODE_ENV === 'production') {
        console.error('Server error:', message);
        return error('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return error(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
