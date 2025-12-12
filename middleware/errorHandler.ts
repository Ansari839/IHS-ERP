/**
 * Error Handler Middleware
 * 
 * Global error handling for Next.js API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { serverError } from '@/lib/response';

type RouteHandler = (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wrap an async route handler with error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
    return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
        try {
            return await handler(req, context);
        } catch (error) {
            console.error('Unhandled error in route:', error);

            // Log error details in development
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
            }

            // Return generic error response
            return serverError(
                process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : error instanceof Error ? error.message : 'Unknown error'
            );
        }
    };
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public errors?: Record<string, string>
    ) {
        super(message);
        this.name = 'AppError';
    }
}
