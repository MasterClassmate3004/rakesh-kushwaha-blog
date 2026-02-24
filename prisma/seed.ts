import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@blog.local'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const adminPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: adminPassword,
            role: 'ADMIN',
        },
        create: {
            name: 'Rakesh Kushwaha',
            email,
            password: adminPassword,
            role: 'ADMIN',
        },
    })

    console.log({ admin: { ...admin, password: '[REDACTED]' } })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
