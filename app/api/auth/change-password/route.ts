/**
 * POST /api/auth/change-password
 * 
 * Change password endpoint for first-time login.
 */

import { NextRequest } from 'next/server';
import { changePassword } from '@/controllers/authController';
import { success, badRequest, unauthorized } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';
import type { ChangePasswordRequest } from '@/types/auth.types';

async function handleChangePassword(req: NextRequest) {
    const body: ChangePasswordRequest = await req.json();
    const { tempToken, newPassword } = body;

    if (!tempToken || !newPassword) {
        return badRequest('Missing tempToken or newPassword');
    }

    const result = await changePassword(tempToken, newPassword);

    if (!result.success) {
        return unauthorized(result.error);
    }

    return success(result.data);
}

export const POST = withErrorHandler(handleChangePassword);
