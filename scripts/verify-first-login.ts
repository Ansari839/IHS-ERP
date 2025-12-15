import 'dotenv/config'
import { login } from '../controllers/authController'
import { changePassword } from '../controllers/authController'
import prisma from '../lib/prisma'

async function verifyFlow() {
    console.log('🚀 Starting First-Time Login Flow Verification')

    const email = 'test-first-login@example.com'
    const password = 'password123'
    const newPassword = 'newpassword123'

    // 1. Attempt Login
    console.log('\n1️⃣  Attempting Login...')
    const loginResult = await login(email, password)

    if (!loginResult.success) {
        console.error('❌ Login failed:', loginResult.error)
        process.exit(1)
    }

    if (!loginResult.data.requirePasswordChange) {
        console.error('❌ Expected requirePasswordChange=true, got false')
        process.exit(1)
    }

    if (!loginResult.data.tempToken) {
        console.error('❌ Expected tempToken, got undefined')
        process.exit(1)
    }

    console.log('✅ Login successful. Received tempToken.')
    console.log('   requirePasswordChange:', loginResult.data.requirePasswordChange)

    // 2. Change Password
    console.log('\n2️⃣  Changing Password...')
    const changeResult = await changePassword(loginResult.data.tempToken, newPassword)

    if (!changeResult.success) {
        console.error('❌ Change password failed:', changeResult.error)
        process.exit(1)
    }

    if (!changeResult.data.accessToken || !changeResult.data.refreshToken) {
        console.error('❌ Expected access/refresh tokens after password change')
        process.exit(1)
    }

    console.log('✅ Password changed successfully. Received new tokens.')

    // 3. Verify User State in DB
    console.log('\n3️⃣  Verifying DB State...')
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.error('❌ User not found')
        process.exit(1)
    }

    if (user.firstLogin) {
        console.error('❌ Expected firstLogin=false')
        process.exit(1)
    }

    if (user.forcePasswordChange) {
        console.error('❌ Expected forcePasswordChange=false')
        process.exit(1)
    }

    console.log('✅ DB state verified: firstLogin=false, forcePasswordChange=false')

    // 4. Login with New Password
    console.log('\n4️⃣  Logging in with New Password...')
    const newLoginResult = await login(email, newPassword)

    if (!newLoginResult.success) {
        console.error('❌ New login failed:', newLoginResult.error)
        process.exit(1)
    }

    if (newLoginResult.data.requirePasswordChange) {
        console.error('❌ Expected normal login, got requirePasswordChange=true')
        process.exit(1)
    }

    console.log('✅ Normal login successful.')

    console.log('\n🎉 Verification Complete! All checks passed.')
}

verifyFlow()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
