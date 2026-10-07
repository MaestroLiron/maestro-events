import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ======================================================
// GET
// קבלת כל תיק העבודות
// ======================================================

export async function GET() {
  try {
    const categories =
      await prisma.portfolioCategory.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],

        include: {
          images: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "desc",
              },
            ],
          },

          videos: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "desc",
              },
            ],
          },
        },
      });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(
      "שגיאה בטעינת תיק העבודות:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בטעינת תיק העבודות",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST
// יצירת קטגוריה / תמונה / סרטון
// ======================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = body?.action;

    // ==================================================
    // יצירת קטגוריה
    // ==================================================

    if (action === "createCategory") {
      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : "";

      if (!name) {
        return NextResponse.json(
          {
            error: "חובה להזין שם קטגוריה",
          },
          {
            status: 400,
          }
        );
      }

      // מציאת הקטגוריה האחרונה
      const lastCategory =
        await prisma.portfolioCategory.findFirst({
          orderBy: {
            sortOrder: "desc",
          },
        });

      const nextSortOrder =
        (lastCategory?.sortOrder ?? -1) + 1;

      // יצירת קטגוריה
      // שים לב:
      // אין כאן slug!
      const category =
        await prisma.portfolioCategory.create({
          data: {
            name,

            description:
              description || null,

            sortOrder:
              nextSortOrder,

            isActive: true,
          },
        });

      return NextResponse.json(
        category,
        {
          status: 201,
        }
      );
    }

    // ==================================================
    // יצירת תמונה
    // ==================================================

    if (action === "createImage") {
      const categoryId =
        Number(body.categoryId);

      const url =
        typeof body.url === "string"
          ? body.url.trim()
          : "";

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const alt =
        typeof body.alt === "string"
          ? body.alt.trim()
          : "";

      // בדיקת קטגוריה
      if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
      ) {
        return NextResponse.json(
          {
            error: "חובה לבחור קטגוריה",
          },
          {
            status: 400,
          }
        );
      }

      // בדיקת URL
      if (!url) {
        return NextResponse.json(
          {
            error: "חובה להזין כתובת תמונה",
          },
          {
            status: 400,
          }
        );
      }

      // בדיקה שהקטגוריה קיימת
      const category =
        await prisma.portfolioCategory.findUnique({
          where: {
            id: categoryId,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            error: "הקטגוריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      // מציאת התמונה האחרונה בקטגוריה
      const lastImage =
        await prisma.portfolioImage.findFirst({
          where: {
            categoryId,
          },
          orderBy: {
            sortOrder: "desc",
          },
        });

      const nextSortOrder =
        (lastImage?.sortOrder ?? -1) + 1;

      // יצירת תמונה
      const image =
        await prisma.portfolioImage.create({
          data: {
            categoryId,

            url,

            title:
              title || null,

            alt:
              alt || null,

            sortOrder:
              nextSortOrder,

            isActive: true,
          },
        });

      return NextResponse.json(
        image,
        {
          status: 201,
        }
      );
    }

    // ==================================================
    // יצירת סרטון
    // ==================================================

    if (action === "createVideo") {
      const categoryId =
        Number(body.categoryId);

      const url =
        typeof body.url === "string"
          ? body.url.trim()
          : "";

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : "";

      const thumbnailUrl =
        typeof body.thumbnailUrl === "string"
          ? body.thumbnailUrl.trim()
          : "";

      // בדיקת קטגוריה
      if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
      ) {
        return NextResponse.json(
          {
            error: "חובה לבחור קטגוריה",
          },
          {
            status: 400,
          }
        );
      }

      // בדיקת URL
      if (!url) {
        return NextResponse.json(
          {
            error: "חובה להזין כתובת סרטון",
          },
          {
            status: 400,
          }
        );
      }

      // בדיקה שהקטגוריה קיימת
      const category =
        await prisma.portfolioCategory.findUnique({
          where: {
            id: categoryId,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            error: "הקטגוריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      // מציאת הסרטון האחרון
      const lastVideo =
        await prisma.portfolioVideo.findFirst({
          where: {
            categoryId,
          },
          orderBy: {
            sortOrder: "desc",
          },
        });

      const nextSortOrder =
        (lastVideo?.sortOrder ?? -1) + 1;

      // יצירת סרטון
      const video =
        await prisma.portfolioVideo.create({
          data: {
            categoryId,

            url,

            title:
              title || null,

            description:
              description || null,

            thumbnailUrl:
              thumbnailUrl || null,

            sortOrder:
              nextSortOrder,

            isActive: true,
          },
        });

      return NextResponse.json(
        video,
        {
          status: 201,
        }
      );
    }

    // ==================================================
    // פעולה לא מוכרת
    // ==================================================

    return NextResponse.json(
      {
        error: "פעולה לא מוכרת",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "שגיאה ביצירת נתון בתיק העבודות:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בביצוע הפעולה",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PATCH
// עריכת קטגוריה / תמונה / סרטון
// ======================================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const action = body?.action;

    // ==================================================
    // עריכת קטגוריה
    // ==================================================

    if (action === "updateCategory") {
      const id =
        Number(body.id);

      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : "";

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "קטגוריה לא תקינה",
          },
          {
            status: 400,
          }
        );
      }

      if (!name) {
        return NextResponse.json(
          {
            error:
              "שם הקטגוריה לא יכול להיות ריק",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioCategory.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הקטגוריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      const category =
        await prisma.portfolioCategory.update({
          where: {
            id,
          },

          data: {
            name,

            description:
              description || null,
          },
        });

      return NextResponse.json(category);
    }

    // ==================================================
    // הפעלה / השבתה קטגוריה
    // ==================================================

    if (action === "toggleCategory") {
      const id =
        Number(body.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "קטגוריה לא תקינה",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioCategory.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הקטגוריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      const category =
        await prisma.portfolioCategory.update({
          where: {
            id,
          },

          data: {
            isActive:
              !existing.isActive,
          },
        });

      return NextResponse.json(category);
    }

    // ==================================================
    // עריכת תמונה
    // ==================================================

    if (action === "updateImage") {
      const id =
        Number(body.id);

      const url =
        typeof body.url === "string"
          ? body.url.trim()
          : "";

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const alt =
        typeof body.alt === "string"
          ? body.alt.trim()
          : "";

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "תמונה לא תקינה",
          },
          {
            status: 400,
          }
        );
      }

      if (!url) {
        return NextResponse.json(
          {
            error:
              "חובה להזין כתובת תמונה",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioImage.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "התמונה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      const image =
        await prisma.portfolioImage.update({
          where: {
            id,
          },

          data: {
            url,

            title:
              title || null,

            alt:
              alt || null,
          },
        });

      return NextResponse.json(image);
    }

    // ==================================================
    // הפעלה / השבתה תמונה
    // ==================================================

    if (action === "toggleImage") {
      const id =
        Number(body.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "תמונה לא תקינה",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioImage.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "התמונה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      const image =
        await prisma.portfolioImage.update({
          where: {
            id,
          },

          data: {
            isActive:
              !existing.isActive,
          },
        });

      return NextResponse.json(image);
    }

    // ==================================================
    // עריכת סרטון
    // ==================================================

    if (action === "updateVideo") {
      const id =
        Number(body.id);

      const url =
        typeof body.url === "string"
          ? body.url.trim()
          : "";

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : "";

      const thumbnailUrl =
        typeof body.thumbnailUrl === "string"
          ? body.thumbnailUrl.trim()
          : "";

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "סרטון לא תקין",
          },
          {
            status: 400,
          }
        );
      }

      if (!url) {
        return NextResponse.json(
          {
            error:
              "חובה להזין כתובת סרטון",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioVideo.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הסרטון לא נמצא",
          },
          {
            status: 404,
          }
        );
      }

      const video =
        await prisma.portfolioVideo.update({
          where: {
            id,
          },

          data: {
            url,

            title:
              title || null,

            description:
              description || null,

            thumbnailUrl:
              thumbnailUrl || null,
          },
        });

      return NextResponse.json(video);
    }

    // ==================================================
    // הפעלה / השבתה סרטון
    // ==================================================

    if (action === "toggleVideo") {
      const id =
        Number(body.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return NextResponse.json(
          {
            error: "סרטון לא תקין",
          },
          {
            status: 400,
          }
        );
      }

      const existing =
        await prisma.portfolioVideo.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הסרטון לא נמצא",
          },
          {
            status: 404,
          }
        );
      }

      const video =
        await prisma.portfolioVideo.update({
          where: {
            id,
          },

          data: {
            isActive:
              !existing.isActive,
          },
        });

      return NextResponse.json(video);
    }

    // ==================================================
    // שינוי סדר
    // ==================================================

    if (action === "updateOrder") {
      const type =
        body.type;

      const id =
        Number(body.id);

      const sortOrder =
        Number(body.sortOrder);

      if (
        !Number.isInteger(id) ||
        !Number.isFinite(sortOrder)
      ) {
        return NextResponse.json(
          {
            error:
              "נתוני סדר לא תקינים",
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // סדר קטגוריה
      // ----------------------------------------------

      if (type === "category") {
        const category =
          await prisma.portfolioCategory.update({
            where: {
              id,
            },

            data: {
              sortOrder,
            },
          });

        return NextResponse.json(category);
      }

      // ----------------------------------------------
      // סדר תמונה
      // ----------------------------------------------

      if (type === "image") {
        const image =
          await prisma.portfolioImage.update({
            where: {
              id,
            },

            data: {
              sortOrder,
            },
          });

        return NextResponse.json(image);
      }

      // ----------------------------------------------
      // סדר סרטון
      // ----------------------------------------------

      if (type === "video") {
        const video =
          await prisma.portfolioVideo.update({
            where: {
              id,
            },

            data: {
              sortOrder,
            },
          });

        return NextResponse.json(video);
      }

      return NextResponse.json(
        {
          error:
            "סוג פריט לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // פעולה לא מוכרת
    // ==================================================

    return NextResponse.json(
      {
        error: "פעולה לא מוכרת",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "שגיאה בעדכון תיק העבודות:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה בעדכון",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE
// מחיקת קטגוריה / תמונה / סרטון
// ======================================================

export async function DELETE(
  request: Request
) {
  try {
    const body =
      await request.json();

    const type =
      body?.type;

    const id =
      Number(body?.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error: "מזהה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // מחיקת תמונה
    // ==================================================

    if (type === "image") {
      const existing =
        await prisma.portfolioImage.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "התמונה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      await prisma.portfolioImage.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    // ==================================================
    // מחיקת סרטון
    // ==================================================

    if (type === "video") {
      const existing =
        await prisma.portfolioVideo.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הסרטון לא נמצא",
          },
          {
            status: 404,
          }
        );
      }

      await prisma.portfolioVideo.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    // ==================================================
    // מחיקת קטגוריה
    // ==================================================

    if (type === "category") {
      const existing =
        await prisma.portfolioCategory.findUnique({
          where: {
            id,
          },
        });

      if (!existing) {
        return NextResponse.json(
          {
            error: "הקטגוריה לא נמצאה",
          },
          {
            status: 404,
          }
        );
      }

      // מחיקת התמונות של הקטגוריה
      await prisma.portfolioImage.deleteMany({
        where: {
          categoryId: id,
        },
      });

      // מחיקת הסרטונים של הקטגוריה
      await prisma.portfolioVideo.deleteMany({
        where: {
          categoryId: id,
        },
      });

      // מחיקת הקטגוריה
      await prisma.portfolioCategory.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    // ==================================================
    // סוג מחיקה לא מוכר
    // ==================================================

    return NextResponse.json(
      {
        error:
          "סוג מחיקה לא מוכר",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "שגיאה במחיקה:",
      error
    );

    return NextResponse.json(
      {
        error: "שגיאה במחיקה",
      },
      {
        status: 500,
      }
    );
  }
}