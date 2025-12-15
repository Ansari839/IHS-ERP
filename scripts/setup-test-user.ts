import 'dotenv/config'
import prisma from '../lib/prisma'
import { hashPassword } from '../lib/password'

async function main() {
    const email = 'test-first-login@example.com'
    const password = 'password123'

    // Clean up
    await prisma.user.deleteMany({ where: { email } })

    // Create user with forcePasswordChange = true
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: 'Test User',
            forcePasswordChange: true,
            firstLogin: true,
        },
    })

    console.log(`Created user ${user.email} with forcePasswordChange=true`)
    console.log('Now you can test the login flow manually or via API.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
