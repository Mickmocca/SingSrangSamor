import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `profile-${user.id}-${timestamp}.${file.name.split('.').pop()}`;
    
    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // Return the public URL
    return NextResponse.json({ 
      success: true, 
      url: blob.url
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, message: "Error uploading file" }, { status: 500 });
  }
}