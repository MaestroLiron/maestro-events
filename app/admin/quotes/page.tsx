"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

// ======================================================
// TYPES
// ======================================================

type Client = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guests?: string | null;
  location?: string | null;
};

type Service = {
  id: number;
  title: string;
  description?: string | null;
};

type QuoteItem = {
  id?: number;
  serviceId?: number | null;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sortOrder?: number;
};

type Quote = {
  id: number;
  quoteNumber: string;
  clientId: number;
  title: string;
  eventType?: string | null;
  eventDate?: string | null;
  guests?: string | null;
  location?: string | null;
  totalAmount: number;
  notes?: string | null;
  status: string;
  publicToken?: string | null;
  sentAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  client: Client;
  items: QuoteItem[];
};

type QuoteFormItem = {
  serviceId?: number | null;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

// ======================================================
// HELPERS
// ======================================================

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

function statusLabel(
  status: string
) {
  switch (status) {
    case "DRAFT":
      return "טיוטה";

    case "SENT":
      return "נשלחה";

    case "APPROVED":
      return "אושרה";

    case "REJECTED":
      return "נדחתה";

    case "EXPIRED":
      return "פג תוקף";

    default:
      return status;
  }
}

function statusClass(
  status: string
) {
  switch (status) {
    case "APPROVED":
      return "bg-green-500/10 text-green-400 border-green-500/30";

    case "REJECTED":
      return "bg-red-500/10 text-red-400 border-red-500/30";

    case "SENT":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";

    case "EXPIRED":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";

    default:
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  }
}

// ======================================================
// PAGE
// ======================================================

export default function AdminQuotesPage() {
  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingQuoteId, setEditingQuoteId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("ALL");

  // ====================================================
  // FORM
  // ====================================================

  const [clientId, setClientId] =
    useState("");

  const [title, setTitle] =
    useState("הצעת מחיר");

  const [eventType, setEventType] =
    useState("");

  const [eventDate, setEventDate] =
    useState("");

  const [guests, setGuests] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState<QuoteFormItem[]>([]);

  // ====================================================
  // LOAD
  // ====================================================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        quotesResponse,
        clientsResponse,
        servicesResponse,
      ] = await Promise.all([
        fetch(
          "/api/admin/quotes",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/testimonials/clients",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/services",
          {
            cache: "no-store",
          }
        ),
      ]);

      const quotesData =
        await quotesResponse.json();

      const clientsData =
        await clientsResponse.json();

      const servicesData =
        await servicesResponse.json();

      if (!quotesResponse.ok) {
        throw new Error(
          quotesData?.error ||
            "שגיאה בטעינת הצעות המחיר"
        );
      }

      if (!clientsResponse.ok) {
        throw new Error(
          "שגיאה בטעינת הלקוחות"
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          "שגיאה בטעינת השירותים"
        );
      }

      setQuotes(
        Array.isArray(quotesData)
          ? quotesData
          : []
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : []
      );

      setServices(
        Array.isArray(servicesData)
          ? servicesData
          : []
      );
    } catch (error) {
      console.error(
        "LOAD QUOTES DATA ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה בטעינת הנתונים"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ====================================================
  // RESET FORM
  // ====================================================

  function resetForm() {
    setClientId("");
    setTitle("הצעת מחיר");
    setEventType("");
    setEventDate("");
    setGuests("");
    setLocation("");
    setNotes("");
    setItems([]);
    setEditingQuoteId(null);
  }

  // ====================================================
  // NEW QUOTE
  // ====================================================

  function openNewQuote() {
    resetForm();
    setSuccess("");
    setError("");
    setShowForm(true);
  }

  // ====================================================
  // EDIT QUOTE
  // ====================================================

  function editQuote(
    quote: Quote
  ) {
    setEditingQuoteId(quote.id);

    setClientId(
      String(quote.clientId)
    );

    setTitle(
      quote.title ||
        "הצעת מחיר"
    );

    setEventType(
      quote.eventType || ""
    );

    setEventDate(
      quote.eventDate || ""
    );

    setGuests(
      quote.guests || ""
    );

    setLocation(
      quote.location || ""
    );

    setNotes(
      quote.notes || ""
    );

    setItems(
      quote.items.map(
        (item) => ({
          serviceId:
            item.serviceId || null,

          serviceName:
            item.serviceName,

          description:
            item.description || "",

          quantity:
            item.quantity || 1,

          unitPrice:
            Number(
              item.unitPrice
            ) || 0,
        })
      )
    );

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ====================================================
  // ADD SERVICE
  // ====================================================

  function addService(
    service: Service
  ) {
    setItems(
      (previous) => [
        ...previous,
        {
          serviceId:
            service.id,

          serviceName:
            service.title,

          description:
            service.description ||
            "",

          quantity: 1,

          unitPrice: 0,
        },
      ]
    );
  }

  // ====================================================
  // ADD CUSTOM ITEM
  // ====================================================

  function addCustomItem() {
    setItems(
      (previous) => [
        ...previous,
        {
          serviceId: null,
          serviceName: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]
    );
  }

  // ====================================================
  // UPDATE ITEM
  // ====================================================

  function updateItem(
    index: number,
    field: keyof QuoteFormItem,
    value: string | number
  ) {
    setItems(
      (previous) =>
        previous.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  }

  // ====================================================
  // REMOVE ITEM
  // ====================================================

  function removeItem(
    index: number
  ) {
    setItems(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  }

  // ====================================================
  // TOTAL
  // ====================================================

  const totalAmount =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) =>
          total +
          Math.max(
            0,
            Number(
              item.quantity
            ) || 0
          ) *
            Math.max(
              0,
              Number(
                item.unitPrice
              ) || 0
            ),
        0
      );
    }, [items]);

  // ====================================================
  // SAVE
  // ====================================================

  async function saveQuote(
    sendAfterSave = false
  ) {
    setError("");
    setSuccess("");

    if (!clientId) {
      setError(
        "יש לבחור לקוח."
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "יש להוסיף לפחות שירות אחד."
      );
      return;
    }

    const invalidItem =
      items.find(
        (item) =>
          !item.serviceName.trim()
      );

    if (invalidItem) {
      setError(
        "יש למלא שם לכל השירותים בהצעה."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        clientId:
          Number(clientId),

        title,

        eventType,

        eventDate,

        guests,

        location,

        notes,

        status:
          sendAfterSave
            ? "SENT"
            : "DRAFT",

        items: items.map(
          (item) => ({
            serviceId:
              item.serviceId,

            serviceName:
              item.serviceName,

            description:
              item.description,

            quantity:
              Number(
                item.quantity
              ) || 1,

            unitPrice:
              Number(
                item.unitPrice
              ) || 0,
          })
        ),
      };

      const url =
        editingQuoteId
          ? `/api/admin/quotes/${editingQuoteId}`
          : "/api/admin/quotes";

      const response =
        await fetch(url, {
          method:
            editingQuoteId
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בשמירת ההצעה"
        );
      }

      setSuccess(
        sendAfterSave
          ? "✓ הצעת המחיר נשמרה ונשלחה."
          : "✓ הצעת המחיר נשמרה כטיוטה."
      );

      await loadData();

      if (sendAfterSave) {
        const token =
          data?.publicToken;

        const phone =
          data?.client?.phone;

        if (
          token &&
          phone
        ) {
          const cleanPhone =
            String(phone)
              .replace(
                /[^0-9+]/g,
                ""
              )
              .replace(
                /^\+/,
                ""
              )
              .replace(
                /^0/,
                "972"
              );

          const publicUrl =
            `${window.location.origin}/quote/${token}`;

          const message =
            `שלום ${data.client.name},\n\n` +
            `מצורפת הצעת המחיר שלך מ-Maestro Events.\n\n` +
            `מספר הצעה: ${data.quoteNumber}\n` +
            `סה"כ: ${formatMoney(
              Number(
                data.totalAmount
              )
            )} ₪\n\n` +
            `לצפייה בהצעה:\n${publicUrl}`;

          const whatsappUrl =
            `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              message
            )}`;

          window.open(
            whatsappUrl,
            "_blank"
          );
        }
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error(
        "SAVE QUOTE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה בשמירת ההצעה"
      );
    } finally {
      setSaving(false);
    }
  }

  // ====================================================
  // DELETE
  // ====================================================

  async function deleteQuote(
    quote: Quote
  ) {
    const confirmed =
      window.confirm(
        `האם למחוק את הצעת המחיר ${quote.quoteNumber}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/quotes/${quote.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה במחיקת ההצעה"
        );
      }

      setSuccess(
        "✓ הצעת המחיר נמחקה."
      );

      await loadData();
    } catch (error) {
      console.error(
        "DELETE QUOTE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה במחיקת ההצעה"
      );
    }
  }

  // ====================================================
  // FILTER
  // ====================================================

  const filteredQuotes =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return quotes.filter(
        (quote) => {
          const matchesSearch =
            !query ||
            quote.quoteNumber
              .toLowerCase()
              .includes(query) ||
            quote.client?.name
              ?.toLowerCase()
              .includes(query) ||
            quote.client?.phone
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            filterStatus ===
              "ALL" ||
            quote.status ===
              filterStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      quotes,
      search,
      filterStatus,
    ]);

  // ====================================================
  // STATS
  // ====================================================

  const stats =
    useMemo(() => {
      return {
        total:
          quotes.length,

        drafts:
          quotes.filter(
            (q) =>
              q.status ===
              "DRAFT"
          ).length,

        sent:
          quotes.filter(
            (q) =>
              q.status ===
              "SENT"
          ).length,

        approved:
          quotes.filter(
            (q) =>
              q.status ===
              "APPROVED"
          ).length,

        value:
          quotes
            .filter(
              (q) =>
                q.status ===
                "APPROVED"
            )
            .reduce(
              (
                sum,
                q
              ) =>
                sum +
                Number(
                  q.totalAmount ||
                    0
                ),
              0
            ),
      };
    }, [quotes]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#090909]
        text-white
        p-5
        md:p-10
        pt-24
        md:pt-28
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-5
            mb-8
          "
        >
          <div>
            <p className="text-[#D4AF37] text-sm tracking-[0.3em] mb-2">
              MAESTRO EVENTS
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              הצעות מחיר
            </h1>

            <p className="text-gray-500 mt-2">
              יצירה, ניהול ושליחה של הצעות מחיר ללקוחות.
            </p>
          </div>

          <div className="flex gap-3">

            <Link
              href="/admin"
              className="
                border
                border-white/10
                px-5
                py-3
                rounded-xl
                hover:border-[#D4AF37]
                transition
              "
            >
              ← לדאשבורד
            </Link>

            <button
              type="button"
              onClick={openNewQuote}
              className="
                bg-[#D4AF37]
                text-black
                font-black
                px-6
                py-3
                rounded-xl
                hover:bg-[#e5c451]
                transition
              "
            >
              + הצעת מחיר חדשה
            </button>

          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 px-5 py-4">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 px-5 py-4">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <StatCard
            title="סה״כ הצעות"
            value={stats.total}
            icon="📄"
          />

          <StatCard
            title="טיוטות"
            value={stats.drafts}
            icon="📝"
          />

          <StatCard
            title="נשלחו"
            value={stats.sent}
            icon="📤"
          />

          <StatCard
            title="אושרו"
            value={stats.approved}
            icon="✅"
          />

          <StatCard
            title="ערך שאושר"
            value={`${formatMoney(
              stats.value
            )} ₪`}
            icon="💰"
          />

        </div>

        {/* FORM */}

        {showForm && (
          <div className="mb-10 rounded-3xl border border-[#D4AF37]/30 bg-[#111] p-5 md:p-8">

            <div className="flex items-center justify-between gap-4 mb-8">

              <div>
                <p className="text-[#D4AF37] font-bold text-sm">
                  {editingQuoteId
                    ? "עריכת הצעה"
                    : "הצעה חדשה"}
                </p>

                <h2 className="text-2xl md:text-3xl font-black mt-1">
                  {editingQuoteId
                    ? "עריכת הצעת מחיר"
                    : "יצירת הצעת מחיר"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>

            {/* BASIC INFO */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field label="לקוח *">
                <select
                  value={clientId}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setClientId(value);

                    const client =
                      clients.find(
                        (item) =>
                          String(
                            item.id
                          ) === value
                      );

                    if (client) {
                      setEventType(
                        client.eventType ||
                          ""
                      );

                      setEventDate(
                        client.eventDate ||
                          ""
                      );

                      setGuests(
                        client.guests ||
                          ""
                      );

                      setLocation(
                        client.location ||
                          ""
                      );
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">
                    בחר לקוח
                  </option>

                  {clients.map(
                    (client) => (
                      <option
                        key={
                          client.id
                        }
                        value={
                          client.id
                        }
                      >
                        {client.name}
                        {" — "}
                        {client.phone}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="כותרת">
                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="הצעת מחיר"
                />
              </Field>

              <Field label="סוג אירוע">
                <input
                  value={eventType}
                  onChange={(e) =>
                    setEventType(
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="חתונה / בר מצווה / אירוע חברה..."
                />
              </Field>

              <Field label="תאריך אירוע">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="מספר מוזמנים">
                <input
                  value={guests}
                  onChange={(e) =>
                    setGuests(
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="150"
                />
              </Field>

              <Field label="מיקום">
                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="אולם / גן אירועים / כתובת"
                />
              </Field>

            </div>

            {/* SERVICES */}

            <div className="mt-10">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                <div>
                  <h3 className="text-xl font-black">
                    שירותים בהצעה
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    המחיר כאן נשמר בתוך ההצעה ולא משתנה אם מחיר השירות ישתנה בעתיד.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">

                  {services.map(
                    (service) => (
                      <button
                        key={
                          service.id
                        }
                        type="button"
                        onClick={() =>
                          addService(
                            service
                          )
                        }
                        className="
                          border
                          border-[#D4AF37]/40
                          text-[#D4AF37]
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition
                          text-sm
                        "
                      >
                        +{" "}
                        {
                          service.title
                        }
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={
                      addCustomItem
                    }
                    className="
                      border
                      border-white/20
                      text-gray-300
                      px-4
                      py-2
                      rounded-xl
                      hover:border-white
                      transition
                      text-sm
                    "
                  >
                    + שירות ידני
                  </button>

                </div>

              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center text-gray-500">
                  עדיין לא נוספו שירותים להצעה.
                </div>
              ) : (
                <div className="space-y-4">

                  {items.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={index}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/30
                          p-4
                        "
                      >

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                          <div className="md:col-span-3">
                            <label className="block text-sm text-gray-400 mb-2">
                              שם השירות
                            </label>

                            <input
                              value={
                                item.serviceName
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  index,
                                  "serviceName",
                                  e.target
                                    .value
                                )
                              }
                              className={inputClass}
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-sm text-gray-400 mb-2">
                              תיאור
                            </label>

                            <input
                              value={
                                item.description
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  index,
                                  "description",
                                  e.target
                                    .value
                                )
                              }
                              className={inputClass}
                              placeholder="מה כולל השירות"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-2">
                              כמות
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(
                                    e.target
                                      .value
                                  )
                                )
                              }
                              className={inputClass}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-2">
                              מחיר יחידה
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                item.unitPrice
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  Number(
                                    e.target
                                      .value
                                  )
                                )
                              }
                              className={inputClass}
                              placeholder="0"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm text-gray-400 mb-2">
                              סה״כ
                            </label>

                            <div className="h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center font-black text-[#D4AF37]">
                              {formatMoney(
                                (
                                  Number(
                                    item.quantity
                                  ) || 0
                                ) *
                                  (
                                    Number(
                                      item.unitPrice
                                    ) || 0
                                  )
                              )}
                              ₪
                            </div>
                          </div>

                          <div className="md:col-span-1">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  index
                                )
                              }
                              className="
                                w-full
                                h-12
                                rounded-xl
                                border
                                border-red-500/30
                                text-red-400
                                hover:bg-red-500/10
                              "
                            >
                              🗑
                            </button>
                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* NOTES + TOTAL */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

              <div className="md:col-span-2">

                <label className="block text-sm text-gray-400 mb-2">
                  הערות ותנאים להצעה
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="הערות מיוחדות, תנאי תשלום, תנאים נוספים..."
                />

              </div>

              <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 flex flex-col justify-between">

                <div>
                  <p className="text-gray-400">
                    סה״כ הצעת המחיר
                  </p>

                  <div className="text-4xl font-black text-[#D4AF37] mt-2">
                    {formatMoney(
                      totalAmount
                    )}{" "}
                    ₪
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-6">
                  המחיר כולל את כל השירותים שהוספת להצעה.
                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col md:flex-row gap-3 mt-8">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveQuote(false)
                }
                className="
                  flex-1
                  border
                  border-[#D4AF37]
                  text-[#D4AF37]
                  font-black
                  py-4
                  rounded-xl
                  hover:bg-[#D4AF37]
                  hover:text-black
                  transition
                  disabled:opacity-50
                "
              >
                {saving
                  ? "שומר..."
                  : "💾 שמור כטיוטה"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveQuote(true)
                }
                className="
                  flex-1
                  bg-[#D4AF37]
                  text-black
                  font-black
                  py-4
                  rounded-xl
                  hover:bg-[#e5c451]
                  transition
                  disabled:opacity-50
                "
              >
                {saving
                  ? "שומר..."
                  : "📤 שמור ושלח ב-WhatsApp"}
              </button>

            </div>

          </div>
        )}

        {/* SEARCH */}

        <div className="rounded-2xl border border-white/10 bg-[#111] p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="🔎 חיפוש לפי לקוח / טלפון / מספר הצעה"
            />

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="ALL">
                כל הסטטוסים
              </option>

              <option value="DRAFT">
                טיוטות
              </option>

              <option value="SENT">
                נשלחו
              </option>

              <option value="APPROVED">
                אושרו
              </option>

              <option value="REJECTED">
                נדחו
              </option>

              <option value="EXPIRED">
                פגי תוקף
              </option>
            </select>

            <button
              type="button"
              onClick={loadData}
              className="
                border
                border-white/10
                rounded-xl
                hover:border-[#D4AF37]
                transition
              "
            >
              🔄 רענן
            </button>

          </div>

        </div>

        {/* LIST */}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center text-gray-400">
            טוען הצעות מחיר...
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">

            <div className="text-5xl mb-4">
              📄
            </div>

            <h2 className="text-2xl font-black">
              אין הצעות מחיר
            </h2>

            <p className="text-gray-500 mt-2">
              צור את הצעת המחיר הראשונה שלך.
            </p>

            <button
              type="button"
              onClick={openNewQuote}
              className="
                mt-6
                bg-[#D4AF37]
                text-black
                font-black
                px-6
                py-3
                rounded-xl
              "
            >
              + צור הצעה
            </button>

          </div>
        ) : (
          <div className="space-y-4">

            {filteredQuotes.map(
              (quote) => (
                <div
                  key={quote.id}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#111]
                    p-5
                    md:p-6
                    hover:border-[#D4AF37]/30
                    transition
                  "
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3 mb-2">

                        <span className="text-[#D4AF37] font-black">
                          {quote.quoteNumber}
                        </span>

                        <span
                          className={`
                            border
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-bold
                            ${statusClass(
                              quote.status
                            )}
                          `}
                        >
                          {statusLabel(
                            quote.status
                          )}
                        </span>

                      </div>

                      <h3 className="text-xl font-black">
                        {quote.client?.name}
                      </h3>

                      <div className="text-gray-500 text-sm mt-1">
                        {quote.eventType ||
                          "אירוע"}
                        {quote.eventDate
                          ? ` • ${quote.eventDate}`
                          : ""}
                        {quote.location
                          ? ` • ${quote.location}`
                          : ""}
                      </div>

                    </div>

                    <div className="text-right lg:text-center">

                      <div className="text-gray-500 text-sm">
                        סכום
                      </div>

                      <div className="text-2xl font-black text-[#D4AF37]">
                        {formatMoney(
                          Number(
                            quote.totalAmount ||
                              0
                          )
                        )}{" "}
                        ₪
                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      {quote.publicToken && (
                        <Link
                          href={`/quote/${quote.publicToken}`}
                          target="_blank"
                          className="
                            border
                            border-white/10
                            px-4
                            py-2
                            rounded-xl
                            hover:border-[#D4AF37]
                            transition
                            text-sm
                          "
                        >
                          👁 הצג
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          editQuote(
                            quote
                          )
                        }
                        className="
                          border
                          border-[#D4AF37]/40
                          text-[#D4AF37]
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition
                          text-sm
                        "
                      >
                        ✏️ ערוך
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteQuote(
                            quote
                          )
                        }
                        className="
                          border
                          border-red-500/30
                          text-red-400
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-red-500/10
                          transition
                          text-sm
                        "
                      >
                        🗑 מחק
                      </button>

                    </div>

                  </div>

                  {quote.items?.length >
                    0 && (
                    <div className="mt-5 pt-5 border-t border-white/10">

                      <div className="flex flex-wrap gap-2">

                        {quote.items.map(
                          (item) => (
                            <span
                              key={
                                item.id
                              }
                              className="
                                bg-white/5
                                border
                                border-white/10
                                rounded-lg
                                px-3
                                py-1
                                text-sm
                                text-gray-300
                              "
                            >
                              {
                                item.serviceName
                              }
                              {" × "}
                              {
                                item.quantity
                              }
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}

// ======================================================
// COMPONENTS
// ======================================================

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">

      <div className="text-2xl mb-3">
        {icon}
      </div>

      <div className="text-gray-500 text-sm">
        {title}
      </div>

      <div className="text-xl md:text-2xl font-black mt-1">
        {value}
      </div>

    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

const inputClass = `
  w-full
  h-12
  rounded-xl
  border
  border-white/10
  bg-black/30
  px-4
  text-white
  outline-none
  focus:border-[#D4AF37]
  transition
`;