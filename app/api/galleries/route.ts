import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// סיסמת מנהל למחיקת גלריה
// ==========================================

const DELETE_PASSWORD = "1234";

// ==========================================
// GET - קבלת כל הגלריות
// ==========================================

export async function GET() {
  try {
    const galleries = await prisma.clientGallery.findMany({
      include: {
        images: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error("Galleries GET error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת הגלריות",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST
//
// JSON = יצירת גלריה
//
// FormData = העלאת תמונות לגלריה
// ==========================================

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ======================================
    // העלאת תמונות
    // ======================================

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const galleryIdValue = formData.get("galleryId");

      const galleryId = Number(galleryIdValue);

      if (!galleryId || Number.isNaN(galleryId)) {
        return NextResponse.json(
          {
            error: "מזהה גלריה לא תקין",
          },
          {
            status: 400,
          }
        );
      }

      const gallery = await prisma.clientGallery.findUnique({
        where: {
          id: galleryId,
        },
      });

      if (!gallery) {
        return NextResponse.json(
          {
            error: "הגלריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      const files = formData.getAll("files");

      if (files.length === 0) {
        return NextResponse.json(
          {
            error: "לא נבחרו תמונות",
          },
          {
            status: 400,
          }
        );
      }

      // ======================================
      // תיקיית התמונות
      // ======================================

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "galleries",
        String(galleryId)
      );

      await mkdir(uploadDirectory, {
        recursive: true,
      });

      const createdImages = [];

      // ======================================
      // מעבר על כל הקבצים
      // ======================================

      for (const file of files) {
        if (!(file instanceof File)) {
          continue;
        }

        if (file.size <= 0) {
          continue;
        }

        // רק תמונות
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const originalName = file.name;

        const safeName = originalName
          .replace(/[^a-zA-Z0-9א-ת._-]/g, "_")
          .replace(/_+/g, "_");

        const uniqueName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}-${safeName}`;

        const filePath = path.join(
          uploadDirectory,
          uniqueName
        );

        const bytes = await file.arrayBuffer();

        await writeFile(
          filePath,
          Buffer.from(bytes)
        );

        const imageCount =
          await prisma.galleryImage.count({
            where: {
              galleryId,
            },
          });

        const image =
          await prisma.galleryImage.create({
            data: {
              galleryId,
              url: `/uploads/galleries/${galleryId}/${uniqueName}`,
              fileName: originalName,
              sortOrder: imageCount,
              isActive: true,
            },
          });

        createdImages.push(image);
      }

      return NextResponse.json(
        {
          success: true,
          uploaded: createdImages.length,
          images: createdImages,
        },
        {
          status: 201,
        }
      );
    }

    // ======================================
    // יצירת גלריה
    // ======================================

    const body = await request.json();

    const {
      name,
      password,
      expirationDays,
      clientId,
    } = body;

    // ======================================
    // בדיקות
    // ======================================

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          error: "נא להזין שם לגלריה",
        },
        {
          status: 400,
        }
      );
    }

    if (!password || String(password).trim().length < 4) {
      return NextResponse.json(
        {
          error: "הסיסמה חייבת להכיל לפחות 4 תווים",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // יצירת slug
    // ======================================

    const slug =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    // ======================================
    // חישוב תאריך תפוגה
    // ======================================

    let expiresAt: Date | null = null;

    if (
      expirationDays !== "never" &&
      expirationDays !== null &&
      expirationDays !== undefined
    ) {
      const days = Number(expirationDays);

      if (!Number.isNaN(days) && days > 0) {
        expiresAt = new Date();

        expiresAt.setDate(
          expiresAt.getDate() + days
        );
      }
    }

    // ======================================
    // בדיקת לקוח
    // ======================================

    let validClientId: number | null = null;

    if (
      clientId !== null &&
      clientId !== undefined &&
      clientId !== ""
    ) {
      const parsedClientId = Number(clientId);

      if (!Number.isNaN(parsedClientId)) {
        const client =
          await prisma.client.findUnique({
            where: {
              id: parsedClientId,
            },
          });

        if (client) {
          validClientId = parsedClientId;
        }
      }
    }

    // ======================================
    // יצירת הגלריה
    // ======================================

    const gallery =
      await prisma.clientGallery.create({
        data: {
          name: String(name).trim(),

          password: String(password).trim(),

          slug,

          expiresAt,

          isActive: true,

          allImagesDownloaded: false,

          completedDownloadAt: null,

          lastAccessAt: null,

          clientId: validClientId,
        },

        include: {
          images: {
            select: {
              id: true,
            },
          },
        },
      });

    return NextResponse.json(
      gallery,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Galleries POST error:", error);

    return NextResponse.json(
      {
        error: "שגיאה ביצירת הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PUT - עריכת גלריה
// ==========================================

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      galleryId,
      name,
      password,
      expirationDays,
    } = body;

    const id = Number(galleryId);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: "מזהה גלריה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    const existingGallery =
      await prisma.clientGallery.findUnique({
        where: {
          id,
        },
      });

    if (!existingGallery) {
      return NextResponse.json(
        {
          error: "הגלריה לא נמצאה",
        },
        {
          status: 404,
        }
      );
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          error: "שם הגלריה לא יכול להיות ריק",
        },
        {
          status: 400,
        }
      );
    }

    if (
      password !== undefined &&
      password !== null &&
      String(password).trim() !== "" &&
      String(password).trim().length < 4
    ) {
      return NextResponse.json(
        {
          error: "הסיסמה חייבת להכיל לפחות 4 תווים",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // חישוב תוקף חדש
    // ======================================

    let expiresAt = existingGallery.expiresAt;

    if (expirationDays === "never") {
      expiresAt = null;
    } else if (
      expirationDays !== null &&
      expirationDays !== undefined &&
      expirationDays !== ""
    ) {
      const days = Number(expirationDays);

      if (!Number.isNaN(days) && days > 0) {
        expiresAt = new Date();

        expiresAt.setDate(
          expiresAt.getDate() + days
        );
      }
    }

    // ======================================
    // נתוני עדכון
    // ======================================

    const updateData: {
      name: string;
      expiresAt: Date | null;
      password?: string;
    } = {
      name: String(name).trim(),
      expiresAt,
    };

    if (
      password !== undefined &&
      password !== null &&
      String(password).trim() !== ""
    ) {
      updateData.password =
        String(password).trim();
    }

    // ======================================
    // עדכון
    // ======================================

    const updatedGallery =
      await prisma.clientGallery.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          images: {
            select: {
              id: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      gallery: updatedGallery,
    });
  } catch (error) {
    console.error("Galleries PUT error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בעדכון הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE - מחיקת גלריה
//
// כרגע סיסמת מנהל:
// 1234
//
// בהמשך נעביר את זה להגדרות המערכת.
// ==========================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const galleryId = Number(body.galleryId);

    const password =
      String(body.password || "").trim();

    // ======================================
    // בדיקות
    // ======================================

    if (!galleryId || Number.isNaN(galleryId)) {
      return NextResponse.json(
        {
          error: "מזהה גלריה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "נא להזין סיסמת מנהל",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // בדיקת סיסמת מנהל
    // ======================================

    if (password !== DELETE_PASSWORD) {
      return NextResponse.json(
        {
          error: "סיסמת מנהל שגויה",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================
    // בדיקת הגלריה
    // ======================================

    const gallery =
      await prisma.clientGallery.findUnique({
        where: {
          id: galleryId,
        },
      });

    if (!gallery) {
      return NextResponse.json(
        {
          error: "הגלריה לא נמצאה",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // מחיקה
    // ======================================

    await prisma.clientGallery.delete({
      where: {
        id: galleryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "הגלריה נמחקה בהצלחה",
    });
  } catch (error) {
    console.error("Galleries DELETE error:", error);

    return NextResponse.json(
      {
        error: "שגיאה במחיקת הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}