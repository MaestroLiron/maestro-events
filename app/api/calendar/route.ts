import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// ==========================================
// GET — קבלת כל אירועי היומן
// כולל לקוח + שירותים + תשלומים
// ==========================================

export async function GET() {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: {
        eventDate: "asc",
      },

      include: {
        client: {
          include: {
            services: {
              orderBy: {
                createdAt: "asc",
              },
            },

            payments: {
              orderBy: {
                paymentDate: "desc",
              },
            },
          },
        },
      },
    });

    // ========================================
    // חישוב סכומים לכל אירוע
    // ========================================

    const eventsWithFinancials = events.map((event) => {
      const servicesTotal =
        event.client?.services?.reduce(
          (sum, service) => sum + service.amount,
          0
        ) || 0;

      const paymentsTotal =
        event.client?.payments?.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ) || 0;

      const totalAmount =
        event.client?.totalAmount ?? servicesTotal;

      const paidAmount =
        event.client?.paidAmount ?? paymentsTotal;

      const remainingAmount =
        Math.max(totalAmount - paidAmount, 0);

      return {
        ...event,

        financials: {
          servicesTotal,
          totalAmount,
          paidAmount,
          remainingAmount,
        },
      };
    });

    return NextResponse.json(eventsWithFinancials);

  } catch (error) {

    console.error(
      "GET calendar error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בטעינת היומן",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// POST — הוספת אירוע ליומן
// ==========================================

export async function POST(request: Request) {
  try {

    const body = await request.json();

    if (!body.title || !body.eventDate) {
      return NextResponse.json(
        {
          error: "כותרת ותאריך אירוע הם שדות חובה",
        },
        {
          status: 400,
        }
      );
    }

    const clientId = body.clientId
      ? Number(body.clientId)
      : null;


    // ========================================
    // בדיקה שהלקוח קיים
    // ========================================

    if (clientId) {

      const client =
        await prisma.client.findUnique({
          where: {
            id: clientId,
          },
        });

      if (!client) {
        return NextResponse.json(
          {
            error: "הלקוח לא נמצא",
          },
          {
            status: 404,
          }
        );
      }
    }


    // ========================================
    // יצירת האירוע
    // ========================================

    const event =
      await prisma.calendarEvent.create({
        data: {

          clientId,

          title:
            body.title,

          eventType:
            body.eventType || null,

          eventDate:
            body.eventDate,

          location:
            body.location || null,

          guests:
            body.guests || null,

          phone:
            body.phone || null,

          notes:
            body.notes || null,

          status:
            body.status || "מתוכנן",
        },

        include: {
          client: {
            include: {
              services: true,
              payments: true,
            },
          },
        },
      });


    // ========================================
    // מסמנים שהלקוח נמצא ביומן
    // ========================================

    if (clientId) {

      await prisma.client.update({
        where: {
          id: clientId,
        },

        data: {
          addedToCalendar: true,
        },
      });
    }


    // ========================================
    // חישוב שירותים
    // ========================================

    const servicesTotal =
      event.client?.services?.reduce(
        (sum, service) =>
          sum + service.amount,
        0
      ) || 0;


    // ========================================
    // חישוב תשלומים
    // ========================================

    const paymentsTotal =
      event.client?.payments?.reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      ) || 0;


    // ========================================
    // סכומים
    // ========================================

    const totalAmount =
      event.client?.totalAmount ??
      servicesTotal;

    const paidAmount =
      event.client?.paidAmount ??
      paymentsTotal;

    const remainingAmount =
      Math.max(
        totalAmount - paidAmount,
        0
      );


    return NextResponse.json(
      {
        ...event,

        financials: {
          servicesTotal,
          totalAmount,
          paidAmount,
          remainingAmount,
        },
      },

      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "POST calendar error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בהוספת האירוע ליומן",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// DELETE — מחיקת אירוע מהיומן
// ==========================================

export async function DELETE(request: Request) {
  try {

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          error: "חסר מזהה אירוע",
        },
        {
          status: 400,
        }
      );
    }


    const event =
      await prisma.calendarEvent.findUnique({
        where: {
          id: Number(body.id),
        },
      });


    if (!event) {
      return NextResponse.json(
        {
          error: "האירוע לא נמצא",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================
    // מחיקת האירוע
    // ========================================

    await prisma.calendarEvent.delete({
      where: {
        id: Number(body.id),
      },
    });


    // ========================================
    // בדיקה אם נשארו ללקוח אירועים
    // ========================================

    if (event.clientId) {

      const remainingEvents =
        await prisma.calendarEvent.count({
          where: {
            clientId: event.clientId,
          },
        });


      if (remainingEvents === 0) {

        await prisma.client.update({
          where: {
            id: event.clientId,
          },

          data: {
            addedToCalendar: false,
          },
        });
      }
    }


    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(
      "DELETE calendar error:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה במחיקת האירוע",
      },
      {
        status: 500,
      }
    );
  }
}