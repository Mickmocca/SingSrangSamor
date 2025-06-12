import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 })
    }

    const data = await request.json()
    const { email, education_year, study_program, university, faculty, gpa, profileImage, admission_rounds } = data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        education_year,
        study_program,
        university,
        faculty,
        gpa,
        profileImage,
        admission_rounds: admission_rounds || [],
      },
    })

    return NextResponse.json({
      success: true,
      message: "อัปเดตโปรไฟล์สำเร็จ",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        education_year: updatedUser.education_year,
        study_program: updatedUser.study_program,
        university: updatedUser.university,
        faculty: updatedUser.faculty,
        gpa: updatedUser.gpa,
        profileImage: updatedUser.profileImage,
        admission_rounds: updatedUser.admission_rounds,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" }, { status: 500 })
  }
}

