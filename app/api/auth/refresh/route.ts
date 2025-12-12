/**
 * POST /api/auth/refresh
 * 
 * Refresh endpoint - thin layer, delegates to controller.
 */

import { NextRequest } from 'next/server';
import { refresh } from '@/controllers/authController';
import { success, badRequest, unauthorized } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';
import type { RefreshRequest } from '@/types/auth.types';

async function handleRefresh(req: NextRequest) {
    const body: RefreshRequest = await req.json();
    const { refreshToken } = body;

    const result = await refresh(refreshToken);

    if (!result.success) {
        if (result.validationErrors) {
            return badRequest(result.error, result.validationErrors);
        }
        return unauthorized(result.error);
    }

    return success(result.data);
}

export const POST = withErrorHandler(handleRefresh);
