import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { username, password } = data

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user.id)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
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
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 })
  }
}

