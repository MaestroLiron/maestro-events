import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// יצירת מספר הצעה
// ======================================================

async function generateQuoteNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const now = new Date();

    const datePart =
      `${now.getFullYear()}` +
      `${String(now.getMonth() + 1).padStart(2, "0")}` +
      `${String(now.getDate()).padStart(2, "0")}`;

    const randomPart = Math.floor(
      1000 + Math.random() * 9000
    );

    const quoteNumber =
      `Q-${datePart}-${randomPart}`;

    const existing =
      await prisma.quote.findUnique({
        where: {
          quoteNumber,
        },
      });

    if (!existing) {
      return quoteNumber;
    }
  }

  throw new Error(
    "לא ניתן ליצור מספר הצעה ייחודי"
  );
}

// ======================================================
// GET - כל הצעות המחיר
// ======================================================

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "אין הרשאה. יש להתחבר למערכת.",
        },
        {
          status: 401,
        }
      );
    }

    const quotes =
      await prisma.quote.findMany({
        orderBy: {
          createdAt: "desc",
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

    return NextResponse.json(quotes);
  } catch (error) {
    console.error(
      "GET QUOTES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בטעינת הצעות המחיר",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST - יצירת הצעת מחיר
// ======================================================

export async function POST(
  request: Request
) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "אין הרשאה. יש להתחבר למערכת.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const clientId = Number(
      body.clientId
    );

    if (
      !clientId ||
      !Number.isInteger(clientId)
    ) {
      return NextResponse.json(
        {
          error:
            "יש לבחור לקוח.",
        },
        {
          status: 400,
        }
      );
    }

    const client =
      await prisma.client.findUnique({
        where: {
          id: clientId,
        },
      });

    if (!client) {
      return NextResponse.json(
        {
          error:
            "הלקוח לא נמצא.",
        },
        {
          status: 404,
        }
      );
    }

    const rawItems = Array.isArray(
      body.items
    )
      ? body.items
      : [];

    const items = rawItems
      .map((item: any, index: number) => {
        const quantity =
          Math.max(
            1,
            Number(item.quantity) || 1
          );

        const unitPrice =
          Math.max(
            0,
            Number(item.unitPrice) || 0
          );

        const totalPrice =
          quantity * unitPrice;

        return {
          serviceId:
            item.serviceId
              ? Number(item.serviceId)
              : null,

          serviceName:
            String(
              item.serviceName || ""
            ).trim(),

          description:
            item.description
              ? String(
                  item.description
                ).trim()
              : null,

          quantity,

          unitPrice,

          totalPrice,

          sortOrder: index,
        };
      })
      .filter(
        (item: any) =>
          item.serviceName
      );

    const totalAmount =
      items.reduce(
        (
          sum: number,
          item: any
        ) =>
          sum +
          Number(
            item.totalPrice || 0
          ),
        0
      );

    const quoteNumber =
      await generateQuoteNumber();

    const quote =
      await prisma.quote.create({
        data: {
          quoteNumber,

          clientId,

          title:
            String(
              body.title ||
                "הצעת מחיר"
            ).trim(),

          eventType:
            body.eventType
              ? String(
                  body.eventType
                ).trim()
              : null,

          eventDate:
            body.eventDate
              ? String(
                  body.eventDate
                ).trim()
              : null,

          guests:
            body.guests
              ? String(
                  body.guests
                ).trim()
              : null,

          location:
            body.location
              ? String(
                  body.location
                ).trim()
              : null,

          totalAmount,

          notes:
            body.notes
              ? String(
                  body.notes
                ).trim()
              : null,

          status:
            body.status === "SENT"
              ? "SENT"
              : "DRAFT",

          sentAt:
            body.status === "SENT"
              ? new Date()
              : null,

          publicToken:
            crypto.randomUUID(),

          items: {
            create: items,
          },
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
      quote,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE QUOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה ביצירת הצעת המחיר",
      },
      {
        status: 500,
      }
    );
  }
}