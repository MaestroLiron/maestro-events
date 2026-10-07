import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ======================================================
// GET - קבלת כל תבניות החוזים
// ======================================================

export async function GET() {
  try {
    const templates = await prisma.contractTemplate.findMany({
      include: {
        service: true,
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET CONTRACT TEMPLATES ERROR:", error);

    return NextResponse.json(
      {
        error: "שגיאה בטעינת תבניות החוזים",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST - יצירת תבנית חוזה
// ======================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ==================================================
    // שם התבנית
    // ==================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error: "חובה להזין שם לתבנית",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // תוכן החוזה
    // ==================================================

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!content) {
      return NextResponse.json(
        {
          error: "חובה להזין תוכן לחוזה",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // תיאור
    // ==================================================

    const description =
      typeof body.description === "string" &&
      body.description.trim()
        ? body.description.trim()
        : null;

    // ==================================================
    // שירות
    // ==================================================

    let serviceId: number | null = null;

    if (
      body.serviceId !== undefined &&
      body.serviceId !== null &&
      body.serviceId !== ""
    ) {
      const parsedServiceId = Number(body.serviceId);

      if (
        !Number.isInteger(parsedServiceId) ||
        parsedServiceId <= 0
      ) {
        return NextResponse.json(
          {
            error: "מזהה שירות לא תקין",
          },
          { status: 400 }
        );
      }

      const service = await prisma.service.findUnique({
        where: {
          id: parsedServiceId,
        },
      });

      if (!service) {
        return NextResponse.json(
          {
            error: "השירות לא נמצא",
          },
          { status: 404 }
        );
      }

      serviceId = parsedServiceId;
    }

    // ==================================================
    // סטטוס
    // ==================================================

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    // ==================================================
    // יצירת התבנית
    // ==================================================

    const template =
      await prisma.contractTemplate.create({
        data: {
          name,
          description,
          content,
          serviceId,
          isActive,
        },

        include: {
          service: true,
          _count: {
            select: {
              contracts: true,
            },
          },
        },
      });

    console.log(
      "CONTRACT TEMPLATE CREATED:",
      template.id
    );

    return NextResponse.json(
      template,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE CONTRACT TEMPLATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה ביצירת תבנית החוזה",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH - עריכת תבנית / הפעלה / כיבוי
// ======================================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // ==================================================
    // מזהה התבנית
    // ==================================================

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "מזהה תבנית לא תקין",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // בדיקה שהתבנית קיימת
    // ==================================================

    const existingTemplate =
      await prisma.contractTemplate.findUnique({
        where: {
          id,
        },
      });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          error: "התבנית לא נמצאה",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // בניית נתוני העדכון
    // ==================================================

    const updateData: {
      name?: string;
      description?: string | null;
      content?: string;
      serviceId?: number | null;
      isActive?: boolean;
    } = {};

    // ==================================================
    // שם
    // ==================================================

    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        return NextResponse.json(
          {
            error: "שם התבנית לא תקין",
          },
          { status: 400 }
        );
      }

      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            error: "חובה להזין שם לתבנית",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    // ==================================================
    // תוכן
    // ==================================================

    if (body.content !== undefined) {
      if (typeof body.content !== "string") {
        return NextResponse.json(
          {
            error: "תוכן התבנית לא תקין",
          },
          { status: 400 }
        );
      }

      const content = body.content.trim();

      if (!content) {
        return NextResponse.json(
          {
            error: "חובה להזין תוכן לחוזה",
          },
          { status: 400 }
        );
      }

      updateData.content = content;
    }

    // ==================================================
    // תיאור
    // ==================================================

    if (body.description !== undefined) {
      updateData.description =
        typeof body.description === "string" &&
        body.description.trim()
          ? body.description.trim()
          : null;
    }

    // ==================================================
    // שירות
    // ==================================================

    if (body.serviceId !== undefined) {
      if (
        body.serviceId === null ||
        body.serviceId === ""
      ) {
        updateData.serviceId = null;
      } else {
        const parsedServiceId = Number(body.serviceId);

        if (
          !Number.isInteger(parsedServiceId) ||
          parsedServiceId <= 0
        ) {
          return NextResponse.json(
            {
              error: "מזהה שירות לא תקין",
            },
            { status: 400 }
          );
        }

        const service = await prisma.service.findUnique({
          where: {
            id: parsedServiceId,
          },
        });

        if (!service) {
          return NextResponse.json(
            {
              error: "השירות לא נמצא",
            },
            { status: 404 }
          );
        }

        updateData.serviceId = parsedServiceId;
      }
    }

    // ==================================================
    // הפעלה / כיבוי
    // ==================================================

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          {
            error: "סטטוס התבנית לא תקין",
          },
          { status: 400 }
        );
      }

      updateData.isActive = body.isActive;
    }

    // ==================================================
    // עדכון
    // ==================================================

    const updatedTemplate =
      await prisma.contractTemplate.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          service: true,
          _count: {
            select: {
              contracts: true,
            },
          },
        },
      });

    console.log(
      "CONTRACT TEMPLATE UPDATED:",
      updatedTemplate.id
    );

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error(
      "UPDATE CONTRACT TEMPLATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בעדכון תבנית החוזה",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE - מחיקת תבנית
// ======================================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    // ==================================================
    // מזהה התבנית
    // ==================================================

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "מזהה תבנית לא תקין",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // בדיקה שהתבנית קיימת
    // ==================================================

    const template =
      await prisma.contractTemplate.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              contracts: true,
            },
          },
        },
      });

    if (!template) {
      return NextResponse.json(
        {
          error: "התבנית לא נמצאה",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // לא מוחקים תבנית שכבר משויכת לחוזים
    // ==================================================

    if (template._count.contracts > 0) {
      return NextResponse.json(
        {
          error:
            `לא ניתן למחוק את התבנית משום שהיא משויכת ל-${template._count.contracts} חוזים קיימים. ניתן לכבות אותה במקום למחוק.`,
        },
        { status: 409 }
      );
    }

    // ==================================================
    // מחיקה
    // ==================================================

    await prisma.contractTemplate.delete({
      where: {
        id,
      },
    });

    console.log(
      "CONTRACT TEMPLATE DELETED:",
      id
    );

    return NextResponse.json({
      success: true,
      message: "התבנית נמחקה בהצלחה",
    });
  } catch (error) {
    console.error(
      "DELETE CONTRACT TEMPLATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה במחיקת תבנית החוזה",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}