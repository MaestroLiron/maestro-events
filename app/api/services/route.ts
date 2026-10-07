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
// GET — קבלת כל השירותים
// ==========================================

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET services error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת השירותים",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST — הוספת שירות
// ==========================================

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const slug = formData.get("slug");
    const description = formData.get("description");
    const subtitle = formData.get("subtitle");
    const longDescription = formData.get("longDescription");
    const features = formData.get("features");
    const sortOrderValue = formData.get("sortOrder");
    const isActiveValue = formData.get("isActive");
    const image = formData.get("image");

    // ========================================
    // בדיקות
    // ========================================

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "יש למלא כותרת" },
        { status: 400 }
      );
    }

    if (typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { error: "יש למלא slug" },
        { status: 400 }
      );
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "יש למלא תיאור" },
        { status: 400 }
      );
    }

    // ========================================
    // תמונה
    // ========================================

    if (
      !image ||
      !(image instanceof File) ||
      image.size === 0
    ) {
      return NextResponse.json(
        { error: "יש לבחור תמונה מהמחשב" },
        { status: 400 }
      );
    }

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
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (image.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "התמונה גדולה מדי. הגודל המקסימלי הוא 10MB",
        },
        { status: 400 }
      );
    }

    // ========================================
    // תיקיית תמונות
    // ========================================

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "services"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    // ========================================
    // סיומת
    // ========================================

    const extension =
      path.extname(image.name).toLowerCase() || ".jpg";

    // ========================================
    // שם קובץ בטוח
    // ========================================

    const safeSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9א-ת-_]/g, "-")
      .replace(/-+/g, "-");

    const fileName =
      `${safeSlug}-${Date.now()}${extension}`;

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    // ========================================
    // שמירת התמונה
    // ========================================

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const imageUrl = `/services/${fileName}`;

    // ========================================
    // sortOrder
    // ========================================

    let sortOrder = 0;

    if (
      typeof sortOrderValue === "string" &&
      sortOrderValue.trim() !== ""
    ) {
      const parsed = Number(sortOrderValue);

      if (!Number.isNaN(parsed)) {
        sortOrder = parsed;
      }
    }

    // ========================================
    // isActive
    // ========================================

    const isActive =
      isActiveValue === "false"
        ? false
        : true;

    // ========================================
    // יצירת השירות
    // ========================================

    const service =
      await prisma.service.create({
        data: {
          title: title.trim(),

          slug: slug.trim(),

          description: description.trim(),

          image: imageUrl,

          subtitle:
            typeof subtitle === "string" &&
            subtitle.trim() !== ""
              ? subtitle.trim()
              : null,

          longDescription:
            typeof longDescription === "string" &&
            longDescription.trim() !== ""
              ? longDescription.trim()
              : null,

          features:
            typeof features === "string" &&
            features.trim() !== ""
              ? features.trim()
              : null,

          sortOrder,

          isActive,
        },
      });

    return NextResponse.json(service, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST services error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה ביצירת השירות",
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