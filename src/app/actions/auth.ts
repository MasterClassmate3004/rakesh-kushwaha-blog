"use server"

import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function register(formData: FormData) {
    const name = (formData.get("name") as string)?.trim()
    const email = (formData.get("email") as string)?.trim().toLowerCase()
    const password = formData.get("password") as string

    if (!email || !password) return { error: "Email and password are required" }
    if (password.length < 8) return { error: "Password must be at least 8 characters" }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) return { error: "User already exists" }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            // Public signup must never grant admin role.
            role: "USER"
        }
    })

    return { success: true, email }
}
