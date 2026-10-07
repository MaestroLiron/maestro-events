import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = Number(id);

    if (!Number.isInteger(leadId)) {
      return NextResponse.json(
        { error: "מזהה ליד לא תקין" },
        { status: 400 }
      );
    }

    const body = await request.json();

    console.log("================================");
    console.log("📝 PATCH LEAD");
    console.log("LEAD ID:", leadId);
    console.log("BODY:", body);
    console.log("================================");

    if (!body.status) {
      return NextResponse.json(
        { error: "חסר סטטוס" },
        { status: 400 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        status: String(body.status),
      },
    });

    console.log("================================");
    console.log("✅ LEAD STATUS UPDATED");
    console.log(updatedLead);
    console.log("================================");

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("================================");
    console.error("❌ PATCH LEAD ERROR");
    console.error(error);
    console.error("================================");

    return NextResponse.json(
      {
        error: "שגיאה בעדכון הליד",
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