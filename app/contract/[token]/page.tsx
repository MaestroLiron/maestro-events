"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

// ======================================================
// TYPES
// ======================================================

type Client = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guests?: number | string | null;
  location?: string | null;
};

type Contract = {
  id: number;
  clientId: number;
  title: string;
  content: string;
  status: string;

  totalAmount?: number | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;
  depositPercent?: number | null;

  publicToken?: string | null;

  createdAt?: string;
  updatedAt?: string;

  sentAt?: string | null;
  signedAt?: string | null;

  signatureData?: string | null;
  marketingConsent?: boolean | null;

  client?: Client | null;

  template?: {
    id: number;
    name?: string | null;
    description?: string | null;
  } | null;
};

// ======================================================
// PAGE
// ======================================================

export default function PublicContractPage({
  params,
}: {
  params:
    | { token: string }
    | Promise<{ token: string }>;
}) {
  const [token, setToken] = useState("");

  const [contract, setContract] =
    useState<Contract | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [signature, setSignature] =
    useState("");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [marketingConsent, setMarketingConsent] =
    useState(false);

  const [signing, setSigning] =
    useState(false);

  const [signedSuccessfully, setSignedSuccessfully] =
    useState(false);

  // ====================================================
  // CANVAS
  // ====================================================

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const drawingRef =
    useRef(false);

  const hasSignatureRef =
    useRef(false);

  // ====================================================
  // GET TOKEN
  // ====================================================

  useEffect(() => {
    let active = true;

    async function getToken() {
      try {
        const resolvedParams =
          await Promise.resolve(params);

        const value =
          resolvedParams?.token;

        if (active) {
          setToken(
            typeof value === "string"
              ? value
              : ""
          );
        }
      } catch (err) {
        console.error(
          "TOKEN ERROR:",
          err
        );

        if (active) {
          setError(
            "קישור החוזה אינו תקין"
          );
          setLoading(false);
        }
      }
    }

    getToken();

    return () => {
      active = false;
    };
  }, [params]);

  // ====================================================
  // PRINT CSS
  // ====================================================

  useEffect(() => {
    const styleId =
      "maestro-contract-print-style";

    if (
      document.getElementById(styleId)
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @media print {

        @page {
          size: A4;
          margin: 12mm;
        }

        html,
        body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        body * {
          visibility: hidden !important;
        }

        #maestro-print-contract,
        #maestro-print-contract * {
          visibility: visible !important;
        }

        #maestro-print-contract {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #f6f1e5 !important;
          color: #161616 !important;
          box-shadow: none !important;
          border: 1px solid #b89432 !important;
          border-radius: 0 !important;
        }

        #maestro-print-contract .print-no-break {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        #maestro-print-contract .print-page-break {
          break-before: page !important;
          page-break-before: always !important;
        }

        #maestro-print-contract img {
          max-width: 100% !important;
        }

        #maestro-print-contract * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        #maestro-print-contract .contract-content {
          white-space: pre-wrap !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existing =
        document.getElementById(
          styleId
        );

      if (existing) {
        existing.remove();
      }
    };
  }, []);

  // ====================================================
  // LOAD CONTRACT
  // ====================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadContract() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/contracts?token=${encodeURIComponent(
              token
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const text =
          await response.text();

        let data: any = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          data = {
            error: text,
          };
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "לא ניתן לפתוח את החוזה"
          );
        }

        if (!data?.id) {
          throw new Error(
            "החוזה שהתקבל אינו תקין"
          );
        }

        if (!cancelled) {
          setContract(data);

          if (
            data.status === "SIGNED" ||
            data.signedAt
          ) {
            setSignedSuccessfully(
              true
            );
          }
        }
      } catch (err) {
        console.error(
          "CONTRACT LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "לא ניתן לפתוח את החוזה"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContract();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ====================================================
  // MONEY
  // ====================================================

  function money(
    value:
      | number
      | string
      | null
      | undefined
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "₪0";
    }

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "₪0";
    }

    return `₪${number.toLocaleString(
      "he-IL",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  // ====================================================
  // DATE
  // ====================================================

  function formatDate(
    value:
      | string
      | null
      | undefined
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "he-IL"
    );
  }

  // ====================================================
  // DOWNLOAD / PRINT CONTRACT
  // ====================================================

  function downloadContract() {
    if (!contract) {
      return;
    }

    window.print();
  }

  // ====================================================
  // CANVAS SETUP
  // ====================================================

  useEffect(() => {
    if (
      alreadySignedHelper(contract)
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    function setupCanvas() {
      const rect =
        canvas!.getBoundingClientRect();

      const ratio =
        Math.max(
          window.devicePixelRatio || 1,
          1
        );

      canvas!.width =
        Math.round(
          rect.width * ratio
        );

      canvas!.height =
        Math.round(
          rect.height * ratio
        );

      const context =
        canvas!.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      context.lineWidth = 3;

      context.lineCap =
        "round";

      context.lineJoin =
        "round";

      context.strokeStyle =
        "#111111";
    }

    setupCanvas();

    window.addEventListener(
      "resize",
      setupCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        setupCanvas
      );
    };
  }, [contract]);

  // ====================================================
  // POINTER POSITION
  // ====================================================

  function getPointerPosition(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  }

  // ====================================================
  // POINTER DOWN
  // ====================================================

  function handlePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    event.preventDefault();

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.setPointerCapture(
      event.pointerId
    );

    const position =
      getPointerPosition(event);

    context.beginPath();

    context.moveTo(
      position.x,
      position.y
    );

    drawingRef.current = true;

    hasSignatureRef.current =
      true;
  }

  // ====================================================
  // POINTER MOVE
  // ====================================================

  function handlePointerMove(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    event.preventDefault();

    if (
      !drawingRef.current
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    const position =
      getPointerPosition(event);

    context.lineTo(
      position.x,
      position.y
    );

    context.stroke();
  }

  // ====================================================
  // POINTER UP
  // ====================================================

  function handlePointerUp(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    event.preventDefault();

    if (
      !drawingRef.current
    ) {
      return;
    }

    drawingRef.current = false;

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    try {
      const image =
        canvas.toDataURL(
          "image/png"
        );

      setSignature(image);
    } catch (err) {
      console.error(
        "SIGNATURE ERROR:",
        err
      );
    }
  }

  // ====================================================
  // CLEAR SIGNATURE
  // ====================================================

  function clearSignature() {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setSignature("");

    hasSignatureRef.current =
      false;
  }

  // ====================================================
  // SIGN CONTRACT
  // ====================================================

  async function signContract() {
    if (!contract) {
      return;
    }

    if (!termsAccepted) {
      alert(
        "יש לאשר שקראת והסכמת לתנאי החוזה"
      );
      return;
    }

    if (!signature) {
      alert(
        "יש לחתום בתוך אזור החתימה"
      );
      return;
    }

    try {
      setSigning(true);

      const response =
        await fetch(
          "/api/contracts",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: contract.id,

              token,

              signatureData:
                signature,

              marketingConsent:
                marketingConsent,
            }),
          }
        );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          error: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "לא ניתן לחתום על החוזה"
        );
      }

      const updatedContract =
        data?.contract ||
        data;

      setContract(
        updatedContract
      );

      setSignedSuccessfully(
        true
      );
    } catch (err) {
      console.error(
        "SIGN ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "שגיאה בחתימת החוזה"
      );
    } finally {
      setSigning(false);
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-5"
      >
        <div className="text-center">

          <Logo
            size="large"
          />

          <h1 className="mt-7 text-2xl font-bold">
            טוען את החוזה
          </h1>

          <p className="text-[#D4AF37] mt-2">
            Maestro Events
          </p>

        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !contract) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-5"
      >
        <div className="w-full max-w-xl">

          <div className="rounded-[35px] border border-[#D4AF37]/40 bg-[#111111] p-8 sm:p-12 text-center shadow-2xl">

            <Logo
              size="large"
            />

            <div className="mt-7 text-[#D4AF37] text-xs tracking-[0.4em]">
              MAESTRO EVENTS
            </div>

            <h1 className="text-3xl font-bold mt-4">
              לא ניתן לפתוח את החוזה
            </h1>

            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-5" />

            <p className="text-gray-300 mt-6">
              {error ||
                "החוזה לא נמצא"}
            </p>

            <p className="text-gray-600 text-sm mt-4">
              ייתכן שהקישור אינו תקין,
              שהחוזה נמחק או שהקישור אינו זמין יותר.
            </p>

          </div>

        </div>
      </div>
    );
  }

  const alreadySigned =
    contract.status ===
      "SIGNED" ||
    Boolean(
      contract.signedAt
    );

  // ====================================================
  // MAIN
  // ====================================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white overflow-x-hidden"
    >

      {/* ================================================= */}
      {/* TOP GOLD LINE */}
      {/* ================================================= */}

      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent print:hidden" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 print:hidden">

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <Logo />

              <div>

                <div className="text-[#D4AF37] font-bold text-lg">
                  Maestro Events
                </div>

                <div className="text-gray-500 text-xs">
                  הסכם הפקת אירוע
                </div>

              </div>

            </div>

            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">

              <span className="w-2 h-2 rounded-full bg-green-500" />

              מסמך דיגיטלי מאובטח

            </div>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="relative">

        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#D4AF37]/[0.035] blur-[130px] print:hidden" />

        <div className="pointer-events-none absolute top-[900px] right-0 w-[350px] h-[500px] bg-[#D4AF37]/[0.02] blur-[100px] print:hidden" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* ================================================= */}
          {/* COVER */}
          {/* ================================================= */}

          <section className="relative overflow-hidden rounded-[40px] border border-[#D4AF37]/40 bg-gradient-to-br from-[#181818] via-[#0d0d0d] to-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.55)] print:hidden">

            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full border border-[#D4AF37]/10" />

            <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full border border-[#D4AF37]/10" />

            <div className="relative px-6 sm:px-12 py-14 sm:py-20 text-center">

              <div className="flex justify-center">

                <div className="relative">

                  <div className="absolute -inset-5 rounded-full border border-[#D4AF37]/10" />

                  <div className="absolute -inset-10 rounded-full border border-[#D4AF37]/5" />

                  <div className="relative">
                    <Logo
                      size="hero"
                    />
                  </div>

                </div>

              </div>

              <div className="mt-10 text-[#D4AF37] text-[11px] sm:text-xs tracking-[0.55em] font-bold">
                MAESTRO EVENTS
              </div>

              <div className="flex items-center justify-center gap-3 mt-5">

                <div className="w-16 h-px bg-[#D4AF37]/40" />

                <div className="w-2 h-2 rotate-45 bg-[#D4AF37]" />

                <div className="w-16 h-px bg-[#D4AF37]/40" />

              </div>

              <h1 className="mt-7 text-3xl sm:text-5xl font-black leading-tight">
                {contract.title}
              </h1>

              <p className="text-gray-400 mt-5 text-base sm:text-lg">
                הסכם דיגיטלי להפקת האירוע
              </p>

              <div className="mt-7 text-gray-300">

                שלום{" "}

                <span className="text-[#D4AF37] font-bold">
                  {contract.client?.name ||
                    "לקוח יקר"}
                </span>

              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-8">

                <Badge>
                  📄 חוזה דיגיטלי
                </Badge>

                <Badge>
                  🔒 מאובטח
                </Badge>

                {contract.client?.eventDate && (
                  <Badge>
                    📅{" "}
                    {formatDate(
                      contract.client.eventDate
                    )}
                  </Badge>
                )}

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* SIGNED STATUS */}
          {/* ================================================= */}

          {alreadySigned && (
            <section className="mt-8 rounded-[30px] border border-green-700/50 bg-gradient-to-br from-green-950/40 to-[#0c0c0c] p-7 text-center print:hidden">

              <div className="w-16 h-16 mx-auto rounded-full border border-green-500 flex items-center justify-center text-3xl text-green-400">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-green-400 mt-5">
                החוזה נחתם ואושר
              </h2>

              <p className="text-gray-300 mt-2">
                החוזה הזה כבר נחתם דיגיטלית.
              </p>

              {contract.signedAt && (
                <p className="text-gray-500 text-sm mt-3">
                  נחתם בתאריך{" "}
                  {formatDate(
                    contract.signedAt
                  )}
                </p>
              )}

              {/* DOWNLOAD BUTTON */}

              <button
                type="button"
                onClick={
                  downloadContract
                }
                className="mt-6 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#9a741d] via-[#D4AF37] to-[#9a741d] text-black font-black text-base sm:text-lg shadow-[0_12px_35px_rgba(212,175,55,0.22)] hover:brightness-110 active:scale-[0.98] transition"
              >
                <span className="text-xl">
                  ⬇
                </span>

                הורדת החוזה
              </button>

              <p className="text-gray-500 text-xs mt-3">
                בלחיצה על הכפתור ניתן לשמור את החוזה כקובץ PDF
              </p>

            </section>
          )}

          {/* ================================================= */}
          {/* CLIENT DETAILS */}
          {/* ================================================= */}

          <section className="mt-8 print:hidden">

            <SectionHeader
              number="01"
              title="פרטי הלקוח והאירוע"
              subtitle="הפרטים כפי שנשמרו במערכת"
            />

            <div className="mt-5 rounded-[30px] border border-white/10 bg-[#101010] p-5 sm:p-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <InfoBox
                  label="שם הלקוח"
                  value={
                    contract.client?.name
                  }
                />

                <InfoBox
                  label="טלפון"
                  value={
                    contract.client?.phone
                  }
                />

                <InfoBox
                  label="אימייל"
                  value={
                    contract.client?.email
                  }
                />

                <InfoBox
                  label="סוג האירוע"
                  value={
                    contract.client?.eventType
                  }
                />

                <InfoBox
                  label="תאריך האירוע"
                  value={
                    contract.client?.eventDate
                      ? formatDate(
                          contract.client.eventDate
                        )
                      : undefined
                  }
                />

                <InfoBox
                  label="מספר מוזמנים"
                  value={
                    contract.client?.guests
                  }
                />

                <InfoBox
                  label="מיקום האירוע"
                  value={
                    contract.client?.location
                  }
                />

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* FINANCIAL */}
          {/* ================================================= */}

          <section className="mt-10 print:hidden">

            <SectionHeader
              number="02"
              title="פרטי העסקה"
              subtitle="סיכום כספי של ההסכם"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

              <AmountBox
                title="סכום העסקה"
                value={money(
                  contract.totalAmount
                )}
                icon="₪"
              />

              <AmountBox
                title="מקדמה"
                value={money(
                  contract.depositAmount
                )}
                icon="✓"
                green
              />

              <AmountBox
                title="יתרה לתשלום"
                value={money(
                  contract.remainingAmount
                )}
                icon="◈"
                orange
              />

            </div>

          </section>

          {/* ================================================= */}
          {/* CONTRACT DOCUMENT */}
          {/* ================================================= */}

          <section className="mt-10">

            <SectionHeader
              number="03"
              title="הסכם ההתקשרות"
              subtitle="המסמך המלא"
            />

            <div className="mt-5 rounded-[34px] border border-[#D4AF37]/20 bg-[#0c0c0c] p-3 sm:p-5 shadow-2xl print:border-0 print:bg-transparent print:p-0 print:shadow-none">

              <article
                id="maestro-print-contract"
                className="relative overflow-hidden rounded-[26px] bg-[#f6f1e5] text-[#161616] shadow-[0_20px_60px_rgba(0,0,0,0.35)] print:rounded-none print:shadow-none"
              >

                {/* GOLD TOP */}

                <div className="h-2 bg-gradient-to-r from-[#8b691c] via-[#D4AF37] to-[#8b691c]" />

                <div className="px-6 sm:px-12 py-10 sm:py-14">

                  {/* DOCUMENT HEADER */}

                  <div className="text-center print-no-break">

                    <div className="flex justify-center">

                      <div className="w-24 h-24 rounded-full border border-[#b89432] bg-[#111111] flex items-center justify-center overflow-hidden">

                        <img
                          src="/logo.png"
                          alt="Maestro Events"
                          className="w-18 h-18 object-contain"
                        />

                      </div>

                    </div>

                    <div className="mt-5 text-[#80631e] text-xs tracking-[0.4em] font-bold">
                      MAESTRO EVENTS
                    </div>

                    <h2 className="mt-4 text-2xl sm:text-3xl font-black">
                      {contract.title}
                    </h2>

                    <div className="flex justify-center items-center gap-3 mt-5">

                      <div className="w-16 h-px bg-[#b89432]/50" />

                      <div className="w-2.5 h-2.5 rotate-45 bg-[#b89432]" />

                      <div className="w-16 h-px bg-[#b89432]/50" />

                    </div>

                  </div>

                  {/* CLIENT MINI CARD */}

                  <div className="mt-9 rounded-2xl border border-[#b89432]/30 bg-[#eee7d7] px-5 py-4 text-center print-no-break">

                    <div className="text-[11px] text-[#80631e] font-bold tracking-wider">
                      הצדדים להסכם
                    </div>

                    <div className="mt-2 font-bold">
                      Maestro Events
                    </div>

                    <div className="text-[#777] my-1">
                      &
                    </div>

                    <div className="font-bold">
                      {contract.client?.name ||
                        "לקוח יקר"}
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="mt-10">

                    <div className="text-center mb-7">

                      <div className="inline-block px-5 py-2 rounded-full border border-[#b89432]/30 text-[#80631e] text-xs font-bold">
                        תוכן ההסכם
                      </div>

                    </div>

                    <div className="contract-content whitespace-pre-wrap text-center leading-[2.1] text-[15px] sm:text-[17px] font-medium">
                      {contract.content}
                    </div>

                  </div>

                  {/* SIGNATURE ON PDF */}

                  {contract.signatureData && (
                    <div className="mt-12 pt-8 border-t border-[#b89432]/30 print-no-break">

                      <div className="text-center">

                        <div className="text-[#80631e] text-sm font-bold mb-4">
                          חתימת הלקוח
                        </div>

                        <div className="inline-flex items-center justify-center min-h-[120px] min-w-[260px] rounded-2xl border border-[#b89432]/30 bg-white px-6 py-4">

                          <img
                            src={
                              contract.signatureData
                            }
                            alt="חתימת הלקוח"
                            className="max-w-[280px] max-h-[110px] object-contain"
                          />

                        </div>

                        {contract.signedAt && (
                          <div className="text-xs text-[#777] mt-3">
                            נחתם בתאריך{" "}
                            {formatDate(
                              contract.signedAt
                            )}
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                  {/* DOCUMENT FOOTER */}

                  <div className="mt-12 pt-7 border-t border-[#b89432]/30 text-center print-no-break">

                    <div className="flex justify-center items-center gap-3 mb-4">

                      <div className="w-10 h-px bg-[#b89432]/40" />

                      <div className="w-2 h-2 rotate-45 bg-[#b89432]" />

                      <div className="w-10 h-px bg-[#b89432]/40" />

                    </div>

                    <p className="text-xs text-[#777]">
                      מסמך זה הופק באופן דיגיטלי
                    </p>

                    <p className="text-xs text-[#999] mt-1">
                      Maestro Events
                    </p>

                  </div>

                </div>

              </article>

            </div>

          </section>

          {/* ================================================= */}
          {/* SIGNATURE AREA */}
          {/* ================================================= */}

          {!alreadySigned &&
            !signedSuccessfully && (
              <section className="relative mt-10 overflow-hidden rounded-[34px] border border-[#D4AF37]/40 bg-gradient-to-br from-[#171717] via-[#101010] to-[#080808] p-5 sm:p-9 shadow-2xl print:hidden">

                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                <div className="text-center mb-8">

                  <div className="w-16 h-16 mx-auto rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-3xl">
                    ✍
                  </div>

                  <div className="text-[#D4AF37] text-[11px] tracking-[0.4em] mt-5">
                    DIGITAL SIGNATURE
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black mt-3">
                    אישור וחתימה דיגיטלית
                  </h2>

                  <p className="text-gray-500 mt-3">
                    לאחר החתימה ההסכם יסומן כחתום במערכת Maestro Events
                  </p>

                </div>

                {/* TERMS */}

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">

                  <label className="flex items-start gap-4 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={
                        termsAccepted
                      }
                      onChange={(event) =>
                        setTermsAccepted(
                          event.target.checked
                        )
                      }
                      className="mt-1 w-5 h-5 accent-[#D4AF37]"
                    />

                    <span className="text-gray-200 leading-7 text-sm sm:text-base">
                      אני מאשר/ת שקראתי את ההסכם,
                      הבנתי את תנאיו ואני מסכים/ה
                      לפרטים המופיעים בו.
                    </span>

                  </label>

                </div>

                {/* MARKETING */}

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-5">

                  <label className="flex items-start gap-4 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={
                        marketingConsent
                      }
                      onChange={(event) =>
                        setMarketingConsent(
                          event.target.checked
                        )
                      }
                      className="mt-1 w-5 h-5 accent-[#D4AF37]"
                    />

                    <span className="text-gray-200 leading-7 text-sm sm:text-base">

                      אני מאשר/ת ל־Maestro Events להשתמש בתמונות וסרטונים מהאירוע לצורכי שיווק, פרסום ותיק עבודות.

                      <span className="block text-xs text-gray-500 mt-2">
                        אישור זה הוא לבחירה ואינו תנאי לחתימת החוזה.
                      </span>

                    </span>

                  </label>

                </div>

                {/* SIGNATURE */}

                <div className="mt-6 rounded-3xl bg-[#f6f1e5] p-4 sm:p-6">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">

                    <div className="text-center sm:text-right">

                      <h3 className="text-black font-black text-lg">
                        חתימת הלקוח
                      </h3>

                      <p className="text-gray-500 text-xs mt-1">
                        חתום/י עם העכבר, האצבע או עט מגע
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        clearSignature
                      }
                      className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition"
                    >
                      🗑 נקה חתימה
                    </button>

                  </div>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#b5b5b5] bg-white">

                    <canvas
                      ref={
                        canvasRef
                      }
                      className="block w-full h-[240px] cursor-crosshair touch-none select-none"
                      onPointerDown={
                        handlePointerDown
                      }
                      onPointerMove={
                        handlePointerMove
                      }
                      onPointerUp={
                        handlePointerUp
                      }
                      onPointerCancel={
                        handlePointerUp
                      }
                      onPointerLeave={
                        handlePointerUp
                      }
                    />

                    {!hasSignatureRef.current &&
                      !signature && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                          <div className="text-gray-300 text-lg font-medium">
                            ✍ חתום/י כאן
                          </div>

                        </div>
                      )}

                  </div>

                  <div className="text-center text-gray-400 text-[11px] mt-3">
                    החתימה נשמרת באופן דיגיטלי כחלק מההסכם
                  </div>

                </div>

                {/* BUTTON */}

                <button
                  type="button"
                  onClick={
                    signContract
                  }
                  disabled={
                    signing ||
                    !termsAccepted ||
                    !signature
                  }
                  className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[#9a741d] via-[#D4AF37] to-[#9a741d] text-black font-black text-lg shadow-[0_12px_35px_rgba(212,175,55,0.18)] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {signing
                    ? "שומר את החתימה..."
                    : "✓ חתום ואשר את החוזה"}
                </button>

                {!termsAccepted && (
                  <p className="text-center text-yellow-500 text-xs mt-3">
                    יש לאשר את תנאי החוזה כדי להמשיך
                  </p>
                )}

                {termsAccepted &&
                  !signature && (
                    <p className="text-center text-yellow-500 text-xs mt-3">
                      יש לחתום בתוך אזור החתימה
                    </p>
                  )}

              </section>
            )}

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {signedSuccessfully && (
            <section className="mt-10 rounded-[34px] border border-green-700/50 bg-gradient-to-br from-green-950/40 to-[#0b0b0b] p-8 sm:p-14 text-center shadow-2xl print:hidden">

              <div className="w-24 h-24 mx-auto rounded-full border-2 border-green-500 flex items-center justify-center text-5xl text-green-400">
                ✓
              </div>

              <div className="text-green-400 text-[11px] tracking-[0.4em] mt-7">
                SIGNED SUCCESSFULLY
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-green-400 mt-3">
                החוזה נחתם בהצלחה
              </h2>

              <p className="text-gray-300 mt-5 leading-8">

                תודה{" "}

                <span className="text-[#D4AF37] font-bold">
                  {contract.client?.name ||
                    ""}
                </span>

                .

                <br />

                החוזה נשמר במערכת Maestro Events.

              </p>

              {marketingConsent && (
                <div className="inline-flex mt-7 px-5 py-3 rounded-full bg-green-900/30 border border-green-700 text-green-400 text-sm">
                  📸 אישור שימוש בתמונות התקבל
                </div>
              )}

              <div className="mt-7 text-gray-500 text-sm">
                תאריך חתימה:{" "}
                {formatDate(
                  contract.signedAt ||
                    new Date().toISOString()
                )}
              </div>

              {/* DOWNLOAD BUTTON */}

              <button
                type="button"
                onClick={
                  downloadContract
                }
                className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#9a741d] via-[#D4AF37] to-[#9a741d] text-black font-black text-lg shadow-[0_12px_35px_rgba(212,175,55,0.25)] hover:brightness-110 active:scale-[0.98] transition"
              >
                <span className="text-2xl">
                  ⬇
                </span>

                הורדת החוזה
              </button>

              <p className="text-gray-500 text-xs mt-3">
                החוזה ייפתח להדפסה. בחר/י "שמירה כ-PDF" כדי לשמור אותו במכשיר.
              </p>

            </section>
          )}

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <footer className="text-center pt-12 pb-10 mt-12 border-t border-white/10 print:hidden">

            <Logo />

            <div className="text-[#D4AF37] font-bold text-lg mt-4">
              Maestro Events
            </div>

            <div className="text-gray-600 text-xs mt-2">
              הפקת אירועים • חוויות • זיכרונות
            </div>

            <div className="text-gray-700 text-xs mt-4">
              מסמך זה נוצר ונחתם באופן דיגיטלי.
            </div>

          </footer>

        </div>

      </div>

    </main>
  );
}

// ======================================================
// HELPER
// ======================================================

function alreadySignedHelper(
  contract: Contract | null
) {
  if (!contract) {
    return false;
  }

  return (
    contract.status === "SIGNED" ||
    Boolean(contract.signedAt)
  );
}

// ======================================================
// LOGO
// ======================================================

function Logo({
  size = "normal",
}: {
  size?: "normal" | "large" | "hero";
}) {
  let box =
    "w-14 h-14";

  let image =
    "w-10 h-10";

  if (size === "large") {
    box =
      "w-28 h-28";

    image =
      "w-20 h-20";
  }

  if (size === "hero") {
    box =
      "w-32 h-32 sm:w-36 sm:h-36";

    image =
      "w-24 h-24 sm:w-28 sm:h-28";
  }

  return (
    <div
      className={`${box} rounded-full border border-[#D4AF37] bg-black flex items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(212,175,55,0.12)]`}
    >
      <img
        src="/logo.png"
        alt="Maestro Events"
        className={`${image} object-contain`}
      />
    </div>
  );
}

// ======================================================
// BADGE
// ======================================================

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-2.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs sm:text-sm">
      {children}
    </div>
  );
}

// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">

      <div className="flex justify-center items-center gap-4">

        <div className="w-12 h-12 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black">
          {number}
        </div>

      </div>

      <h2 className="text-2xl sm:text-3xl font-black mt-4">
        {title}
      </h2>

      <div className="flex justify-center items-center gap-3 mt-4">

        <div className="w-12 h-px bg-[#D4AF37]/30" />

        <div className="w-2 h-2 rotate-45 bg-[#D4AF37]" />

        <div className="w-12 h-px bg-[#D4AF37]/30" />

      </div>

      <p className="text-gray-500 text-sm mt-3">
        {subtitle}
      </p>

    </div>
  );
}

// ======================================================
// INFO BOX
// ======================================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim()
      ? String(value)
      : "-";

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#171717] p-5 text-center transition hover:border-[#D4AF37]/30">

      <div className="text-[#D4AF37] text-xs font-bold mb-2">
        {label}
      </div>

      <div className="text-white font-bold break-words">
        {displayValue}
      </div>

    </div>
  );
}

// ======================================================
// AMOUNT BOX
// ======================================================

function AmountBox({
  title,
  value,
  icon,
  green,
  orange,
}: {
  title: string;
  value: string;
  icon: string;
  green?: boolean;
  orange?: boolean;
}) {
  let border =
    "border-white/10";

  let valueColor =
    "text-white";

  let iconColor =
    "text-[#D4AF37]";

  if (green) {
    border =
      "border-green-800/60";

    valueColor =
      "text-green-400";

    iconColor =
      "text-green-400";
  }

  if (orange) {
    border =
      "border-orange-800/60";

    valueColor =
      "text-orange-300";

    iconColor =
      "text-orange-300";
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#101010] border ${border} rounded-[26px] p-7 text-center`}
    >

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

      <div
        className={`text-3xl font-black ${iconColor}`}
      >
        {icon}
      </div>

      <div className="text-gray-500 text-sm mt-3">
        {title}
      </div>

      <div
        className={`text-2xl sm:text-3xl font-black mt-2 ${valueColor}`}
      >
        {value}
      </div>

    </div>
  );
}