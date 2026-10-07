import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(request: NextRequest) {
  let browser;

  try {
    // =========================================================
    // TOKEN
    // =========================================================

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "חסר token" },
        { status: 400 }
      );
    }

    // =========================================================
    // טעינת החוזה
    // =========================================================

    const contract = await prisma.contract.findUnique({
      where: {
        publicToken: token,
      },
      include: {
        client: {
          include: {
            services: true,
          },
        },
        template: true,
        service: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "החוזה לא נמצא" },
        { status: 404 }
      );
    }

    // =========================================================
    // בדיקה שהחוזה נחתם על ידי הלקוח
    // =========================================================

    if (!contract.signatureData) {
      return NextResponse.json(
        { error: "החוזה עדיין לא נחתם" },
        { status: 400 }
      );
    }

    // =========================================================
    // טעינת חתימת העסק
    // =========================================================

    const businessSettings =
      await prisma.businessSettings.findUnique({
        where: {
          id: 1,
        },
      });

    const businessSignatureData =
      businessSettings?.businessSignatureData || null;

    // =========================================================
    // נתוני לקוח
    // =========================================================

    const client = contract.client;

    const baseUrl = request.nextUrl.origin;

    // =========================================================
    // HTML של ה-PDF
    // =========================================================

    const html = `
      <!DOCTYPE html>

      <html lang="he" dir="rtl">

      <head>

        <meta charset="UTF-8" />

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 18mm 15mm 20mm 15mm;
          }

          body {
            margin: 0;
            padding: 0;
            direction: rtl;
            font-family: Arial, "Noto Sans Hebrew", sans-serif;
            color: #111;
            font-size: 14px;
            line-height: 1.7;
            background: white;
          }

          .page {
            width: 100%;
          }

          /* =====================================================
             HEADER
          ===================================================== */

          .header {
            text-align: center;
            border-bottom: 2px solid #c9a227;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .logo {
            max-width: 180px;
            max-height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
          }

          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }

          /* =====================================================
             SECTIONS
          ===================================================== */

          .section {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 17px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 25px;
          }

          .info-item {
            padding: 4px 0;
          }

          .label {
            font-weight: bold;
          }

          /* =====================================================
             CONTRACT CONTENT
          ===================================================== */

          .contract-content {
            white-space: pre-wrap;
            line-height: 1.9;
            text-align: right;
            page-break-inside: auto;
          }

          /* =====================================================
             SIGNATURE SECTION
          ===================================================== */

          .signature-section {
            margin-top: 35px;
            page-break-inside: avoid;
          }

          .signature-section-title {
            font-size: 17px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }

          .signatures-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            width: 100%;
          }

          .signature-column {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            min-height: 175px;
            text-align: center;
          }

          .signature-title {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 15px;
          }

          .signature-box {
            height: 105px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .signature {
            max-width: 280px;
            max-height: 100px;
            object-fit: contain;
          }

          .business-signature {
            max-width: 280px;
            max-height: 100px;
            object-fit: contain;
          }

          .signature-date {
            margin-top: 8px;
            font-size: 11px;
            color: #666;
          }

          .business-signature-placeholder {
            color: #999;
            font-size: 12px;
            padding-top: 35px;
          }

          /* =====================================================
             FOOTER
          ===================================================== */

          .footer {
            margin-top: 35px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #666;
          }

          /* =====================================================
             AMOUNTS
          ===================================================== */

          .amount {
            font-size: 16px;
            font-weight: bold;
          }

        </style>

      </head>

      <body>

        <div class="page">

          <!-- ===================================================
               HEADER
          =================================================== -->

          <div class="header">

            <img
              class="logo"
              src="${baseUrl}/logo.png"
            />

            <h1 class="title">
              ${escapeHtml(contract.title)}
            </h1>

          </div>


          <!-- ===================================================
               פרטי הלקוח
          =================================================== -->

          <div class="section">

            <div class="section-title">
              פרטי הלקוח
            </div>

            <div class="info-grid">

              <div class="info-item">
                <span class="label">שם:</span>
                ${escapeHtml(client?.name)}
              </div>

              <div class="info-item">
                <span class="label">טלפון:</span>
                ${escapeHtml(client?.phone)}
              </div>

              <div class="info-item">
                <span class="label">אימייל:</span>
                ${escapeHtml(client?.email)}
              </div>

              <div class="info-item">
                <span class="label">סוג אירוע:</span>
                ${escapeHtml(client?.eventType)}
              </div>

              <div class="info-item">
                <span class="label">תאריך אירוע:</span>
                ${escapeHtml(client?.eventDate)}
              </div>

              <div class="info-item">
                <span class="label">מספר מוזמנים:</span>
                ${escapeHtml(client?.guests)}
              </div>

              <div class="info-item">
                <span class="label">מיקום:</span>
                ${escapeHtml(client?.location)}
              </div>

            </div>

          </div>


          <!-- ===================================================
               פרטי תשלום
          =================================================== -->

          <div class="section">

            <div class="section-title">
              פרטי תשלום
            </div>

            <div class="info-grid">

              <div class="info-item">

                <span class="label">
                  סה"כ:
                </span>

                <span class="amount">
                  ${contract.totalAmount ?? "-"} ₪
                </span>

              </div>

              <div class="info-item">

                <span class="label">
                  מקדמה:
                </span>

                ${contract.depositAmount ?? "-"} ₪

              </div>

              <div class="info-item">

                <span class="label">
                  יתרה:
                </span>

                ${contract.remainingAmount ?? "-"} ₪

              </div>

            </div>

          </div>


          <!-- ===================================================
               תנאי החוזה
          =================================================== -->

          <div class="section">

            <div class="section-title">
              תנאי החוזה
            </div>

            <div class="contract-content">
              ${contract.content}
            </div>

          </div>


          <!-- ===================================================
               חתימות
          =================================================== -->

          <div class="signature-section">

            <div class="signature-section-title">
              חתימות
            </div>

            <div class="signatures-wrapper">


              <!-- ===============================================
                   חתימת הלקוח
              ================================================ -->

              <div class="signature-column">

                <div class="signature-title">
                  חתימת הלקוח
                </div>

                <div class="signature-box">

                  <img
                    class="signature"
                    src="${escapeHtml(
                      contract.signatureData
                    )}"
                  />

                </div>

                <div class="signature-date">

                  תאריך חתימה:

                  ${
                    contract.signedAt
                      ? new Date(
                          contract.signedAt
                        ).toLocaleDateString("he-IL")
                      : "-"
                  }

                </div>

              </div>


              <!-- ===============================================
                   חתימת העסק
              ================================================ -->

              <div class="signature-column">

                <div class="signature-title">
                  חתימת העסק
                </div>

                <div class="signature-box">

                  ${
                    businessSignatureData
                      ? `
                        <img
                          class="business-signature"
                          src="${escapeHtml(
                            businessSignatureData
                          )}"
                        />
                      `
                      : `
                        <div class="business-signature-placeholder">
                          חתימת העסק לא הוגדרה
                        </div>
                      `
                  }

                </div>

                <div class="signature-date">
                  Maestro Events
                </div>

              </div>


            </div>

          </div>


          <!-- ===================================================
               FOOTER
          =================================================== -->

          <div class="footer">
            Maestro Events
          </div>


        </div>

      </body>

      </html>
    `;

    // =========================================================
    // הפעלת Puppeteer
    // =========================================================

    browser = await puppeteer.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "load",
    });

    // =========================================================
    // יצירת PDF
    // =========================================================

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    browser = null;

    // =========================================================
    // החזרת PDF
    // =========================================================

    return new NextResponse(
      new Uint8Array(pdf),
      {
        status: 200,

        headers: {
          "Content-Type": "application/pdf",

          "Content-Disposition":
            `inline; filename="signed-contract-${contract.id}.pdf"`,
        },
      }
    );

  } catch (error) {

    console.error(
      "PDF generation error:",
      error
    );

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      {
        error: "שגיאה ביצירת PDF",
      },
      {
        status: 500,
      }
    );
  }
}