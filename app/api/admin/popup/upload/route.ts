import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getAdminUser, isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "יש להתחבר למערכת" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "אין הרשאה להעלות תמונות" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "לא נבחרה תמונה" },
        { status: 400 }
      );
    }

    const allowedTypes: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extension = allowedTypes[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "אפשר להעלות JPG, PNG או WEBP בלבד" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "גודל התמונה מוגבל ל־10MB" },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "popup"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filename =
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;

    const filePath = path.join(uploadDirectory, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    const url = `/uploads/popup/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error("POPUP UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה בהעלאת התמונה" },
      { status: 500 }
    );
  }
}