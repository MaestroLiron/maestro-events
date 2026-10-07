"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Contract = {
  id: number;
  title: string;
  content: string;
  status: string;
  createdAt?: string;
  signedAt?: string | null;
  signatureData?: string | null;
  marketingConsent?: boolean;

  totalAmount?: number | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;

  publicToken?: string | null;

  client?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    eventType?: string | null;
    eventDate?: string | null;
    guests?: number | string | null;
    location?: string | null;
    alcoholList?: string | null;

    services?: {
      id?: number;
      serviceName?: string | null;
      price?: number | null;
      quantity?: number | null;
    }[];
  } | null;

  service?: {
    title?: string | null;
  } | null;
};

export default function ContractPage() {
  const params = useParams();
  const token = String(params?.token || "");

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [signature, setSignature] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  // =====================================================
  // LOAD CONTRACT
  // =====================================================

  useEffect(() => {
    if (!token) return;

    async function loadContract() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/contracts?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "לא ניתן לטעון את החוזה"
          );
        }

        const loadedContract =
          data?.contract || data;

        setContract(loadedContract);

        if (loadedContract.signatureData) {
          setSignature(loadedContract.signatureData);
          setHasSigned(true);
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "שגיאה בטעינת החוזה"
        );
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [token]);

  // =====================================================
  // CANVAS
  // =====================================================

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ratio = Math.max(
      window.devicePixelRatio || 1,
      1
    );

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
  }, [loading]);

  // =====================================================
  // SIGNATURE DRAWING
  // =====================================================

  function getPosition(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (hasSigned) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    drawingRef.current = true;

    const { x, y } = getPosition(event);

    ctx.beginPath();
    ctx.moveTo(x, y);

    canvas.setPointerCapture(event.pointerId);
  }

  function draw(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current || hasSigned) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const { x, y } = getPosition(event);

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    drawingRef.current = false;

    updateSignatureImage();
  }

  function updateSignatureImage() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const data = canvas.toDataURL("image/png");

    setSignature(data);
  }

  function clearSignature() {
    if (hasSigned) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setSignature("");
  }

  // =====================================================
  // SAVE SIGNATURE
  // =====================================================

  async function signContract() {
    if (!contract) return;

    if (!signature) {
      alert("יש לחתום בתוך אזור החתימה.");
      return;
    }

    if (!termsAccepted) {
      alert(
        "יש לאשר שקראת את ההסכם ואת תנאיו."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/contracts",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: contract.id,
            token,
            signatureData: signature,
            marketingConsent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "לא ניתן לשמור את החתימה"
        );
      }

      const updatedContract =
        data?.contract || contract;

      setContract(updatedContract);
      setHasSigned(true);

      alert("החוזה נחתם בהצלחה.");
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "שגיאה בשמירת החתימה"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // PRINT FULL CONTRACT
  // =====================================================

  function printContract() {
    if (!contract) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=1200"
    );

    if (!printWindow) {
      alert("יש לאפשר חלונות קופצים בדפדפן.");
      return;
    }

    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeContractContent =
      escapeHtml(contract.content);

    const safeAlcoholList =
      escapeHtml(client?.alcoholList || "");

    // ===================================================
    // SERVICES
    // ===================================================

    const servicesHtml =
      client?.services &&
      client.services.length > 0
        ? `
          <section class="section avoid-break">

            <h2>
              השירותים שנבחרו
            </h2>

            <div class="service-list">

              ${client.services
                .map(
                  (service) => `
                    <div class="service">

                      <div class="service-name">
                        ${escapeHtml(
                          service.serviceName || "-"
                        )}
                      </div>

                      ${
                        service.price !==
                          undefined &&
                        service.price !== null
                          ? `
                            <div class="service-price">
                              ${escapeHtml(
                                money(
                                  service.price
                                )
                              )}
                            </div>
                          `
                          : ""
                      }

                    </div>
                  `
                )
                .join("")}

            </div>

          </section>
        `
        : "";

    // ===================================================
    // ALCOHOL
    // ===================================================

    const alcoholHtml =
      client?.alcoholList?.trim()
        ? `
          <section class="section">

            <h2>
              רשימת אלכוהול ומשקאות
            </h2>

            <div class="text-content">
              ${safeAlcoholList}
            </div>

          </section>
        `
        : "";

    // ===================================================
    // SIGNATURE
    // ===================================================

    const signatureHtml =
      hasSigned && signature
        ? `
          <section class="section signature-section">

            <h2>
              אישור וחתימה
            </h2>

            <div class="signed-box">

              <div class="signed-title">
                ✓ ההסכם נחתם דיגיטלית
              </div>

              ${
                signedDate
                  ? `
                    <div class="signed-date">
                      תאריך ושעת חתימה:
                      <strong>
                        ${escapeHtml(
                          signedDate
                        )}
                      </strong>
                    </div>
                  `
                  : ""
              }

              <div class="signature-label">
                חתימת הלקוח
              </div>

              <div class="signature-image-box">

                <img
                  src="${escapeHtml(
                    signature
                  )}"
                  class="signature-image"
                  alt="חתימת הלקוח"
                />

              </div>

            </div>

          </section>
        `
        : `
          <section class="section signature-section">

            <h2>
              חתימה
            </h2>

            <div class="unsigned-box">
              החוזה טרם נחתם.
            </div>

          </section>
        `;

    // ===================================================
    // PRINT DOCUMENT
    // ===================================================

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>

      <html
        lang="he"
        dir="rtl"
      >

      <head>

        <meta charset="UTF-8" />

        <title>
          ${escapeHtml(
            contract.title ||
              "הסכם שירות"
          )}
        </title>

        <style>

          @page {
            size: A4;
            margin: 15mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;

            width: 100%;
            height: auto;

            background: #ffffff;
            color: #111111;

            font-family:
              Arial,
              "Segoe UI",
              sans-serif;

            direction: rtl;
            text-align: right;
          }

          body {
            overflow: visible;
          }

          .document {
            width: 100%;
            height: auto;

            margin: 0;
            padding: 0;

            overflow: visible;
          }

          /* =========================================
             HEADER
          ========================================= */

          .header {
            display: flex;

            align-items: center;

            justify-content: space-between;

            padding-bottom: 15px;

            margin-bottom: 25px;

            border-bottom: 2px solid #d4af37;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .logo {
            width: 145px;
            height: auto;
          }

          .brand-subtitle {
            margin-top: 6px;

            font-size: 11px;

            color: #777;
          }

          .header-star {
            font-size: 30px;

            color: #806400;
          }

          /* =========================================
             TITLE
          ========================================= */

          .title {
            text-align: center;

            margin-bottom: 30px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .title-small {
            font-size: 13px;

            color: #777;

            margin-bottom: 8px;
          }

          h1 {
            margin: 0;

            font-size: 27px;

            line-height: 1.4;

            color: #222;
          }

          .gold-line {
            width: 70px;

            height: 3px;

            background: #d4af37;

            margin: 12px auto 0;
          }

          /* =========================================
             SECTIONS
          ========================================= */

          .section {
            width: 100%;

            margin-bottom: 25px;

            break-inside: auto;

            page-break-inside: auto;
          }

          .avoid-break {
            break-inside: avoid;

            page-break-inside: avoid;
          }

          h2 {
            margin: 0 0 15px 0;

            font-size: 18px;

            color: #806400;

            font-weight: 800;

            break-after: avoid;

            page-break-after: avoid;
          }

          /* =========================================
             DETAILS
          ========================================= */

          .details-box {
            border: 1px solid #ddd;

            border-radius: 10px;

            padding: 18px;

            margin-bottom: 25px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .details {
            display: grid;

            grid-template-columns:
              1fr
              1fr;

            gap: 14px 25px;
          }

          .detail-label {
            font-size: 10px;

            color: #777;

            margin-bottom: 4px;
          }

          .detail-value {
            font-size: 13px;

            font-weight: 700;

            color: #222;

            overflow-wrap: anywhere;
          }

          /* =========================================
             SERVICES
          ========================================= */

          .service-list {
            display: flex;

            flex-direction: column;

            gap: 8px;
          }

          .service {
            border: 1px solid #ddd;

            border-radius: 8px;

            padding: 11px 14px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .service-name {
            font-size: 13px;

            font-weight: 700;
          }

          .service-price {
            margin-top: 4px;

            font-size: 12px;

            color: #777;
          }

          /* =========================================
             PAYMENT
          ========================================= */

          .amounts {
            display: grid;

            grid-template-columns:
              1fr
              1fr
              1fr;

            gap: 10px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .amount {
            border: 1px solid #ddd;

            border-radius: 9px;

            padding: 14px;

            text-align: center;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .amount-label {
            font-size: 10px;

            color: #777;
          }

          .amount-value {
            margin-top: 5px;

            font-size: 17px;

            font-weight: 800;

            color: #806400;
          }

          /* =========================================
             ALCOHOL / TEXT
          ========================================= */

          .text-content {
            white-space: pre-wrap;

            font-size: 13px;

            line-height: 1.9;

            color: #222;

            overflow-wrap: break-word;
          }

          /* =========================================
             FULL CONTRACT
          ========================================= */

          .contract-section {
            width: 100%;

            margin-top: 10px;

            break-inside: auto !important;

            page-break-inside: auto !important;
          }

          .contract-text {
            width: 100%;

            height: auto !important;

            min-height: 0 !important;

            max-height: none !important;

            overflow: visible !important;

            white-space: pre-wrap !important;

            font-size: 13px;

            line-height: 2;

            color: #222;

            overflow-wrap: break-word;

            word-break: normal;

            break-inside: auto !important;

            page-break-inside: auto !important;

            orphans: 3;

            widows: 3;
          }

          /* =========================================
             SIGNATURE
          ========================================= */

          .signature-section {
            margin-top: 35px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .signed-box {
            border: 1px solid #b7dfc0;

            background: #f1fbf3;

            border-radius: 12px;

            padding: 18px;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          .signed-title {
            color: #166534;

            font-size: 18px;

            font-weight: 800;

            margin-bottom: 10px;
          }

          .signed-date {
            color: #166534;

            font-size: 12px;

            margin-bottom: 18px;
          }

          .signature-label {
            font-size: 11px;

            color: #777;

            margin-bottom: 7px;
          }

          .signature-image-box {
            border: 1px solid #ddd;

            background: white;

            border-radius: 8px;

            padding: 10px;

            width: 100%;

            min-height: 120px;

            display: flex;

            align-items: center;

            justify-content: center;
          }

          .signature-image {
            max-width: 100%;

            max-height: 130px;

            object-fit: contain;
          }

          .unsigned-box {
            border: 1px solid #ddd;

            padding: 20px;

            border-radius: 10px;

            color: #777;
          }

          /* =========================================
             FOOTER
          ========================================= */

          .footer {
            margin-top: 35px;

            padding-top: 15px;

            border-top: 1px solid #ddd;

            text-align: center;

            font-size: 10px;

            color: #777;

            break-inside: avoid;

            page-break-inside: avoid;
          }

          /* =========================================
             PRINT
          ========================================= */

          @media print {

            html,
            body {
              width: auto !important;

              height: auto !important;

              min-height: 0 !important;

              max-height: none !important;

              margin: 0 !important;

              padding: 0 !important;

              overflow: visible !important;
            }

            body {
              display: block !important;

              -webkit-print-color-adjust: exact !important;

              print-color-adjust: exact !important;
            }

            .document {
              width: 100% !important;

              height: auto !important;

              min-height: 0 !important;

              max-height: none !important;

              overflow: visible !important;
            }

            .contract-section {
              break-inside: auto !important;

              page-break-inside: auto !important;
            }

            .contract-text {
              display: block !important;

              width: 100% !important;

              height: auto !important;

              min-height: 0 !important;

              max-height: none !important;

              overflow: visible !important;

              white-space: pre-wrap !important;

              break-inside: auto !important;

              page-break-inside: auto !important;
            }

          }

        </style>

      </head>

      <body>

        <div class="document">

          <!-- =====================================
               HEADER
          ====================================== -->

          <div class="header">

            <div>

              <img
                src="/logo.png"
                class="logo"
                alt="Maestro Events"
              />

              <div class="brand-subtitle">
                מתן שירותים לאירועים
              </div>

            </div>

            <div class="header-star">
              ✦
            </div>

          </div>


          <!-- =====================================
               TITLE
          ====================================== -->

          <div class="title">

            <div class="title-small">
              הסכם התקשרות
            </div>

            <h1>
              ${escapeHtml(
                contract.title ||
                  "הסכם שירות"
              )}
            </h1>

            <div class="gold-line"></div>

          </div>


          <!-- =====================================
               CONTRACT INFO
          ====================================== -->

          <div class="details-box">

            <h2>
              פרטי ההסכם
            </h2>

            <div class="details">

              <div>

                <div class="detail-label">
                  מספר חוזה
                </div>

                <div class="detail-value">
                  #${escapeHtml(
                    contract.id
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  נוצר בתאריך
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    createdDate
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  סטטוס
                </div>

                <div class="detail-value">
                  ${
                    hasSigned
                      ? "חתום"
                      : "ממתין לחתימה"
                  }
                </div>

              </div>

            </div>

          </div>


          <!-- =====================================
               CLIENT
          ====================================== -->

          <div class="details-box">

            <h2>
              פרטי הלקוח והאירוע
            </h2>

            <div class="details">

              <div>

                <div class="detail-label">
                  שם הלקוח
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.name || "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  טלפון
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.phone || "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  אימייל
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.email || "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  סוג האירוע
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.eventType || "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  תאריך האירוע
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.eventDate || "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  מספר מוזמנים
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.guests ??
                      "-"
                  )}
                </div>

              </div>


              <div>

                <div class="detail-label">
                  מיקום
                </div>

                <div class="detail-value">
                  ${escapeHtml(
                    client?.location || "-"
                  )}
                </div>

              </div>

            </div>

          </div>


          <!-- =====================================
               SERVICES
          ====================================== -->

          ${servicesHtml}


          <!-- =====================================
               PAYMENT
          ====================================== -->

          <section class="section avoid-break">

            <h2>
              פרטי תשלום
            </h2>

            <div class="amounts">

              <div class="amount">

                <div class="amount-label">
                  סכום העסקה
                </div>

                <div class="amount-value">
                  ${escapeHtml(
                    money(
                      contract.totalAmount
                    )
                  )}
                </div>

              </div>


              <div class="amount">

                <div class="amount-label">
                  מקדמה
                </div>

                <div class="amount-value">
                  ${escapeHtml(
                    money(
                      contract.depositAmount
                    )
                  )}
                </div>

              </div>


              <div class="amount">

                <div class="amount-label">
                  יתרה לתשלום
                </div>

                <div class="amount-value">
                  ${escapeHtml(
                    money(
                      contract.remainingAmount
                    )
                  )}
                </div>

              </div>

            </div>

          </section>


          <!-- =====================================
               ALCOHOL
          ====================================== -->

          ${alcoholHtml}


          <!-- =====================================
               FULL CONTRACT
          ====================================== -->

          <section class="contract-section">

            <h2>
              תנאי ההתקשרות
            </h2>

            <div class="contract-text">
              ${safeContractContent}
            </div>

          </section>


          <!-- =====================================
               SIGNATURE
          ====================================== -->

          ${signatureHtml}


          <!-- =====================================
               FOOTER
          ====================================== -->

          <div class="footer">

            Maestro Events

            <br />

            מתן שירותים • מקצועיות • חוויה

          </div>

        </div>


        <!-- =======================================
             AUTO PRINT
        ======================================== -->

        <script>

          window.addEventListener(
            "load",
            function () {

              setTimeout(
                function () {

                  window.focus();

                  window.print();

                },
                700
              );

            }
          );

        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#090909] text-white flex items-center justify-center"
      >
        <div className="text-center">

          <div className="text-[#D4AF37] text-3xl mb-4">
            Maestro Events
          </div>

          <div className="text-gray-400">
            טוען את ההסכם...
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !contract) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#090909] text-white flex items-center justify-center px-5"
      >
        <div className="bg-[#151515] border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center">

          <div className="text-4xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-black mb-3">
            לא ניתן לפתוח את ההסכם
          </h1>

          <p className="text-gray-400">
            {error || "החוזה לא נמצא"}
          </p>

        </div>
      </div>
    );
  }

  const client = contract.client;

  const money = (value?: number | null) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "0 ₪";
    }

    return `${Number(value).toLocaleString(
      "he-IL"
    )} ₪`;
  };

  const createdDate = contract.createdAt
    ? new Date(
        contract.createdAt
      ).toLocaleDateString("he-IL")
    : "-";

  const signedDate = contract.signedAt
    ? new Date(
        contract.signedAt
      ).toLocaleString("he-IL")
    : null;

  return (
    <>
      <div
        dir="rtl"
        className="min-h-screen bg-[#090909] text-white"
      >

        {/* ================================================= */}
        {/* TOP HEADER */}
        {/* ================================================= */}

        <div className="no-print bg-[#0d0d0d] border-b border-[#292929]">

          <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <img
                src="/logo.png"
                alt="Maestro Events"
                className="w-[145px] h-auto object-contain"
              />

              <div className="hidden sm:block border-r border-[#333] pr-4">

                <div className="text-[#D4AF37] font-bold">
                  הסכם שירות
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  מסמך התקשרות
                </div>

              </div>

            </div>


            {hasSigned && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl font-bold text-sm">
                ✓ החוזה חתום
              </div>
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* DOCUMENT */}
        {/* ================================================= */}

        <main className="contract-screen max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">

          <div className="contract-document bg-white text-[#111] shadow-2xl">

            {/* HEADER */}

            <section className="px-6 md:px-12 pt-10 pb-8 border-b border-gray-200">

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

                <div>

                  <div className="text-sm text-gray-500 mb-2">
                    Maestro Events
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black">
                    {contract.title ||
                      "הסכם שירות"}
                  </h1>

                  <div className="mt-3 text-gray-500">
                    הסכם התקשרות ושירות
                  </div>

                </div>


                <div className="text-right md:text-left">

                  <div className="text-xs text-gray-500">
                    מספר חוזה
                  </div>

                  <div className="font-black text-lg">
                    #{contract.id}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    נוצר בתאריך
                  </div>

                  <div className="font-bold">
                    {createdDate}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    סטטוס
                  </div>

                  <div
                    className={
                      hasSigned
                        ? "font-bold text-green-700"
                        : "font-bold text-orange-600"
                    }
                  >
                    {hasSigned
                      ? "חתום"
                      : "ממתין לחתימה"}
                  </div>

                </div>

              </div>

            </section>


            {/* CLIENT */}

            <section className="px-6 md:px-12 py-8 border-b border-gray-200">

              <h2 className="text-xl font-black mb-5">
                פרטי הלקוח והאירוע
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Info
                  label="שם הלקוח"
                  value={client?.name || "-"}
                />

                <Info
                  label="טלפון"
                  value={client?.phone || "-"}
                />

                <Info
                  label="אימייל"
                  value={client?.email || "-"}
                />

                <Info
                  label="סוג האירוע"
                  value={client?.eventType || "-"}
                />

                <Info
                  label="תאריך האירוע"
                  value={client?.eventDate || "-"}
                />

                <Info
                  label="מספר מוזמנים"
                  value={
                    client?.guests !== null &&
                    client?.guests !== undefined
                      ? String(client.guests)
                      : "-"
                  }
                />

                <Info
                  label="מיקום"
                  value={client?.location || "-"}
                />

              </div>

            </section>


            {/* SERVICES */}

            {client?.services &&
              client.services.length > 0 && (

                <section className="px-6 md:px-12 py-8 border-b border-gray-200">

                  <h2 className="text-xl font-black mb-5">
                    השירותים שנבחרו
                  </h2>

                  <div className="space-y-3">

                    {client.services.map(
                      (service, index) => (

                        <div
                          key={
                            service.id ??
                            index
                          }
                          className="border border-gray-200 rounded-xl p-4"
                        >

                          <div className="font-bold">
                            {service.serviceName ||
                              "-"}
                          </div>

                          {service.price !==
                            undefined &&
                            service.price !==
                              null && (

                              <div className="text-gray-500 mt-1">

                                {money(
                                  service.price
                                )}

                              </div>

                            )}

                        </div>

                      )
                    )}

                  </div>

                </section>

              )}


            {/* PAYMENT */}

            <section className="px-6 md:px-12 py-8 border-b border-gray-200">

              <h2 className="text-xl font-black mb-5">
                פרטי תשלום
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <MoneyBox
                  label="סה״כ"
                  value={money(
                    contract.totalAmount
                  )}
                />

                <MoneyBox
                  label="מקדמה"
                  value={money(
                    contract.depositAmount
                  )}
                />

                <MoneyBox
                  label="יתרה לתשלום"
                  value={money(
                    contract.remainingAmount
                  )}
                />

              </div>

            </section>


            {/* ALCOHOL */}

            {client?.alcoholList?.trim() && (

              <section className="px-6 md:px-12 py-8 border-b border-gray-200">

                <h2 className="text-xl font-black mb-5">
                  רשימת אלכוהול ומשקאות
                </h2>

                <div className="whitespace-pre-wrap leading-8 text-gray-800">
                  {client.alcoholList}
                </div>

              </section>

            )}


            {/* FULL CONTRACT */}

            <section className="px-6 md:px-12 py-10">

              <h2 className="text-xl font-black mb-6">
                תנאי ההתקשרות
              </h2>

              <div className="contract-content whitespace-pre-wrap leading-8 text-gray-800">
                {contract.content}
              </div>

            </section>


            {/* SIGNED INFORMATION */}

            {hasSigned && (

              <section className="px-6 md:px-12 py-8 border-t border-gray-200">

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                  <div className="text-green-800 font-black text-xl mb-3">
                    ✓ ההסכם נחתם דיגיטלית
                  </div>

                  {signedDate && (

                    <div className="text-green-700 mb-5">

                      תאריך ושעת חתימה:{" "}

                      <strong>
                        {signedDate}
                      </strong>

                    </div>

                  )}

                  {signature && (

                    <div>

                      <div className="text-sm text-gray-500 mb-2">
                        חתימת הלקוח
                      </div>

                      <div className="border border-gray-200 rounded-xl p-4 bg-white">

                        <img
                          src={signature}
                          alt="חתימת הלקוח"
                          className="max-h-[130px] max-w-full object-contain"
                        />

                      </div>

                    </div>

                  )}

                </div>

              </section>

            )}


            {/* SIGNATURE AREA */}

            {!hasSigned && (

              <section className="no-print px-6 md:px-12 pb-12">

                <div className="border-t border-gray-200 pt-8">

                  <h2 className="text-2xl font-black mb-3">
                    חתימה ואישור ההסכם
                  </h2>

                  <p className="text-gray-600 leading-7 mb-6">
                    יש לחתום בתוך המסגרת באמצעות האצבע,
                    עט דיגיטלי או עכבר.
                  </p>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white">

                    <canvas
                      ref={canvasRef}
                      className="w-full h-[220px] touch-none cursor-crosshair"
                      onPointerDown={
                        startDrawing
                      }
                      onPointerMove={
                        draw
                      }
                      onPointerUp={
                        stopDrawing
                      }
                      onPointerCancel={
                        stopDrawing
                      }
                      onPointerLeave={
                        stopDrawing
                      }
                    />

                  </div>

                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-3 border border-gray-300 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition"
                  >
                    🗑️ נקה חתימה
                  </button>

                  <div className="mt-8 space-y-4">

                    <label className="flex items-start gap-3 cursor-pointer">

                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(event) =>
                          setTermsAccepted(
                            event.target.checked
                          )
                        }
                        className="mt-1 w-5 h-5"
                      />

                      <span className="leading-7">
                        קראתי את ההסכם במלואו,
                        אני מאשר/ת את תנאיו
                        ומסכים/ה לחתום עליו
                        באופן דיגיטלי.
                      </span>

                    </label>


                    <label className="flex items-start gap-3 cursor-pointer">

                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(event) =>
                          setMarketingConsent(
                            event.target.checked
                          )
                        }
                        className="mt-1 w-5 h-5"
                      />

                      <span className="leading-7 text-gray-600">
                        אני מאשר/ת לקבל עדכונים,
                        מבצעים ותכנים שיווקיים
                        מ־Maestro Events.
                      </span>

                    </label>

                  </div>


                  <button
                    type="button"
                    disabled={
                      saving ||
                      !signature ||
                      !termsAccepted
                    }
                    onClick={
                      signContract
                    }
                    className="mt-8 w-full bg-[#D4AF37] hover:bg-[#e5c451] disabled:bg-gray-300 disabled:text-gray-500 text-black font-black text-lg py-4 rounded-xl transition"
                  >
                    {saving
                      ? "שומר את החתימה..."
                      : "✍️ חתום על ההסכם"}
                  </button>

                </div>

              </section>

            )}


            {/* FOOTER */}

            <footer className="border-t border-gray-200 px-6 md:px-12 py-6 text-center text-sm text-gray-500">
              Maestro Events • הסכם שירות
            </footer>

          </div>


          {/* ================================================= */}
          {/* PRINT BUTTON */}
          {/* ================================================= */}

        <div className="no-print mt-6 flex justify-center">

  {hasSigned ? (
    <button
      type="button"
      onClick={() => {
        if (!contract.publicToken) {
          alert("לא נמצא קישור ציבורי לחוזה.");
          return;
        }

        window.open(
          `/api/contracts/pdf?token=${encodeURIComponent(
            contract.publicToken
          )}`,
          "_blank"
        );
      }}
      className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-[#D4AF37] hover:bg-[#e5c451] text-black font-black px-8 py-4 rounded-xl transition shadow-lg"
    >
      📄 הורד חוזה חתום PDF
    </button>
  ) : (
    <div className="w-full md:w-auto text-center border border-gray-300 bg-white/5 text-gray-400 px-8 py-4 rounded-xl">
      🔒 PDF חתום יהיה זמין לאחר חתימת ההסכם
    </div>
  )}

</div>

        </main>

      </div>


      {/* ================================================= */}
      {/* SCREEN PRINT CSS */}
      {/* ================================================= */}

      <style jsx global>{`

        @media print {

          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;

            width: 100% !important;

            min-height: 0 !important;

            height: auto !important;

            background: #ffffff !important;

            color: #111111 !important;

            overflow: visible !important;
          }

          body {
            display: block !important;
          }

          .no-print {
            display: none !important;
          }

          .contract-screen {
            width: 100% !important;

            max-width: none !important;

            margin: 0 !important;

            padding: 0 !important;
          }

          .contract-document {
            width: 100% !important;

            max-width: none !important;

            margin: 0 !important;

            padding: 0 !important;

            background: #ffffff !important;

            color: #111111 !important;

            box-shadow: none !important;

            border-radius: 0 !important;

            overflow: visible !important;
          }

          .contract-content {
            display: block !important;

            white-space: pre-wrap !important;

            overflow: visible !important;

            height: auto !important;

            max-height: none !important;

            word-break: normal !important;

            overflow-wrap: anywhere !important;
          }

          .contract-document section,
          .contract-document div,
          .contract-document p {
            overflow: visible !important;

            max-height: none !important;
          }

          h1,
          h2,
          h3 {
            break-after: avoid !important;

            page-break-after: avoid !important;
          }

          section {
            break-inside: auto !important;

            page-break-inside: auto !important;
          }

          img {
            max-width: 100% !important;
          }

          button {
            display: none !important;
          }

          footer {
            break-inside: avoid !important;

            page-break-inside: avoid !important;
          }

        }

      `}</style>
    </>
  );
}

// ======================================================
// INFO
// ======================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">

      <div className="text-xs text-gray-500 mb-1">
        {label}
      </div>

      <div className="font-bold">
        {value}
      </div>

    </div>
  );
}

// ======================================================
// MONEY BOX
// ======================================================

function MoneyBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">

      <div className="text-xs text-gray-500 mb-2">
        {label}
      </div>

      <div className="text-xl font-black">
        {value}
      </div>

    </div>
  );
}