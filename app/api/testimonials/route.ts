import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// GET
// ==========================================
// ברירת מחדל:
// מחזיר את כל ההמלצות - עבור הדאשבורד.
//
// אם שולחים ?approved=true
// מחזיר רק המלצות שאושרו - עבור האתר.
// ==========================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const approvedOnly = searchParams.get("approved") === "true";

    const testimonials = await prisma.testimonial.findMany({
      where: approvedOnly
        ? {
            status: "APPROVED",
          }
        : undefined,

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonials GET error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת ההמלצות",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST
// ==========================================
// יצירת המלצה חדשה.
//
// חשוב:
// המלצה חדשה מקבלת PENDING
// ולא מופיעה באתר עד שאתה מאשר אותה.
// ==========================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      eventType,
      rating,
      content,
    } = body;

    if (!name || !content || !rating) {
      return NextResponse.json(
        {
          error: "נא למלא את כל שדות החובה",
        },
        {
          status: 400,
        }
      );
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        {
          error: "הדירוג חייב להיות בין 1 ל־5",
        },
        {
          status: 400,
        }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: String(name).trim(),

        eventType:
          eventType && String(eventType).trim() !== ""
            ? String(eventType).trim()
            : null,

        rating: numericRating,

        content: String(content).trim(),

        // ====================================
        // חשוב מאוד:
        // המלצה חדשה ממתינה לאישור
        // ====================================
        status: "PENDING",
      },
    });

    return NextResponse.json(
      testimonial,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Testimonials POST error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בשמירת ההמלצה",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PATCH
// ==========================================
// שינוי סטטוס של המלצה.
//
// status יכול להיות:
// PENDING
// APPROVED
// REJECTED
// ==========================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const status = String(body.status || "").toUpperCase();

    if (!id) {
      return NextResponse.json(
        {
          error: "חסר מזהה המלצה",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "סטטוס לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Testimonials PATCH error:", error);

    return NextResponse.json(
      {
        error: "שגיאה בעדכון ההמלצה",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE
// ==========================================

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          error: "חסר מזהה המלצה",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.testimonial.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Testimonials DELETE error:", error);

    return NextResponse.json(
      {
        error: "שגיאה במחיקת ההמלצה",
      },
      {
        status: 500,
      }
    );
  }
}