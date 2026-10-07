import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// ==========================================
// GET — קבלת כל הלידים
// ==========================================

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("================================");
    console.error("❌ GET LEADS ERROR");
    console.error(error);
    console.error("================================");

    return NextResponse.json(
      {
        error: "שגיאה בטעינת הלידים",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST — יצירת ליד חדש
// ==========================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("================================");
    console.log("📥 POST LEAD");
    console.log("BODY:", body);
    console.log("================================");

    // ==========================================
    // בדיקת שדות חובה
    // ==========================================

    if (
      !body.fullName ||
      !String(body.fullName).trim() ||
      !body.phone ||
      !String(body.phone).trim() ||
      !body.eventType ||
      !String(body.eventType).trim()
    ) {
      return NextResponse.json(
        {
          error: "שם, טלפון וסוג אירוע הם שדות חובה",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // מספר מוזמנים
    // ==========================================

    let guests: number | null = null;

    if (
      body.guests !== undefined &&
      body.guests !== null &&
      body.guests !== ""
    ) {
      const parsedGuests = Number(body.guests);

      if (Number.isFinite(parsedGuests)) {
        guests = parsedGuests;
      }
    }

    // ==========================================
    // תאריך אירוע
    // ==========================================

    let eventDate: Date | null = null;

    if (body.eventDate) {
      const parsedDate = new Date(body.eventDate);

      if (!Number.isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
    }

    // ==========================================
    // שירותים
    // ==========================================

    let services: string | null = null;

    if (
      Array.isArray(body.services) &&
      body.services.length > 0
    ) {
      services = body.services
        .map((service: unknown) => String(service))
        .join(", ");
    }

    // ==========================================
    // יצירת הליד במסד הנתונים
    // ==========================================

    const lead = await prisma.lead.create({
      data: {
        fullName: String(body.fullName).trim(),

        phone: String(body.phone).trim(),

        email:
          body.email &&
          String(body.email).trim()
            ? String(body.email).trim()
            : null,

        eventType: String(body.eventType).trim(),

        eventDate,

        guests,

        services,

        notes:
          body.notes &&
          String(body.notes).trim()
            ? String(body.notes).trim()
            : null,

        status: "חדש",
      },
    });

    console.log("================================");
    console.log("✅ LEAD CREATED");
    console.log(lead);
    console.log("================================");

    return NextResponse.json(lead, {
      status: 201,
    });
  } catch (error) {
    console.error("================================");
    console.error("❌ POST LEAD ERROR");
    console.error(error);
    console.error("================================");

    return NextResponse.json(
      {
        error: "שגיאה בשמירת הליד",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE — מחיקת ליד
// ==========================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    console.log("================================");
    console.log("🗑️ DELETE LEAD");
    console.log("BODY:", body);
    console.log("================================");

    // ==========================================
    // בדיקת מזהה
    // ==========================================

    if (!body.id || !String(body.id).trim()) {
      return NextResponse.json(
        {
          error: "חסר מזהה ליד",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // המרת ID ממחרוזת למספר
    // ==========================================

    const leadId = Number(body.id);

    if (!Number.isInteger(leadId)) {
      return NextResponse.json(
        {
          error: "מזהה ליד לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // בדיקה שהליד קיים
    // ==========================================

    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        {
          error: "הליד לא נמצא",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // מחיקת הליד
    // ==========================================

    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });

    console.log("================================");
    console.log("✅ LEAD DELETED");
    console.log("LEAD ID:", leadId);
    console.log("================================");

    return NextResponse.json({
      success: true,
      message: "הליד נמחק בהצלחה",
      id: leadId,
    });
  } catch (error) {
    console.error("================================");
    console.error("❌ DELETE LEAD ERROR");
    console.error(error);
    console.error("================================");

    return NextResponse.json(
      {
        error: "שגיאה במחיקת הליד",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}