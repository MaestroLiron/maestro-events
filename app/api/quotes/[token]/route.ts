import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// GET
// ======================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  try {
    const { token } =
      await context.params;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "חסר קישור להצעה.",
        },
        {
          status: 400,
        }
      );
    }

    const quote =
      await prisma.quote.findUnique({
        where: {
          publicToken: token,
        },
        include: {
          client: true,
          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    if (!quote) {
      return NextResponse.json(
        {
          error:
            "הצעת המחיר לא נמצאה.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      quote
    );
  } catch (error) {
    console.error(
      "PUBLIC QUOTE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בטעינת הצעת המחיר",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST - אישור / דחייה
// ======================================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  try {
    const { token } =
      await context.params;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "חסר קישור להצעה.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const status =
      String(
        body.status || ""
      );

    if (
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      return NextResponse.json(
        {
          error:
            "סטטוס לא תקין.",
        },
        {
          status: 400,
        }
      );
    }

    const quote =
      await prisma.quote.findUnique({
        where: {
          publicToken: token,
        },
      });

    if (!quote) {
      return NextResponse.json(
        {
          error:
            "הצעת המחיר לא נמצאה.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      quote.status ===
        "EXPIRED"
    ) {
      return NextResponse.json(
        {
          error:
            "הצעת המחיר פגה ואינה ניתנת לעדכון.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await prisma.quote.update({
        where: {
          id: quote.id,
        },

        data: {
          status,

          approvedAt:
            status === "APPROVED"
              ? new Date()
              : null,

          rejectedAt:
            status === "REJECTED"
              ? new Date()
              : null,
        },

        include: {
          client: true,
          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(
      "PUBLIC QUOTE RESPONSE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בעדכון הצעת המחיר",
      },
      {
        status: 500,
      }
    );
  }
}