/**
 * POST /api/auth/login
 * 
 * Login endpoint - thin layer, delegates to controller.
 */

import { NextRequest } from 'next/server';
import { login } from '@/controllers/authController';
import { success, badRequest, unauthorized } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';
import type { LoginRequest } from '@/types/auth.types';

async function handleLogin(req: NextRequest) {
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    const result = await login(email, password);

    if (!result.success) {
        if (result.validationErrors) {
            return badRequest(result.error, result.validationErrors);
        }
        return unauthorized(result.error);
    }

    return success(result.data);
}

export const POST = withErrorHandler(handleLogin);
