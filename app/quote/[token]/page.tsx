"use client";

import { useEffect, useState } from "react";

type QuoteItem = {
  id: number;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Quote = {
  id: number;
  quoteNumber: string;
  title: string;
  eventType?: string | null;
  eventDate?: string | null;
  guests?: string | null;
  location?: string | null;
  totalAmount: number;
  notes?: string | null;
  status: string;
  createdAt: string;
  client: {
    name: string;
    phone: string;
    email?: string | null;
  };
  items: QuoteItem[];
};

// ======================================================
// HELPERS
// ======================================================

function formatMoney(value: number) {
  return new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 2,
  }).format(value);
}

function statusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "הצעה מאושרת";

    case "REJECTED":
      return "הצעה נדחתה";

    case "SENT":
      return "ממתינה לאישור";

    case "EXPIRED":
      return "ההצעה פגה";

    case "DRAFT":
      return "הצעת מחיר";

    default:
      return "הצעת מחיר";
  }
}

// ======================================================
// PAGE
// ======================================================

export default function PublicQuotePage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [responding, setResponding] = useState(false);

  const [message, setMessage] = useState("");

  const [token, setToken] = useState("");

  // ====================================================
  // LOAD
  // ====================================================

  useEffect(() => {
    async function load() {
      try {
        const resolved = await params;

        setToken(resolved.token);

        const response = await fetch(
          `/api/quotes/${resolved.token}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "הצעת המחיר לא נמצאה"
          );
        }

        setQuote(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "שגיאה בטעינת ההצעה"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  // ====================================================
  // RESPONSE
  // ====================================================

  async function respond(
    responseStatus: "APPROVED" | "REJECTED"
  ) {
    if (!quote) {
      return;
    }

    const text =
      responseStatus === "APPROVED"
        ? "האם לאשר את הצעת המחיר?"
        : "האם לדחות את הצעת המחיר?";

    const confirmed = window.confirm(text);

    if (!confirmed) {
      return;
    }

    try {
      setResponding(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/quotes/${token}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: responseStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה בעדכון ההצעה"
        );
      }

      setQuote(data);

      setMessage(
        responseStatus === "APPROVED"
          ? "✓ הצעת המחיר אושרה בהצלחה."
          : "הצעת המחיר נדחתה."
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה בעדכון ההצעה"
      );
    } finally {
      setResponding(false);
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-[#090909]
          text-white
          font-[var(--font-heebo)]
          flex
          items-center
          justify-center
          p-6
        "
      >
        <div className="text-gray-400 text-lg">
          טוען את הצעת המחיר...
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !quote) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-[#090909]
          text-white
          font-[var(--font-heebo)]
          flex
          items-center
          justify-center
          p-6
        "
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-5">
            📄
          </div>

          <h1 className="text-3xl font-black">
            הצעת המחיר לא נמצאה
          </h1>

          <p className="text-gray-500 mt-3">
            {error ||
              "ייתכן שהקישור אינו תקין או שההצעה אינה זמינה."}
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // RESPONSE STATUS
  // ====================================================

  const canRespond =
    quote.status === "SENT" ||
    quote.status === "DRAFT";

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#090909]
        text-white
        font-[var(--font-heebo)]
        pt-16
        pb-8
        px-4
        md:pt-20
        md:pb-14
      "
    >
      <div className="max-w-4xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-8">

          <img
            src="/logo.png"
            alt="Maestro Events"
            className="
              mx-auto
              max-h-24
              w-auto
              mb-6
              object-contain
            "
          />

          <div
            className="
              text-[#D4AF37]
              text-sm
              font-bold
              tracking-[0.3em]
              mb-3
            "
          >
            MAESTRO EVENTS
          </div>

          <h1
            className="
              text-3xl
              md:text-5xl
              font-black
            "
          >
            {quote.title}
          </h1>

          <p className="text-gray-500 mt-3">
            הצעה מספר{" "}
            <span className="text-gray-300 font-bold">
              {quote.quoteNumber}
            </span>
          </p>

        </div>

        {/* ==================================================
            STATUS
        ================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-[#D4AF37]/30
            bg-[#D4AF37]/5
            p-4
            text-center
            mb-6
          "
        >
          <div className="text-[#D4AF37] font-black text-lg">
            {statusLabel(quote.status)}
          </div>
        </div>

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-green-500/30
              bg-green-500/10
              text-green-400
              px-5
              py-4
              text-center
              font-bold
            "
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              text-red-400
              px-5
              py-4
              text-center
            "
          >
            {error}
          </div>
        )}

        {/* ==================================================
            CLIENT + EVENT
        ================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#111]
            p-6
            md:p-8
            mb-6
          "
        >
          <h2 className="text-xl font-black mb-5">
            פרטי הלקוח והאירוע
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Info
              label="שם"
              value={quote.client.name}
            />

            <Info
              label="טלפון"
              value={quote.client.phone}
            />

            {quote.client.email && (
              <Info
                label="אימייל"
                value={quote.client.email}
              />
            )}

            {quote.eventType && (
              <Info
                label="סוג אירוע"
                value={quote.eventType}
              />
            )}

            {quote.eventDate && (
              <Info
                label="תאריך אירוע"
                value={quote.eventDate}
              />
            )}

            {quote.guests && (
              <Info
                label="מוזמנים"
                value={quote.guests}
              />
            )}

            {quote.location && (
              <Info
                label="מיקום"
                value={quote.location}
              />
            )}

          </div>
        </section>

        {/* ==================================================
            SERVICES
        ================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#111]
            p-6
            md:p-8
            mb-6
          "
        >
          <h2 className="text-xl font-black mb-5">
            פירוט השירותים
          </h2>

          <div className="space-y-3">

            {quote.items.map((item) => (
              <div
                key={item.id}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  p-4
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-3
                  "
                >
                  <div>

                    <div className="font-black text-lg">
                      {item.serviceName}
                    </div>

                    {item.description && (
                      <div className="text-gray-500 text-sm mt-1">
                        {item.description}
                      </div>
                    )}

                    <div className="text-gray-500 text-sm mt-2">
                      כמות:{" "}
                      {item.quantity}
                      {" × "}
                      {formatMoney(
                        Number(item.unitPrice)
                      )}{" "}
                      ₪
                    </div>

                  </div>

                  <div
                    className="
                      text-[#D4AF37]
                      font-black
                      text-xl
                    "
                  >
                    {formatMoney(
                      Number(item.totalPrice)
                    )}{" "}
                    ₪
                  </div>

                </div>
              </div>
            ))}

          </div>
        </section>

        {/* ==================================================
            TOTAL
        ================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-[#D4AF37]/40
            bg-[#D4AF37]/5
            p-6
            md:p-8
            mb-6
            text-center
          "
        >
          <div className="text-gray-400 mb-2">
            סה״כ הצעת המחיר
          </div>

          <div
            className="
              text-4xl
              md:text-5xl
              font-black
              text-[#D4AF37]
            "
          >
            {formatMoney(
              Number(quote.totalAmount)
            )}{" "}
            ₪
          </div>
        </section>

        {/* ==================================================
            NOTES
        ================================================== */}

        {quote.notes && (
          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#111]
              p-6
              md:p-8
              mb-6
            "
          >
            <h2 className="text-xl font-black mb-4">
              הערות ותנאים
            </h2>

            <div
              className="
                text-gray-300
                whitespace-pre-wrap
                leading-8
              "
            >
              {quote.notes}
            </div>
          </section>
        )}

        {/* ==================================================
            ACTIONS
        ================================================== */}

        {canRespond && (
          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#111]
              p-6
              md:p-8
              mb-6
            "
          >
            <h2 className="text-xl font-black text-center">
              החלטה לגבי ההצעה
            </h2>

            <p
              className="
                text-gray-500
                text-center
                mt-2
                mb-6
              "
            >
              לאחר אישור ההצעה נוכל להמשיך לשלב הבא בתהליך.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* APPROVE */}

              <button
                type="button"
                disabled={responding}
                onClick={() =>
                  respond("APPROVED")
                }
                className="
                  bg-[#D4AF37]
                  text-black
                  font-black
                  py-4
                  rounded-xl
                  hover:bg-[#e5c451]
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {responding
                  ? "מעדכן..."
                  : "✓ אישור הצעת המחיר"}
              </button>

              {/* REJECT */}

              <button
                type="button"
                disabled={responding}
                onClick={() =>
                  respond("REJECTED")
                }
                className="
                  border
                  border-red-500/40
                  text-red-400
                  font-bold
                  py-4
                  rounded-xl
                  hover:bg-red-500/10
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                דחיית ההצעה
              </button>

            </div>
          </section>
        )}

        {/* ==================================================
            PDF
        ================================================== */}

        <div className="text-center mb-8">

          <a
            href={`/api/quotes/pdf?token=${encodeURIComponent(
              token
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              justify-center
              border
              border-[#D4AF37]
              text-[#D4AF37]
              font-black
              px-6
              py-3
              rounded-xl
              hover:bg-[#D4AF37]
              hover:text-black
              transition
            "
          >
            📄 הצג / הורד PDF
          </a>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          className="
            text-center
            text-gray-600
            text-sm
          "
        >
          Maestro Events
        </div>

      </div>
    </main>
  );
}

// ======================================================
// INFO COMPONENT
// ======================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-xl
        bg-white/5
        border
        border-white/5
        p-4
      "
    >
      <div className="text-gray-500 text-sm mb-1">
        {label}
      </div>

      <div className="font-bold">
        {value}
      </div>
    </div>
  );
}