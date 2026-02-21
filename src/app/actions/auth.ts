"use server"

import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) return { error: "Email and password are required" }

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
            role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER"
        }
    })

    return { success: true, email, password }
}
