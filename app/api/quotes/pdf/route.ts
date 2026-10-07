import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(
  value: unknown
) {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "he-IL",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}

export async function GET(
  request: NextRequest
) {
  let browser;

  try {
    const token =
      request.nextUrl.searchParams.get(
        "token"
      );

    if (!token) {
      return NextResponse.json(
        {
          error:
            "חסר token",
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
            "הצעת המחיר לא נמצאה",
        },
        {
          status: 404,
        }
      );
    }

    const settings =
      await prisma.businessSettings.findUnique(
        {
          where: {
            id: 1,
          },
        }
      );

    const businessSignature =
      settings?.businessSignatureData ||
      null;

    const baseUrl =
      request.nextUrl.origin;

    const itemsHtml =
      quote.items
        .map(
          (item) => `
            <tr>
              <td>
                ${escapeHtml(
                  item.serviceName
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.description ||
                    ""
                )}
              </td>

              <td class="center">
                ${item.quantity}
              </td>

              <td class="money">
                ${formatMoney(
                  Number(
                    item.unitPrice
                  )
                )} ₪
              </td>

              <td class="money bold">
                ${formatMoney(
                  Number(
                    item.totalPrice
                  )
                )} ₪
              </td>
            </tr>
          `
        )
        .join("");

    const html = `
      <!DOCTYPE html>

      <html
        lang="he"
        dir="rtl"
      >

      <head>

        <meta charset="UTF-8" />

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin:
              16mm
              14mm
              20mm
              14mm;
          }

          body {
            margin: 0;
            padding: 0;
            direction: rtl;
            font-family:
              Arial,
              "Noto Sans Hebrew",
              sans-serif;
            color: #111;
            font-size: 13px;
            line-height: 1.7;
            background: white;
          }

          .header {
            text-align: center;
            border-bottom:
              2px solid #c9a227;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .logo {
            max-width: 180px;
            max-height: 75px;
            width: auto;
            height: auto;
            object-fit: contain;
            margin-bottom: 8px;
          }

          .brand {
            color: #c9a227;
            font-size: 12px;
            letter-spacing: 4px;
            font-weight: bold;
          }

          .title {
            font-size: 25px;
            font-weight: bold;
            margin:
              8px
              0
              3px;
          }

          .quote-number {
            color: #666;
            font-size: 12px;
          }

          .section {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 17px;
            font-weight: bold;
            border-bottom:
              1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }

          .info-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap:
              6px
              20px;
          }

          .info-item {
            padding: 4px 0;
          }

          .label {
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse:
              collapse;
            margin-top: 10px;
          }

          th {
            background:
              #f5f1e4;
            border-bottom:
              2px solid #c9a227;
            padding: 9px;
            text-align: right;
            font-size: 12px;
          }

          td {
            border-bottom:
              1px solid #ddd;
            padding: 9px;
            vertical-align:
              top;
          }

          .center {
            text-align: center;
          }

          .money {
            white-space: nowrap;
          }

          .bold {
            font-weight: bold;
          }

          .total-box {
            margin-top: 20px;
            border:
              2px solid #c9a227;
            background:
              #fbf8ed;
            padding: 16px;
            text-align: center;
            page-break-inside:
              avoid;
          }

          .total-label {
            font-size: 13px;
            color: #666;
          }

          .total {
            font-size: 26px;
            font-weight: bold;
            color: #9a7715;
            margin-top: 3px;
          }

          .notes {
            white-space: pre-wrap;
            line-height: 1.9;
          }

          .signature-section {
            margin-top: 35px;
            page-break-inside:
              avoid;
          }

          .signatures {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 20px;
          }

          .signature-box {
            border:
              1px solid #ddd;
            min-height: 145px;
            padding: 15px;
            text-align: center;
          }

          .signature-title {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 10px;
          }

          .signature {
            max-width: 260px;
            max-height: 85px;
            width: auto;
            height: auto;
            object-fit: contain;
          }

          .empty-signature {
            height: 85px;
          }

          .signature-line {
            border-top:
              1px solid #888;
            margin-top: 5px;
            padding-top: 6px;
            color: #666;
            font-size: 11px;
          }

          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top:
              1px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 10px;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <img
            class="logo"
            src="${baseUrl}/logo.png"
          />

          <div class="brand">
            MAESTRO EVENTS
          </div>

          <h1 class="title">
            ${escapeHtml(
              quote.title
            )}
          </h1>

          <div class="quote-number">
            מספר הצעה:
            ${escapeHtml(
              quote.quoteNumber
            )}
          </div>

        </div>

        <div class="section">

          <div class="section-title">
            פרטי הלקוח והאירוע
          </div>

          <div class="info-grid">

            <div class="info-item">
              <span class="label">
                שם:
              </span>
              ${escapeHtml(
                quote.client?.name
              )}
            </div>

            <div class="info-item">
              <span class="label">
                טלפון:
              </span>
              ${escapeHtml(
                quote.client?.phone
              )}
            </div>

            ${
              quote.client
                ?.email
                ? `
                  <div class="info-item">
                    <span class="label">
                      אימייל:
                    </span>
                    ${escapeHtml(
                      quote.client.email
                    )}
                  </div>
                `
                : ""
            }

            ${
              quote.eventType
                ? `
                  <div class="info-item">
                    <span class="label">
                      סוג אירוע:
                    </span>
                    ${escapeHtml(
                      quote.eventType
                    )}
                  </div>
                `
                : ""
            }

            ${
              quote.eventDate
                ? `
                  <div class="info-item">
                    <span class="label">
                      תאריך אירוע:
                    </span>
                    ${escapeHtml(
                      quote.eventDate
                    )}
                  </div>
                `
                : ""
            }

            ${
              quote.guests
                ? `
                  <div class="info-item">
                    <span class="label">
                      מוזמנים:
                    </span>
                    ${escapeHtml(
                      quote.guests
                    )}
                  </div>
                `
                : ""
            }

            ${
              quote.location
                ? `
                  <div class="info-item">
                    <span class="label">
                      מיקום:
                    </span>
                    ${escapeHtml(
                      quote.location
                    )}
                  </div>
                `
                : ""
            }

          </div>

        </div>

        <div class="section">

          <div class="section-title">
            פירוט השירותים
          </div>

          <table>

            <thead>

              <tr>

                <th>
                  שירות
                </th>

                <th>
                  תיאור
                </th>

                <th>
                  כמות
                </th>

                <th>
                  מחיר יחידה
                </th>

                <th>
                  סה"כ
                </th>

              </tr>

            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>

          </table>

          <div class="total-box">

            <div class="total-label">
              סה"כ הצעת המחיר
            </div>

            <div class="total">
              ${formatMoney(
                Number(
                  quote.totalAmount
                )
              )} ₪
            </div>

          </div>

        </div>

        ${
          quote.notes
            ? `
              <div class="section">

                <div class="section-title">
                  הערות ותנאים
                </div>

                <div class="notes">
                  ${escapeHtml(
                    quote.notes
                  )}
                </div>

              </div>
            `
            : ""
        }

        <div class="signature-section">

          <div class="section-title">
            חתימות
          </div>

          <div class="signatures">

            <div class="signature-box">

              <div class="signature-title">
                חתימת הלקוח
              </div>

              ${
                quote.status ===
                  "APPROVED"
                  ? `
                    <div
                      class="empty-signature"
                    ></div>
                  `
                  : `
                    <div
                      class="empty-signature"
                    ></div>
                  `
              }

              <div class="signature-line">
                חתימת הלקוח
              </div>

            </div>

            <div class="signature-box">

              <div class="signature-title">
                Maestro Events
              </div>

              ${
                businessSignature
                  ? `
                    <img
                      class="signature"
                      src="${businessSignature}"
                    />
                  `
                  : `
                    <div
                      class="empty-signature"
                    ></div>
                  `
              }

              <div class="signature-line">
                חתימת העסק
              </div>

            </div>

          </div>

        </div>

        <div class="footer">
          Maestro Events
        </div>

      </body>

      </html>
    `;

    browser =
      await puppeteer.launch({
        headless: true,

        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
      });

    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    await page.setContent(
      html,
      {
        waitUntil: "load",
      }
    );

    const pdf =
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });

    await browser.close();

    browser = null;

    return new NextResponse(
      new Uint8Array(pdf),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="quote-${quote.quoteNumber}.pdf"`,
        },
      }
    );
  } catch (error) {
    console.error(
      "QUOTE PDF ERROR:",
      error
    );

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      {
        error:
          "שגיאה ביצירת PDF להצעה",
      },
      {
        status: 500,
      }
    );
  }
}