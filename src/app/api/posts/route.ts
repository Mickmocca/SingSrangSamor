import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 })
    }

    const data = await request.json()
    const { content } = data

    if (!content || content.trim() === "") {
      return NextResponse.json({ success: false, message: "กรุณากรอกเนื้อหาโพสต์" }, { status: 400 })
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            profileImage: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "โพสต์สำเร็จ",
      post,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างโพสต์" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 })
    }

    // Get page and limit from query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Fetch posts with user information
    const posts = await prisma.post.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            username: true,
            profileImage: true,
          }
        }
      }
    })

    // Count total posts
    const totalPosts = await prisma.post.count()

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงโพสต์" }, { status: 500 })
  }
}
