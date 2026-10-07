import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { buildContractContent } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// HELPERS
// ======================================================

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function toPositiveId(value: unknown): number | null {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

// ======================================================
// CONTRACT INCLUDE
// ======================================================

const contractInclude = {
  client: {
    include: {
      services: true,
    },
  },
  template: true,
  service: true,
};

// ======================================================
// GET
// ======================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const clientIdParam = searchParams.get("clientId");
    const tokenParam = searchParams.get("token");

    // ==================================================
    // PUBLIC TOKEN
    // ==================================================

    if (tokenParam) {
      const token = tokenParam.trim();

      if (!token) {
        return NextResponse.json(
          {
            error: "Token לא תקין",
          },
          { status: 400 }
        );
      }

      const contract = await prisma.contract.findUnique({
        where: {
          publicToken: token,
        },
        include: contractInclude,
      });

      if (!contract) {
        return NextResponse.json(
          {
            error: "החוזה לא נמצא",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(contract);
    }

    // ==================================================
    // BY ID
    // ==================================================

    if (idParam) {
      const id = toPositiveId(idParam);

      if (!id) {
        return NextResponse.json(
          {
            error: "מזהה חוזה לא תקין",
          },
          { status: 400 }
        );
      }

      const contract = await prisma.contract.findUnique({
        where: {
          id,
        },
        include: contractInclude,
      });

      if (!contract) {
        return NextResponse.json(
          {
            error: "החוזה לא נמצא",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(contract);
    }

    // ==================================================
    // BY CLIENT
    // ==================================================

    if (clientIdParam) {
      const clientId = toPositiveId(clientIdParam);

      if (!clientId) {
        return NextResponse.json(
          {
            error: "מזהה לקוח לא תקין",
          },
          { status: 400 }
        );
      }

      const contracts = await prisma.contract.findMany({
        where: {
          clientId,
        },
        include: contractInclude,
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(contracts);
    }

    // ==================================================
    // ALL CONTRACTS
    // ==================================================

    const contracts = await prisma.contract.findMany({
      include: contractInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("❌ GET CONTRACTS ERROR:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת החוזים",
        details: errorMessage(error),
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST — CREATE CONTRACT
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("📄 POST /api/contracts");
    console.log("================================");

    // ==================================================
    // READ BODY
    // ==================================================

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ INVALID JSON BODY:", error);

      return NextResponse.json(
        {
          error: "הנתונים שנשלחו אינם תקינים",
        },
        { status: 400 }
      );
    }

    console.log("📦 CONTRACT BODY:", body);

    // ==================================================
    // CLIENT
    // ==================================================

    const clientId = toPositiveId(body.clientId);

    if (!clientId) {
      return NextResponse.json(
        {
          error: "חובה לבחור לקוח",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CHECK CLIENT + SERVICES
    // ==================================================

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        services: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "הלקוח לא נמצא",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // TEMPLATE
    // ==================================================

    let templateId: number | null = null;

    if (
      body.templateId !== undefined &&
      body.templateId !== null &&
      body.templateId !== ""
    ) {
      templateId = toPositiveId(body.templateId);

      if (!templateId) {
        return NextResponse.json(
          {
            error: "מזהה תבנית חוזה לא תקין",
          },
          { status: 400 }
        );
      }

      const template = await prisma.contractTemplate.findUnique({
        where: {
          id: templateId,
        },
      });

      if (!template) {
        return NextResponse.json(
          {
            error: "תבנית החוזה לא נמצאה",
          },
          { status: 404 }
        );
      }
    }

    // ==================================================
    // TITLE
    // ==================================================

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error: "חובה להזין כותרת לחוזה",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CONTENT
    // ======================================================

    let finalContent =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount = toNumberOrNull(
      body.totalAmount
    );

    if (
      totalAmount !== null &&
      totalAmount < 0
    ) {
      return NextResponse.json(
        {
          error: "סכום העסקה לא יכול להיות שלילי",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // DEPOSIT
    // ==================================================

    let depositAmount = toNumberOrNull(
      body.depositAmount
    );

    let depositPercent = toNumberOrNull(
      body.depositPercent
    );

    if (depositPercent === null) {
      depositPercent = 15;
    }

    if (
      depositPercent < 0 ||
      depositPercent > 100
    ) {
      return NextResponse.json(
        {
          error: "אחוז המקדמה חייב להיות בין 0 ל־100",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CALCULATE DEPOSIT
    // ==================================================

    let finalDepositAmount: number | null =
      depositAmount;

    let remainingAmount: number | null = null;

    if (totalAmount !== null) {
      if (finalDepositAmount === null) {
        finalDepositAmount = Number(
          (
            totalAmount *
            (depositPercent / 100)
          ).toFixed(2)
        );
      }

      if (finalDepositAmount < 0) {
        return NextResponse.json(
          {
            error: "סכום המקדמה לא יכול להיות שלילי",
          },
          { status: 400 }
        );
      }

      if (finalDepositAmount > totalAmount) {
        return NextResponse.json(
          {
            error:
              "המקדמה לא יכולה להיות גבוהה מסכום העסקה",
          },
          { status: 400 }
        );
      }

      remainingAmount = Number(
        (
          totalAmount -
          finalDepositAmount
        ).toFixed(2)
      );

      depositPercent =
        totalAmount > 0
          ? Number(
              (
                (finalDepositAmount /
                  totalAmount) *
                100
              ).toFixed(2)
            )
          : 0;
    } else {
      finalDepositAmount = null;
      remainingAmount = null;
    }

    // ==================================================
    // BUILD CONTRACT FROM TEMPLATES
    // ==================================================

    if (!finalContent) {
      console.log(
        "📄 Building contract from templates..."
      );

      // ----------------------------------------------
      // GENERAL TEMPLATE
      // ----------------------------------------------

      let generalContent = "";

      if (templateId) {
        const selectedTemplate =
          await prisma.contractTemplate.findUnique({
            where: {
              id: templateId,
            },
          });

        if (selectedTemplate) {
          generalContent = selectedTemplate.content;
        }
      } else {
        const generalTemplate =
          await prisma.contractTemplate.findFirst({
            where: {
              serviceId: null,
              isActive: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

        if (generalTemplate) {
          generalContent = generalTemplate.content;
        }
      }

      // ----------------------------------------------
      // SERVICE TEMPLATES
      // ----------------------------------------------

      const serviceSections: {
        serviceName: string;
        content: string;
      }[] = [];

      for (const clientService of client.services) {
        const serviceName =
          clientService.serviceName?.trim();

        if (!serviceName) {
          continue;
        }

        const service =
          await prisma.service.findFirst({
            where: {
              title: serviceName,
            },
          });

        if (!service) {
          console.warn(
            `⚠️ Service not found: ${serviceName}`
          );

          continue;
        }

        const serviceTemplate =
          await prisma.contractTemplate.findFirst({
            where: {
              serviceId: service.id,
              isActive: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

        if (!serviceTemplate) {
          console.warn(
            `⚠️ Contract template not found for service: ${serviceName}`
          );

          continue;
        }

        serviceSections.push({
          serviceName,
          content: serviceTemplate.content,
        });
      }

      // ----------------------------------------------
      // BUILD
      // ----------------------------------------------

      finalContent = buildContractContent({
        generalContent,

        serviceSections,

        variables: {
          clientName: client.name,
          clientPhone: client.phone,
          clientEmail: client.email,
          eventType: client.eventType,
          eventDate: client.eventDate,
          guests: client.guests,
          location: client.location,

          // 💰 Financial information
          totalAmount,
          depositAmount: finalDepositAmount,
          remainingAmount,

          // 📝 Client information
          notes: client.notes,
          additionalInfo: client.additionalInfo,

          // 🍸 Alcohol / beverage list
          alcoholList: client.alcoholList,
        },
      });

      console.log(
        "📄 GENERATED CONTRACT LENGTH:",
        finalContent.length
      );
    }

    // ==================================================
    // FINAL CONTENT VALIDATION
    // ==================================================

    if (!finalContent) {
      return NextResponse.json(
        {
          error:
            "לא נמצא תוכן חוזה או תבנית חוזה מתאימה",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // BUSINESS SIGNATURE
    // ==================================================
    // אנחנו לוקחים צילום של חתימת העסק בזמן יצירת החוזה.
    // כך גם אם בעתיד החתימה בהגדרות תשתנה,
    // החוזה שכבר נוצר ימשיך לשמור את החתימה המקורית.
    // ==================================================

    const businessSettings =
      await prisma.businessSettings.findUnique({
        where: {
          id: 1,
        },
      });

    const businessSignatureData =
      businessSettings?.businessSignatureData ?? null;

    console.log(
      "✍️ BUSINESS SIGNATURE:",
      businessSignatureData
        ? "EXISTS"
        : "NOT FOUND"
    );

    // ==================================================
    // PUBLIC TOKEN
    // ==================================================

    const publicToken = crypto.randomUUID();

    // ==================================================
    // CREATE CONTRACT
    // ==================================================

    const contract = await prisma.contract.create({
      data: {
        clientId,
        templateId,

        title,

        content: finalContent,

        status: "DRAFT",

        totalAmount,

        depositAmount: finalDepositAmount,

        remainingAmount,

        depositPercent,

        // ==================================================
        // BUSINESS SIGNATURE SNAPSHOT
        // ==================================================

        businessSignatureData,

        publicToken,
      },

      include: contractInclude,
    });

    console.log("================================");
    console.log("✅ CONTRACT CREATED");
    console.log("ID:", contract.id);
    console.log("CLIENT:", contract.client?.name);
    console.log("TOTAL:", contract.totalAmount);
    console.log("DEPOSIT:", contract.depositAmount);
    console.log("REMAINING:", contract.remainingAmount);
    console.log(
      "BUSINESS SIGNATURE:",
      contract.businessSignatureData
        ? "SAVED"
        : "NONE"
    );
    console.log(
      "SERVICES:",
      contract.client?.services?.length
    );
    console.log("TOKEN:", contract.publicToken);
    console.log("================================");

    return NextResponse.json(
      {
        success: true,
        contract,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("================================");
    console.error("❌ CREATE CONTRACT ERROR");
    console.error(error);
    console.error("================================");

    return NextResponse.json(
      {
        success: false,
        error: "שגיאה ביצירת החוזה",
        details: errorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PATCH
// ======================================================

export async function PATCH(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "נתוני העדכון אינם תקינים",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // ID
    // ==================================================

    const id = toPositiveId(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error: "מזהה חוזה לא תקין",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // FIND CONTRACT
    // ==================================================

    const existing = await prisma.contract.findUnique({
      where: {
        id,
      },
      include: contractInclude,
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "החוזה לא נמצא",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // PUBLIC TOKEN SECURITY
    // ==================================================

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const isPublicAction = Boolean(token);

    if (isPublicAction) {
      if (!existing.publicToken) {
        return NextResponse.json(
          {
            error: "לחוזה אין קישור ציבורי",
          },
          { status: 400 }
        );
      }

      if (token !== existing.publicToken) {
        return NextResponse.json(
          {
            error: "קישור החוזה אינו תקין",
          },
          { status: 403 }
        );
      }
    }

    // ==================================================
    // SIGNATURE
    // ==================================================

    if (
      body.signatureData !== undefined &&
      body.signatureData !== null &&
      body.signatureData !== ""
    ) {
      const signatureData = String(
        body.signatureData
      ).trim();

      if (!signatureData) {
        return NextResponse.json(
          {
            error: "החתימה אינה תקינה",
          },
          { status: 400 }
        );
      }

      const marketingConsent =
        body.marketingConsent === true;

      const contract =
        await prisma.contract.update({
          where: {
            id,
          },

          data: {
            signatureData,

            marketingConsent,

            signedAt: new Date(),

            status: "SIGNED",
          },

          include: contractInclude,
        });

      console.log(
        "================================"
      );
      console.log(
        "✅ CONTRACT SIGNED"
      );
      console.log(
        "CONTRACT ID:",
        contract.id
      );
      console.log(
        "CLIENT:",
        contract.client?.name
      );
      console.log(
        "MARKETING CONSENT:",
        marketingConsent
      );
      console.log(
        "SIGNED AT:",
        contract.signedAt
      );
      console.log(
        "BUSINESS SIGNATURE:",
        contract.businessSignatureData
          ? "EXISTS"
          : "NONE"
      );
      console.log(
        "================================"
      );

      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // ==================================================
    // MARK AS SENT
    // ==================================================

    if (body.markAsSent === true) {
      const contract =
        await prisma.contract.update({
          where: {
            id,
          },

          data: {
            status: "SENT",
            sentAt: new Date(),
          },

          include: contractInclude,
        });

      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // ==================================================
    // DEPOSIT
    // ==================================================

    if (
      body.depositAmount !== undefined
    ) {
      const total =
        existing.totalAmount;

      if (total === null) {
        return NextResponse.json(
          {
            error: "לחוזה אין סכום עסקה",
          },
          { status: 400 }
        );
      }

      const deposit =
        toNumberOrNull(
          body.depositAmount
        );

      if (
        deposit === null ||
        deposit < 0 ||
        deposit > total
      ) {
        return NextResponse.json(
          {
            error: "סכום המקדמה לא תקין",
          },
          { status: 400 }
        );
      }

      const remaining =
        Number(
          (
            total - deposit
          ).toFixed(2)
        );

      const percent =
        total > 0
          ? Number(
              (
                (deposit / total) *
                100
              ).toFixed(2)
            )
          : 0;

      const contract =
        await prisma.contract.update({
          where: {
            id,
          },

          data: {
            depositAmount: deposit,
            remainingAmount: remaining,
            depositPercent: percent,
          },

          include: contractInclude,
        });

      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // ==================================================
    // REMAINING
    // ==================================================

    if (
      body.remainingAmount !== undefined
    ) {
      const remaining =
        toNumberOrNull(
          body.remainingAmount
        );

      if (
        remaining === null ||
        remaining < 0
      ) {
        return NextResponse.json(
          {
            error: "יתרה לא תקינה",
          },
          { status: 400 }
        );
      }

      const contract =
        await prisma.contract.update({
          where: {
            id,
          },

          data: {
            remainingAmount:
              remaining,
          },

          include: contractInclude,
        });

      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // ==================================================
    // STATUS
    // ==================================================

    if (
      typeof body.status === "string"
    ) {
      const status =
        body.status.trim();

      if (!status) {
        return NextResponse.json(
          {
            error: "סטטוס לא תקין",
          },
          { status: 400 }
        );
      }

      const contract =
        await prisma.contract.update({
          where: {
            id,
          },

          data: {
            status,
          },

          include: contractInclude,
        });

      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // ==================================================
    // NORMAL UPDATE
    // ==================================================

    const data: {
      title?: string;
      content?: string;
      totalAmount?: number | null;
      depositAmount?: number | null;
      remainingAmount?: number | null;
      depositPercent?: number;
      templateId?: number | null;
    } = {};

    // ==================================================
    // TITLE
    // ==================================================

    if (
      typeof body.title === "string"
    ) {
      const title =
        body.title.trim();

      if (!title) {
        return NextResponse.json(
          {
            error:
              "כותרת החוזה לא יכולה להיות ריקה",
          },
          { status: 400 }
        );
      }

      data.title = title;
    }

    // ==================================================
    // CONTENT
    // ==================================================

    if (
      typeof body.content === "string"
    ) {
      const content =
        body.content.trim();

      if (!content) {
        return NextResponse.json(
          {
            error:
              "תוכן החוזה לא יכול להיות ריק",
          },
          { status: 400 }
        );
      }

      data.content = content;
    }

    // ==================================================
    // TEMPLATE
    // ==================================================

    if (
      body.templateId !== undefined
    ) {
      if (
        body.templateId === null ||
        body.templateId === ""
      ) {
        data.templateId = null;
      } else {
        const templateId =
          toPositiveId(
            body.templateId
          );

        if (!templateId) {
          return NextResponse.json(
            {
              error:
                "מזהה תבנית לא תקין",
            },
            { status: 400 }
          );
        }

        const template =
          await prisma.contractTemplate.findUnique(
            {
              where: {
                id: templateId,
              },
            }
          );

        if (!template) {
          return NextResponse.json(
            {
              error:
                "תבנית החוזה לא נמצאה",
            },
            { status: 404 }
          );
        }

        data.templateId =
          templateId;
      }
    }

    // ==================================================
    // TOTAL
    // ==================================================

    if (
      body.totalAmount !== undefined
    ) {
      const total =
        toNumberOrNull(
          body.totalAmount
        );

      if (
        total !== null &&
        total < 0
      ) {
        return NextResponse.json(
          {
            error:
              "סכום העסקה לא תקין",
          },
          { status: 400 }
        );
      }

      data.totalAmount = total;

      if (total === null) {
        data.depositAmount = null;
        data.remainingAmount = null;
        data.depositPercent = 0;
      } else {
        const deposit =
          body.depositAmount !==
          undefined
            ? toNumberOrNull(
                body.depositAmount
              )
            : existing.depositAmount ??
              0;

        if (
          deposit === null ||
          deposit < 0 ||
          deposit > total
        ) {
          return NextResponse.json(
            {
              error:
                "סכום המקדמה לא תקין",
            },
            { status: 400 }
          );
        }

        data.depositAmount =
          Number(
            deposit.toFixed(2)
          );

        data.remainingAmount =
          Number(
            (
              total - deposit
            ).toFixed(2)
          );

        data.depositPercent =
          total > 0
            ? Number(
                (
                  (deposit /
                    total) *
                  100
                ).toFixed(2)
              )
            : 0;
      }
    }

    // ==================================================
    // CHECK UPDATE
    // ==================================================

    if (
      Object.keys(data).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "לא נמצא עדכון לביצוע",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // UPDATE
    // ==================================================

    const contract =
      await prisma.contract.update({
        where: {
          id,
        },

        data,

        include: contractInclude,
      });

    return NextResponse.json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error(
      "❌ PATCH CONTRACT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "שגיאה בעדכון החוזה",
        details:
          errorMessage(error),
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE
// ======================================================

export async function DELETE(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "נתוני המחיקה אינם תקינים",
        },
        { status: 400 }
      );
    }

    const id = toPositiveId(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error: "מזהה חוזה לא תקין",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.contract.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "החוזה לא נמצא",
        },
        { status: 404 }
      );
    }

    await prisma.contract.delete({
      where: {
        id,
      },
    });

    console.log(
      "✅ CONTRACT DELETED:",
      id
    );

    return NextResponse.json({
      success: true,
      message: "החוזה נמחק בהצלחה",
    });
  } catch (error) {
    console.error(
      "❌ DELETE CONTRACT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה במחיקת החוזה",
        details: errorMessage(error),
      },
      { status: 500 }
    );
  }
}