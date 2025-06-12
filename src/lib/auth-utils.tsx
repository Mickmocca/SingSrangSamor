import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import prisma from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  const decoded = verifyToken(token.value)
  if (!decoded) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        education_year: true,
        study_program: true,
        university: true,
        faculty: true,
        gpa: true,
        profileImage: true,
        admission_rounds: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

