/**
 * POST /api/auth/logout
 * 
 * Logout endpoint - thin layer, delegates to controller.
 */

import { NextRequest } from 'next/server';
import { logout } from '@/controllers/authController';
import { success, badRequest } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';
import type { LogoutRequest } from '@/types/auth.types';

async function handleLogout(req: NextRequest) {
    const body: LogoutRequest = await req.json();
    const { refreshToken } = body;

    const result = await logout(refreshToken);

    if (!result.success) {
        if (result.validationErrors) {
            return badRequest(result.error, result.validationErrors);
        }
        return badRequest(result.error);
    }

    return success(result.data);
}

export const POST = withErrorHandler(handleLogout);
