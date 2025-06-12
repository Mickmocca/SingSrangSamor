import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Params = Promise<{ postId: string }>

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;
    
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 401 }
      );
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: "ไม่พบโพสต์" },
        { status: 404 }
      );
    }

    // Ensure the user can only delete their own posts
    if (post.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "คุณไม่มีสิทธิ์ลบโพสต์นี้" },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      success: true,
      message: "ลบโพสต์สำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดในการลบโพสต์" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบโพสต์" },
      { status: 500 }
    );
  }
}