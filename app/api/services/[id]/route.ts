import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// ==========================================
// Prisma
// ==========================================

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

// ==========================================
// PUT — החלפת תמונת שירות
// ==========================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ========================================
    // קבלת ID
    // ========================================

    const { id } = await context.params;

    const serviceId = Number(id);

    if (!Number.isInteger(serviceId)) {
      return NextResponse.json(
        {
          error: "מזהה שירות לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // בדיקה שהשירות קיים
    // ========================================

    const existingService =
      await prisma.service.findUnique({
        where: {
          id: serviceId,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error: "השירות לא נמצא",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // קבלת FormData
    // ========================================

    const formData = await request.formData();

    const image = formData.get("image");

    // ========================================
    // בדיקת תמונה
    // ========================================

    if (
      !image ||
      !(image instanceof File) ||
      image.size === 0
    ) {
      return NextResponse.json(
        {
          error: "יש לבחור תמונה",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // סוגי תמונות מותרים
    // ========================================

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error:
            "סוג הקובץ אינו נתמך. ניתן להעלות JPG, PNG, WEBP או GIF",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // הגבלת גודל — 10MB
    // ========================================

    const maxSize =
      10 * 1024 * 1024;

    if (image.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "התמונה גדולה מדי. הגודל המקסימלי הוא 10MB",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // תיקיית התמונות
    // ========================================

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "services"
      );

    await mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    // ========================================
    // סיומת
    // ========================================

    const extension =
      path
        .extname(image.name)
        .toLowerCase() || ".jpg";

    // ========================================
    // שם קובץ
    // ========================================

    const safeSlug =
      existingService.slug
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9א-ת-_]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const fileName =
      `${safeSlug}-${Date.now()}${extension}`;

    const filePath =
      path.join(
        uploadDirectory,
        fileName
      );

    // ========================================
    // שמירת התמונה
    // ========================================

    const bytes =
      await image.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    await writeFile(
      filePath,
      buffer
    );

    // ========================================
    // כתובת התמונה
    // ========================================

    const imageUrl =
      `/services/${fileName}`;

    // ========================================
    // עדכון השירות
    // ========================================

    const service =
      await prisma.service.update({
        where: {
          id: serviceId,
        },
        data: {
          image: imageUrl,
        },
      });

    // ========================================
    // החזרה
    // ========================================

    return NextResponse.json(
      service
    );
  } catch (error) {
    console.error(
      "PUT service image error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בעדכון תמונת השירות",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}