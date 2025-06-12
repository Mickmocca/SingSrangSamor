import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { username, password, education_year, study_program, university, faculty, gpa, admission_rounds } = data

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "ชื่อผู้ใช้นี้มีในระบบแล้ว" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        education_year,
        study_program,
        university,
        faculty,
        gpa,
        profileImage: "/placeholder.svg?height=200&width=200",
        admission_rounds: admission_rounds || [],
      },
    })

    // Generate token
    const token = generateToken(user.id)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "ลงทะเบียนสำเร็จ",
      user: {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage,
      },
    })

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 })
  }
}

