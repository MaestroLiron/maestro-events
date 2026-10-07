import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// ======================================================
// HELPERS
// ======================================================

function parseAmount(value: unknown): number {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}

function calculatePaymentStatus(
  totalAmount: number,
  paidAmount: number
): string {
  if (totalAmount <= 0 || paidAmount <= 0) {
    return "לא שולם";
  }

  if (paidAmount >= totalAmount) {
    return "שולם במלואו";
  }

  return "שולם חלקית";
}

// ======================================================
// GET — כל הלקוחות
// ======================================================

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        services: true,

        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },

        calendarEvents: true,
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("❌ GET CLIENTS ERROR:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת הלקוחות",

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

// ======================================================
// POST — יצירת לקוח חדש
// ======================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("================================");
    console.log("📥 CREATE CLIENT");
    console.log("BODY:", body);
    console.log("================================");

    // ==================================================
    // בדיקות בסיסיות
    // ==================================================

    if (
      !body.name ||
      !String(body.name).trim()
    ) {
      return NextResponse.json(
        {
          error: "יש להזין שם לקוח",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.phone ||
      !String(body.phone).trim()
    ) {
      return NextResponse.json(
        {
          error: "יש להזין מספר טלפון",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // סכומים
    // ==================================================

    let totalAmount = parseAmount(
      body.totalAmount
    );

    const paidAmount = parseAmount(
      body.paidAmount
    );

    if (paidAmount < 0) {
      return NextResponse.json(
        {
          error:
            "סכום התשלום לא יכול להיות שלילי",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // שירותים
    // ==================================================

    const serviceItems = Array.isArray(
      body.services
    )
      ? body.services
      : [];

    const validServices = serviceItems
      .map((service: any) => {
        const serviceName = String(
          service?.serviceName ??
            service?.name ??
            ""
        ).trim();

        const amount = parseAmount(
          service?.amount
        );

        return {
          serviceName,
          amount,
        };
      })
      .filter(
        (service: {
          serviceName: string;
          amount: number;
        }) =>
          service.serviceName !== ""
      );

    // ==================================================
    // חישוב סכום העסקה לפי השירותים
    // ==================================================

    if (validServices.length > 0) {
      totalAmount = validServices.reduce(
        (
          sum: number,
          service: {
            serviceName: string;
            amount: number;
          }
        ) => sum + service.amount,
        0
      );
    }

    // ==================================================
    // בדיקת תשלום
    // ==================================================

    if (
      totalAmount > 0 &&
      paidAmount > totalAmount
    ) {
      return NextResponse.json(
        {
          error:
            "הסכום ששולם לא יכול להיות גבוה מסכום העסקה",
        },
        {
          status: 400,
        }
      );
    }

    const remainingAmount = Math.max(
      totalAmount - paidAmount,
      0
    );

    const paymentStatus =
      calculatePaymentStatus(
        totalAmount,
        paidAmount
      );

    // ==================================================
    // TRANSACTION
    // ==================================================

    const result = await prisma.$transaction(
      async (tx) => {
        // ==============================================
        // יצירת לקוח
        // ==============================================

        const client =
          await tx.client.create({
            data: {
              name:
                String(
                  body.name
                ).trim(),

              phone:
                String(
                  body.phone
                ).trim(),

              email:
                body.email &&
                String(
                  body.email
                ).trim()
                  ? String(
                      body.email
                    ).trim()
                  : null,

              eventType:
                body.eventType &&
                String(
                  body.eventType
                ).trim()
                  ? String(
                      body.eventType
                    ).trim()
                  : null,

              eventDate:
                body.eventDate &&
                String(
                  body.eventDate
                ).trim()
                  ? String(
                      body.eventDate
                    ).trim()
                  : null,

              guests:
                body.guests !== undefined &&
                body.guests !== null &&
                body.guests !== ""
                  ? String(
                      body.guests
                    )
                  : null,

              location:
                body.location &&
                String(
                  body.location
                ).trim()
                  ? String(
                      body.location
                    ).trim()
                  : null,

              status:
                body.status &&
                String(
                  body.status
                ).trim()
                  ? String(
                      body.status
                    ).trim()
                  : "ליד",

              totalAmount,

              paidAmount,

              notes:
                body.notes &&
                String(
                  body.notes
                ).trim()
                  ? String(
                      body.notes
                    ).trim()
                  : null,

              additionalInfo:
                body.additionalInfo &&
                String(
                  body.additionalInfo
                ).trim()
                  ? String(
                      body.additionalInfo
                    ).trim()
                  : null,

              // ========================================
              // רשימת אלכוהול ומשקאות
              // ========================================

              alcoholList:
                body.alcoholList &&
                String(
                  body.alcoholList
                ).trim()
                  ? String(
                      body.alcoholList
                    ).trim()
                  : null,
            },
          });

        console.log(
          "✅ CLIENT CREATED:",
          client.id
        );

        // ==============================================
        // יצירת שירותים
        // ==============================================

        const createdServices = [];

        for (
          const service of validServices
        ) {
          const createdService =
            await tx.clientService.create({
              data: {
                clientId:
                  client.id,

                serviceName:
                  service.serviceName,

                amount:
                  service.amount,
              },
            });

          createdServices.push(
            createdService
          );
        }

        console.log(
          "🛠️ SERVICES CREATED:",
          createdServices.length
        );

        // ==============================================
        // יצירת תשלום ראשון
        // ==============================================

        let createdPayment = null;

        if (paidAmount > 0) {
          createdPayment =
            await tx.payment.create({
              data: {
                clientId:
                  client.id,

                amount:
                  paidAmount,

                method:
                  body.paymentMethod &&
                  String(
                    body.paymentMethod
                  ).trim()
                    ? String(
                        body.paymentMethod
                      ).trim()
                    : "לא צוין",

                notes:
                  "תשלום ראשון בעת הקמת הלקוח",

                paymentDate:
                  new Date(),
              },
            });

          console.log(
            "💰 FIRST PAYMENT CREATED:",
            createdPayment.id
          );
        }

        // ==============================================
        // שליפת הלקוח המלא
        // ==============================================

        const fullClient =
          await tx.client.findUnique({
            where: {
              id: client.id,
            },

            include: {
              services: true,

              payments: {
                orderBy: {
                  paymentDate:
                    "desc",
                },
              },

              calendarEvents: true,
            },
          });

        return {
          client:
            fullClient,

          paymentStatus,

          remainingAmount,

          createdServices,

          createdPayment,
        };
      }
    );

    // ==================================================
    // עדכון הפנייה שממנה נוצר הלקוח
    // ==================================================

    if (body.sourceLeadId) {
      const sourceLeadId =
        Number(
          body.sourceLeadId
        );

      if (
        Number.isInteger(
          sourceLeadId
        )
      ) {
        try {
          await prisma.lead.update({
            where: {
              id: sourceLeadId,
            },

            data: {
              status: "בטיפול",
            },
          });

          console.log(
            "🔗 SOURCE LEAD UPDATED:",
            sourceLeadId
          );
        } catch (leadError) {
          console.error(
            "⚠️ CLIENT CREATED BUT LEAD UPDATE FAILED:",
            leadError
          );
        }
      }
    }

    // ==================================================
    // מחזירים את הלקוח עצמו
    // ==================================================

    return NextResponse.json(
      result.client,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "❌ CREATE CLIENT ERROR:"
    );

    console.error(error);

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בשמירת הלקוח",

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

// ======================================================
// PUT — עריכת לקוח
// ======================================================

export async function PUT(request: Request) {
  try {
    const body =
      await request.json();

    // ==================================================
    // בדיקת ID
    // ==================================================

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "חסר מזהה לקוח",
        },
        {
          status: 400,
        }
      );
    }

    const clientId =
      Number(body.id);

    if (
      !Number.isInteger(
        clientId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "מזהה לקוח לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // בדיקות בסיסיות
    // ==================================================

    if (
      !body.name ||
      !String(body.name).trim()
    ) {
      return NextResponse.json(
        {
          error:
            "יש להזין שם לקוח",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.phone ||
      !String(body.phone).trim()
    ) {
      return NextResponse.json(
        {
          error:
            "יש להזין מספר טלפון",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // סכומים
    // ==================================================

    let totalAmount =
      parseAmount(
        body.totalAmount
      );

    const paidAmount =
      parseAmount(
        body.paidAmount
      );

    // ==================================================
    // שירותים
    // ==================================================

    const serviceItems =
      Array.isArray(
        body.services
      )
        ? body.services
        : [];

    const validServices =
      serviceItems
        .map((service: any) => {
          const serviceName =
            String(
              service?.serviceName ??
                service?.name ??
                ""
            ).trim();

          const amount =
            parseAmount(
              service?.amount
            );

          return {
            serviceName,
            amount,
          };
        })
        .filter(
          (service: {
            serviceName: string;
            amount: number;
          }) =>
            service.serviceName !== ""
        );

    // ==================================================
    // חישוב מחדש לפי השירותים
    // ==================================================

    if (
      validServices.length > 0
    ) {
      totalAmount =
        validServices.reduce(
          (
            sum: number,
            service: {
              serviceName: string;
              amount: number;
            }
          ) =>
            sum +
            service.amount,
          0
        );
    }

    // ==================================================
    // בדיקת תשלום
    // ==================================================

    if (
      totalAmount > 0 &&
      paidAmount > totalAmount
    ) {
      return NextResponse.json(
        {
          error:
            "הסכום ששולם לא יכול להיות גבוה מסכום העסקה",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // TRANSACTION
    // ==================================================

    const updatedClient =
      await prisma.$transaction(
        async (tx) => {
          // ============================================
          // עדכון הלקוח
          // ============================================

          await tx.client.update({
            where: {
              id: clientId,
            },

            data: {
              name:
                String(
                  body.name
                ).trim(),

              phone:
                String(
                  body.phone
                ).trim(),

              email:
                body.email &&
                String(
                  body.email
                ).trim()
                  ? String(
                      body.email
                    ).trim()
                  : null,

              eventType:
                body.eventType &&
                String(
                  body.eventType
                ).trim()
                  ? String(
                      body.eventType
                    ).trim()
                  : null,

              eventDate:
                body.eventDate &&
                String(
                  body.eventDate
                ).trim()
                  ? String(
                      body.eventDate
                    ).trim()
                  : null,

              guests:
                body.guests !==
                  undefined &&
                body.guests !==
                  null &&
                body.guests !== ""
                  ? String(
                      body.guests
                    )
                  : null,

              location:
                body.location &&
                String(
                  body.location
                ).trim()
                  ? String(
                      body.location
                    ).trim()
                  : null,

              status:
                body.status &&
                String(
                  body.status
                ).trim()
                  ? String(
                      body.status
                    ).trim()
                  : "ליד",

              totalAmount,

              paidAmount,

              notes:
                body.notes &&
                String(
                  body.notes
                ).trim()
                  ? String(
                      body.notes
                    ).trim()
                  : null,

              additionalInfo:
                body.additionalInfo &&
                String(
                  body.additionalInfo
                ).trim()
                  ? String(
                      body.additionalInfo
                    ).trim()
                  : null,

              // ========================================
              // רשימת אלכוהול ומשקאות
              // ========================================

              alcoholList:
                body.alcoholList &&
                String(
                  body.alcoholList
                ).trim()
                  ? String(
                      body.alcoholList
                    ).trim()
                  : null,
            },
          });

          // ============================================
          // עדכון השירותים
          // ============================================

          if (
            Array.isArray(
              body.services
            )
          ) {
            await tx.clientService.deleteMany(
              {
                where: {
                  clientId,
                },
              }
            );

            for (
              const service of validServices
            ) {
              await tx.clientService.create({
                data: {
                  clientId,

                  serviceName:
                    service.serviceName,

                  amount:
                    service.amount,
                },
              });
            }
          }

          // ============================================
          // החזרת לקוח מלא
          // ============================================

          return tx.client.findUnique({
            where: {
              id: clientId,
            },

            include: {
              services: true,

              payments: {
                orderBy: {
                  paymentDate:
                    "desc",
                },
              },

              calendarEvents: true,
            },
          });
        }
      );

    return NextResponse.json(
      updatedClient
    );
  } catch (error) {
    console.error(
      "❌ UPDATE CLIENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בעדכון הלקוח",

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

// ======================================================
// PATCH — תשלום / יומן
// ======================================================

export async function PATCH(request: Request) {
  try {
    const body =
      await request.json();

    // ==================================================
    // בדיקת ID
    // ==================================================

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "חסר מזהה לקוח",
        },
        {
          status: 400,
        }
      );
    }

    const clientId =
      Number(body.id);

    if (
      !Number.isInteger(
        clientId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "מזהה לקוח לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // הוספת תשלום
    // ==================================================

    if (
      body.paymentAmount !==
        undefined &&
      body.paymentAmount !==
        null
    ) {
      const paymentAmount =
        Number(
          body.paymentAmount
        );

      if (
        !Number.isFinite(
          paymentAmount
        ) ||
        paymentAmount <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "סכום התשלום חייב להיות גדול מ־0",
          },
          {
            status: 400,
          }
        );
      }

      const client =
        await prisma.client.findUnique(
          {
            where: {
              id: clientId,
            },
          }
        );

      if (!client) {
        return NextResponse.json(
          {
            error:
              "הלקוח לא נמצא",
          },
          {
            status: 404,
          }
        );
      }

      const totalAmount =
        Number(
          client.totalAmount || 0
        );

      const currentPaid =
        Number(
          client.paidAmount || 0
        );

      const remaining =
        Math.max(
          totalAmount -
            currentPaid,
          0
        );

      if (
        paymentAmount >
        remaining
      ) {
        return NextResponse.json(
          {
            error: `הסכום גבוה מהיתרה. היתרה היא ₪${remaining.toLocaleString(
              "he-IL"
            )}`,
          },
          {
            status: 400,
          }
        );
      }

      const newPaid =
        currentPaid +
        paymentAmount;

      const updated =
        await prisma.$transaction(
          async (tx) => {
            // ==========================================
            // יצירת רשומת תשלום
            // ==========================================

            await tx.payment.create({
              data: {
                clientId,

                amount:
                  paymentAmount,

                method:
                  body.paymentMethod ||
                  "לא צוין",

                notes:
                  body.notes ||
                  null,

                paymentDate:
                  new Date(),
              },
            });

            // ==========================================
            // עדכון הסכום ששולם
            // ==========================================

            return tx.client.update({
              where: {
                id: clientId,
              },

              data: {
                paidAmount:
                  newPaid,
              },

              include: {
                services: true,

                payments: {
                  orderBy: {
                    paymentDate:
                      "desc",
                  },
                },

                calendarEvents:
                  true,
              },
            });
          }
        );

      return NextResponse.json(
        updated
      );
    }

    // ==================================================
    // עדכון מצב יומן
    // ==================================================

    if (
      body.addedToCalendar !==
      undefined
    ) {
      const client =
        await prisma.client.update({
          where: {
            id: clientId,
          },

          data: {
            addedToCalendar:
              body.addedToCalendar ===
              true,
          },

          include: {
            services: true,

            payments: {
              orderBy: {
                paymentDate:
                  "desc",
              },
            },

            calendarEvents: true,
          },
        });

      return NextResponse.json(
        client
      );
    }

    return NextResponse.json(
      {
        error:
          "לא נמצא עדכון לביצוע",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "❌ PATCH CLIENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "שגיאה בעדכון הלקוח",

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

// ======================================================
// DELETE — מחיקת לקוח
// ======================================================

export async function DELETE(
  request: Request
) {
  try {
    const body = await request.json();

    // ==================================================
    // בדיקת ID
    // ==================================================

    if (!body.id) {
      return NextResponse.json(
        {
          error: "חסר מזהה לקוח",
        },
        {
          status: 400,
        }
      );
    }

    const clientId = Number(body.id);

    if (!Number.isInteger(clientId)) {
      return NextResponse.json(
        {
          error: "מזהה לקוח לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // מחיקה מסודרת
    // ==================================================

    await prisma.$transaction(async (tx) => {
      // ================================================
      // בדיקה שהלקוח קיים
      // ================================================

      const client = await tx.client.findUnique({
        where: {
          id: clientId,
        },
      });

      if (!client) {
        throw new Error("הלקוח לא נמצא");
      }

      // ================================================
      // מחיקת שירותים של הלקוח
      // ================================================

      await tx.clientService.deleteMany({
        where: {
          clientId,
        },
      });

      // ================================================
      // מחיקת תשלומים של הלקוח
      // ================================================

      await tx.payment.deleteMany({
        where: {
          clientId,
        },
      });

      // ================================================
      // מחיקת אירועים ביומן של הלקוח
      // ================================================

      await tx.calendarEvent.deleteMany({
        where: {
          clientId,
        },
      });

      // ================================================
      // מחיקת גלריות של הלקוח
      // ================================================
      //
      // GalleryImage ו-GalleryDownload מוגדרים אצלך
      // עם onDelete: Cascade, ולכן מחיקת הגלריה
      // תמחק גם את התמונות וההורדות הקשורות אליה.
      //

      const galleries = await tx.clientGallery.findMany({
        where: {
          clientId,
        },

        select: {
          id: true,
        },
      });

      for (const gallery of galleries) {
        await tx.clientGallery.delete({
          where: {
            id: gallery.id,
          },
        });
      }

      // ================================================
// מחיקת הצעות מחיר של הלקוח
// ================================================
//
// QuoteItem מוגדר עם onDelete: Cascade,
// ולכן מחיקת ההצעה תמחק גם את הפריטים שלה.
//

await tx.quote.deleteMany({
  where: {
    clientId,
  },
});

// ================================================
// מחיקת חוזים של הלקוח
// ================================================

await tx.contract.deleteMany({
  where: {
    clientId,
  },
});

      // ================================================
      // לבסוף — מחיקת הלקוח
      // ================================================

      await tx.client.delete({
        where: {
          id: clientId,
        },
      });
    });

    console.log(
      "✅ CLIENT DELETED:",
      clientId
    );

    return NextResponse.json({
      success: true,
      message: "הלקוח נמחק בהצלחה",
    });
  } catch (error) {
    console.error(
      "❌ DELETE CLIENT ERROR:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    if (errorMessage === "הלקוח לא נמצא") {
      return NextResponse.json(
        {
          error: "הלקוח לא נמצא",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        error: "שגיאה במחיקת הלקוח",
        details: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}