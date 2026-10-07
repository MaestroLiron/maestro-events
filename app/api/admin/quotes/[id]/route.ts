import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// GET - הצעה בודדת
// ======================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await context.params;

    const quoteId = Number(id);

    if (!Number.isInteger(quoteId)) {
      return NextResponse.json(
        {
          error:
            "מזהה הצעה לא תקין.",
        },
        {
          status: 400,
        }
      );
    }

    const quote =
      await prisma.quote.findUnique({
        where: {
          id: quoteId,
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
      "GET QUOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בטעינת ההצעה",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PUT - עדכון הצעה
// ======================================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await context.params;

    const quoteId = Number(id);

    if (!Number.isInteger(quoteId)) {
      return NextResponse.json(
        {
          error:
            "מזהה הצעה לא תקין.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.quote.findUnique({
        where: {
          id: quoteId,
        },
      });

    if (!existing) {
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

    const body =
      await request.json();

    const clientId =
      Number(body.clientId);

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

    const rawItems =
      Array.isArray(body.items)
        ? body.items
        : [];

    const items =
      rawItems
        .map(
          (
            item: any,
            index: number
          ) => {
            const quantity =
              Math.max(
                1,
                Number(
                  item.quantity
                ) || 1
              );

            const unitPrice =
              Math.max(
                0,
                Number(
                  item.unitPrice
                ) || 0
              );

            return {
              serviceId:
                item.serviceId
                  ? Number(
                      item.serviceId
                    )
                  : null,

              serviceName:
                String(
                  item.serviceName ||
                    ""
                ).trim(),

              description:
                item.description
                  ? String(
                      item.description
                    ).trim()
                  : null,

              quantity,

              unitPrice,

              totalPrice:
                quantity *
                unitPrice,

              sortOrder: index,
            };
          }
        )
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

    const requestedStatus =
      String(
        body.status ||
          existing.status
      );

    const allowedStatuses = [
      "DRAFT",
      "SENT",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
    ];

    const status =
      allowedStatuses.includes(
        requestedStatus
      )
        ? requestedStatus
        : existing.status;

    const updateData: any = {
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

      status,
    };

    if (
      status === "SENT" &&
      existing.status !== "SENT"
    ) {
      updateData.sentAt =
        new Date();
    }

    if (
      status === "APPROVED" &&
      existing.status !==
        "APPROVED"
    ) {
      updateData.approvedAt =
        new Date();
      updateData.rejectedAt =
        null;
    }

    if (
      status === "REJECTED" &&
      existing.status !==
        "REJECTED"
    ) {
      updateData.rejectedAt =
        new Date();
      updateData.approvedAt =
        null;
    }

    await prisma.$transaction([
      prisma.quote.update({
        where: {
          id: quoteId,
        },
        data: updateData,
      }),

      prisma.quoteItem.deleteMany({
        where: {
          quoteId,
        },
      }),

      prisma.quoteItem.createMany({
        data: items.map(
          (item: any) => ({
            quoteId,

            serviceId:
              item.serviceId,

            serviceName:
              item.serviceName,

            description:
              item.description,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice,

            totalPrice:
              item.totalPrice,

            sortOrder:
              item.sortOrder,
          })
        ),
      }),
    ]);

    const quote =
      await prisma.quote.findUnique({
        where: {
          id: quoteId,
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
      quote
    );
  } catch (error) {
    console.error(
      "UPDATE QUOTE ERROR:",
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

// ======================================================
// DELETE - מחיקת הצעה
// ======================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await context.params;

    const quoteId = Number(id);

    if (!Number.isInteger(quoteId)) {
      return NextResponse.json(
        {
          error:
            "מזהה הצעה לא תקין.",
        },
        {
          status: 400,
        }
      );
    }

    const quote =
      await prisma.quote.findUnique({
        where: {
          id: quoteId,
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

    await prisma.quote.delete({
      where: {
        id: quoteId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "הצעת המחיר נמחקה בהצלחה",
    });
  } catch (error) {
    console.error(
      "DELETE QUOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה במחיקת הצעת המחיר",
      },
      {
        status: 500,
      }
    );
  }
}