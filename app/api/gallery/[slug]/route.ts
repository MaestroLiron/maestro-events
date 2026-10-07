import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// GET
// קבלת גלריה לפי slug
// לא מחזיר סיסמה
// ==========================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          error: "קישור גלריה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    const gallery =
      await prisma.clientGallery.findUnique({
        where: {
          slug,
        },
        include: {
          images: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
            select: {
              id: true,
              url: true,
              fileName: true,
            },
          },
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
    // בדיקת פעילות
    // ======================================

    if (!gallery.isActive) {
      return NextResponse.json(
        {
          error: "הגלריה אינה פעילה",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // בדיקת תוקף
    // ======================================

    if (
      gallery.expiresAt &&
      new Date(gallery.expiresAt).getTime() <
        Date.now()
    ) {
      return NextResponse.json(
        {
          error: "תוקף הגלריה הסתיים",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // עדכון כניסה אחרונה
    // ======================================

    await prisma.clientGallery.update({
      where: {
        id: gallery.id,
      },
      data: {
        lastAccessAt: new Date(),
      },
    });

    // ======================================
    // החזרת נתונים
    // ======================================

    return NextResponse.json({
      id: gallery.id,
      name: gallery.name,
      slug: gallery.slug,
      expiresAt: gallery.expiresAt,
      images: gallery.images,
    });
  } catch (error) {
    console.error(
      "Public gallery GET error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בטעינת הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST
// בדיקת סיסמת גלריה
// ==========================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          error: "קישור גלריה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const password = String(
      body.password || ""
    ).trim();

    if (!password) {
      return NextResponse.json(
        {
          error: "נא להזין סיסמה",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // חיפוש הגלריה
    // ======================================

    const gallery =
      await prisma.clientGallery.findUnique({
        where: {
          slug,
        },
        include: {
          images: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
            select: {
              id: true,
              url: true,
              fileName: true,
            },
          },
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
    // בדיקת פעילות
    // ======================================

    if (!gallery.isActive) {
      return NextResponse.json(
        {
          error: "הגלריה אינה פעילה",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // בדיקת תוקף
    // ======================================

    if (
      gallery.expiresAt &&
      new Date(gallery.expiresAt).getTime() <
        Date.now()
    ) {
      return NextResponse.json(
        {
          error: "תוקף הגלריה הסתיים",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // בדיקת סיסמה
    // ======================================

    if (password !== gallery.password) {
      return NextResponse.json(
        {
          error: "סיסמה שגויה",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================
    // עדכון כניסה אחרונה
    // ======================================

    await prisma.clientGallery.update({
      where: {
        id: gallery.id,
      },
      data: {
        lastAccessAt: new Date(),
      },
    });

    // ======================================
    // הצלחה
    // ======================================

    return NextResponse.json({
      success: true,

      gallery: {
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        expiresAt: gallery.expiresAt,
        images: gallery.images,
      },
    });
  } catch (error) {
    console.error(
      "Public gallery POST error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בפתיחת הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}