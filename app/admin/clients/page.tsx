"use client";

import { useEffect, useState } from "react";

type ClientService = {
  id?: number;
  serviceName: string;
  amount: number;
};

type Client = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  eventType: string | null;
  eventDate: string | null;
  guests: string | null;
  location: string | null;
  status: string;
  addedToCalendar: boolean;
  totalAmount: number | null;
  paidAmount: number | null;
  notes: string | null;
  additionalInfo: string | null;
  alcoholList: string | null;
  services?: ClientService[];
  createdAt?: string;
  updatedAt?: string;
};

const API_URL = "/api/testimonials/clients";
const CALENDAR_API_URL = "/api/calendar-events";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  guests: "",
  location: "",
  status: "ליד",
  totalAmount: "",
  paidAmount: "",
  notes: "",
  additionalInfo: "",
  alcoholList: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [addingToCalendarId, setAddingToCalendarId] =
    useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  // ==========================================
  // שירותים שהלקוח מקבל
  // ==========================================

  const [services, setServices] = useState<ClientService[]>([]);

  const [customServiceNames, setCustomServiceNames] = useState<string[]>([]);

  const availableServices = [
    "צילום מגנטים",
    "בר אקטיבי",
    "עמדת תדלוק",
    "בלוקים",
    "צילום סטילס",
    "צילום וידאו",
    "קיר זכוכית",
    "זיקוקים קרים לחופה",
    "חבילת סלואו",
    "עשן כבד",
    "בועות סבון",
    "קונפטי",
    "בלוני הליום",
    "קיאק פירות",
    "תותחי עשן",
    "DJ",
    "אחר",
  ];

  const addService = () => {
    setServices((prev) => [
      ...prev,
      {
        serviceName: "",
        amount: 0,
      },
    ]);
  };

  const updateService = (
    index: number,
    field: "serviceName" | "amount",
    value: string
  ) => {
    setServices((prev) =>
      prev.map((service, i) => {
        if (i !== index) return service;

        if (field === "amount") {
          return {
            ...service,
            amount: Number(value) || 0,
          };
        }

        return {
          ...service,
          serviceName: value,
        };
      })
    );
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const servicesTotal = services.reduce(
    (sum, service) => sum + Number(service.amount || 0),
    0
  );

  // ==========================================
  // טעינת לקוחות
  // ==========================================

  const loadClients = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בטעינת הלקוחות");
      }

      setClients(data);
    } catch (error) {
      console.error("שגיאה בטעינת הלקוחות:", error);

      alert("לא ניתן לטעון את הלקוחות מבסיס הנתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ==========================================
  // שינוי טופס
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // פתיחת לקוח חדש
  // ==========================================

  const openNewClientForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setServices([]);
    setShowForm(true);
  };

  // ==========================================
  // עריכת לקוח
  // ==========================================

  const startEdit = (client: Client) => {
    setEditingId(client.id);

    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      eventType: client.eventType || "",
      eventDate: client.eventDate || "",
      guests: client.guests || "",
      location: client.location || "",
      status: client.status || "ליד",

      totalAmount:
        client.totalAmount !== null &&
        client.totalAmount !== undefined
          ? String(client.totalAmount)
          : "",

      paidAmount:
        client.paidAmount !== null &&
        client.paidAmount !== undefined
          ? String(client.paidAmount)
          : "",

      notes: client.notes || "",

      additionalInfo: client.additionalInfo || "",

      alcoholList: client.alcoholList || "",
    });

    setServices(
      Array.isArray(client.services)
        ? client.services.map((service) => ({
            id: service.id,
            serviceName: service.serviceName || "",
            amount: Number(service.amount) || 0,
          }))
        : []
    );

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ביטול טופס
  // ==========================================

  const cancelForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setServices([]);
    setShowForm(false);
  };

  // ==========================================
  // שמירת לקוח / עריכה
  // ==========================================

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      alert("יש למלא שם וטלפון");
      return;
    }

    const validServices = services
      .map((service, index) => {
        if (
          service.serviceName === "אחר" ||
          service.serviceName === "אחר..."
        ) {
          const customName = customServiceNames[index]?.trim();

          return {
            ...service,
            serviceName: customName || service.serviceName,
          };
        }

        return service;
      })
      .filter((service) => service.serviceName.trim() !== "");

    const calculatedTotal =
      validServices.length > 0
        ? servicesTotal
        : Number(form.totalAmount || 0);

    try {
      setSaving(true);

      // ========================================
      // עריכה
      // ========================================

      if (editingId !== null) {
        const response = await fetch(API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingId,
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            eventType: form.eventType,
            eventDate: form.eventDate,
            guests: form.guests,
            location: form.location.trim(),
            status: form.status,

            totalAmount:
              validServices.length > 0
                ? calculatedTotal
                : form.totalAmount,

            paidAmount: form.paidAmount,

            notes: form.notes,

            additionalInfo: form.additionalInfo,

            alcoholList: form.alcoholList,

            services: validServices,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "שגיאה בעדכון הלקוח");
        }

        setClients((prev) =>
          prev.map((client) =>
            client.id === editingId ? data : client
          )
        );

        alert("הלקוח עודכן בהצלחה");
      } else {
        // ========================================
        // לקוח חדש
        // ========================================

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            eventType: form.eventType,
            eventDate: form.eventDate,
            guests: form.guests,
            location: form.location.trim(),
            status: form.status,

            totalAmount:
              validServices.length > 0
                ? calculatedTotal
                : form.totalAmount,

            paidAmount: form.paidAmount,

            notes: form.notes,

            additionalInfo: form.additionalInfo,

            alcoholList: form.alcoholList,

            services: validServices,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "שגיאה בשמירת הלקוח");
        }

        setClients((prev) => [data, ...prev]);
      }

      setForm(emptyForm);
      setServices([]);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("שגיאה בשמירת הלקוח:", error);

      alert(
        error instanceof Error
          ? error.message
          : "אירעה שגיאה בשמירת הלקוח"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // הוספת לקוח ליומן
  // ==========================================

  const addToCalendar = async (client: Client) => {
    if (client.addedToCalendar) {
      return;
    }

    if (!client.eventDate) {
      alert(
        "ללקוח הזה אין תאריך אירוע. יש לערוך את הלקוח ולהוסיף תאריך."
      );
      return;
    }

    const confirmed = confirm(
      `להוסיף את האירוע של "${client.name}" ליומן?`
    );

    if (!confirmed) return;

    try {
      setAddingToCalendarId(client.id);

      const response = await fetch(CALENDAR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          title: `${client.eventType || "אירוע"} - ${client.name}`,
          eventType: client.eventType,
          eventDate: client.eventDate,
          location: client.location,
          guests: client.guests,
          phone: client.phone,
          notes: client.email
            ? `אימייל: ${client.email}`
            : null,
          status: "מתוכנן",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "שגיאה בהוספת האירוע ליומן"
        );
      }

      setClients((prev) =>
        prev.map((item) =>
          item.id === client.id
            ? {
                ...item,
                addedToCalendar: true,
              }
            : item
        )
      );

      alert("האירוע נוסף ליומן בהצלחה ✅");
    } catch (error) {
      console.error("שגיאה בהוספה ליומן:", error);

      alert(
        error instanceof Error
          ? error.message
          : "אירעה שגיאה בהוספת האירוע ליומן"
      );
    } finally {
      setAddingToCalendarId(null);
    }
  };

  // ==========================================
  // מחיקת לקוח
  // ==========================================

  const deleteClient = async (id: number) => {
    const client = clients.find((item) => item.id === id);

    if (!client) return;

    const confirmed = confirm(
      `האם אתה בטוח שברצונך למחוק את הלקוח "${client.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה במחיקת הלקוח");
      }

      setClients((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("שגיאה במחיקת הלקוח:", error);

      alert("אירעה שגיאה במחיקת הלקוח");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // מחיקת כל הלקוחות
  // ==========================================

  const clearAllClients = async () => {
    if (clients.length === 0) return;

    const confirmed = confirm(
      "האם אתה בטוח שברצונך למחוק את כל הלקוחות?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await Promise.all(
        clients.map(async (client) => {
          const response = await fetch(API_URL, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: client.id,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `שגיאה במחיקת לקוח ${client.id}`
            );
          }
        })
      );

      setClients([]);
    } catch (error) {
      console.error(
        "שגיאה במחיקת כל הלקוחות:",
        error
      );

      alert("אירעה שגיאה במחיקת הלקוחות");

      await loadClients();
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // חיפוש
  // ==========================================

  const filteredClients = clients.filter((client) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      client.name?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.eventType?.toLowerCase().includes(query) ||
      client.location?.toLowerCase().includes(query) ||
      client.status?.toLowerCase().includes(query) ||
      client.eventDate?.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // תצוגה
  // ==========================================

  return (
    <main
      className="
        min-h-screen
        bg-[#090909]
        text-white
        p-6
        md:p-10
        pt-24
        md:pt-28
      "
      dir="rtl"
    >
      {/* ==========================================
          כותרת
      ========================================== */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-5
          mb-10
        "
      >
        <div>
          <p
            className="
              text-[#D4AF37]
              tracking-[0.35em]
              text-sm
              mb-3
            "
          >
            MAESTRO EVENTS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            ניהול לקוחות
          </h1>

          <p className="text-gray-400 mt-3">
            ניהול לקוחות, פרטי אירוע והיסטוריית הזמנות.
          </p>
        </div>

        <button
          onClick={openNewClientForm}
          className="
            bg-[#D4AF37]
            text-black
            font-semibold
            px-7
            py-3
            rounded-xl
            hover:bg-[#c89d24]
            hover:scale-105
            transition
          "
        >
          + לקוח חדש
        </button>
      </div>

      {/* ==========================================
          טופס
      ========================================== */}

      {showForm && (
        <div
          className="
            bg-[#111]
            border
            border-[#D4AF37]
            rounded-2xl
            p-6
            md:p-8
            mb-10
            shadow-[0_0_30px_rgba(212,175,55,0.08)]
          "
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingId !== null
                ? "עריכת לקוח"
                : "הוספת לקוח חדש"}
            </h2>

            <button
              type="button"
              onClick={cancelForm}
              className="
                text-gray-400
                hover:text-white
                text-2xl
              "
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={saveClient}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            "
          >
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="שם מלא *"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="טלפון *"
              type="tel"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="אימייל"
              type="email"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <select
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            >
              <option value="">סוג אירוע</option>
              <option value="חתונה">חתונה</option>
              <option value="בר מצווה">בר מצווה</option>
              <option value="בת מצווה">בת מצווה</option>
              <option value="חינה">חינה</option>
              <option value="אירוע עסקי">
                אירוע עסקי
              </option>
              <option value="יום הולדת">
                יום הולדת
              </option>
              <option value="ברית">ברית</option>
              <option value="אחר">אחר</option>
            </select>

            <input
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              type="date"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <input
              name="guests"
              value={form.guests}
              onChange={handleChange}
              placeholder="מספר מוזמנים"
              type="number"
              min="0"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="מקום האירוע"
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                focus:border-[#D4AF37]
              "
            >
              <option value="ליד">ליד</option>
              <option value="בתהליך">בתהליך</option>
              <option value="סגור">סגור</option>
              <option value="בוטל">בוטל</option>
            </select>

            {/* ==========================================
                שירותים ללקוח
            ========================================== */}

            <div className="md:col-span-2 mt-5">
              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-3
                  mb-4
                "
              >
                <div>
                  <h3 className="text-xl font-bold text-[#D4AF37]">
                    🛠️ שירותים ללקוח
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    הוסף את השירותים שהלקוח הזמין ואת הסכום עבור כל שירות.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addService}
                  className="
                    border
                    border-[#D4AF37]
                    text-[#D4AF37]
                    px-5
                    py-2
                    rounded-xl
                    hover:bg-[#D4AF37]
                    hover:text-black
                    transition
                    font-semibold
                  "
                >
                  + הוסף שירות
                </button>
              </div>

              {services.length === 0 ? (
                <div
                  className="
                    bg-[#181818]
                    border
                    border-dashed
                    border-[#333]
                    rounded-xl
                    p-6
                    text-center
                    text-gray-500
                  "
                >
                  עדיין לא נוספו שירותים ללקוח
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div
                      key={service.id ?? `new-${index}`}
                      className="
                        bg-[#181818]
                        border
                        border-[#333]
                        rounded-xl
                        p-4
                        flex
                        flex-col
                        md:flex-row
                        gap-3
                        md:items-center
                      "
                    >
                      <div className="flex-1">
                        <label className="text-gray-500 text-sm block mb-2">
                          שם השירות
                        </label>

                        <select
                          value={service.serviceName}
                          onChange={(e) =>
                            updateService(
                              index,
                              "serviceName",
                              e.target.value
                            )
                          }
                          className="
                            w-full
                            bg-[#111]
                            border
                            border-[#333]
                            rounded-xl
                            p-3
                            outline-none
                            focus:border-[#D4AF37]
                          "
                        >
                          <option value="">בחר שירות...</option>

                          {availableServices.map((serviceName) => (
                            <option
                              key={serviceName}
                              value={serviceName}
                            >
                              {serviceName}
                            </option>
                          ))}
                        </select>

                        {service.serviceName === "אחר" && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={
                                customServiceNames[index] || ""
                              }
                              onChange={(e) => {
                                const newNames = [
                                  ...customServiceNames,
                                ];

                                newNames[index] = e.target.value;

                                setCustomServiceNames(newNames);
                              }}
                              placeholder="הקלד שם שירות"
                              className="
                                w-full
                                bg-[#111]
                                border
                                border-[#333]
                                rounded-xl
                                p-3
                                outline-none
                                focus:border-[#D4AF37]
                              "
                            />
                          </div>
                        )}
                      </div>

                      <div className="md:w-48">
                        <label className="text-gray-500 text-sm block mb-2">
                          סכום
                        </label>

                        <div className="relative">
                          <span
                            className="
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              text-[#D4AF37]
                            "
                          >
                            ₪
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={service.amount}
                            onChange={(e) =>
                              updateService(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            className="
                              w-full
                              bg-[#111]
                              border
                              border-[#333]
                              rounded-xl
                              p-3
                              pr-9
                              outline-none
                              focus:border-[#D4AF37]
                            "
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="
                          md:mt-7
                          border
                          border-red-900
                          text-red-400
                          px-4
                          py-3
                          rounded-xl
                          hover:bg-red-900/20
                          transition
                        "
                      >
                        🗑️
                      </button>
                    </div>
                  ))}

                  {/* סיכום שירותים */}

                  <div
                    className="
                      bg-[#D4AF37]/10
                      border
                      border-[#D4AF37]/30
                      rounded-xl
                      p-5
                      flex
                      flex-col
                      md:flex-row
                      md:items-center
                      md:justify-between
                      gap-3
                    "
                  >
                    <div>
                      <p className="text-gray-400 text-sm">
                        סה״כ שירותים
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        {services.length} שירותים
                      </p>
                    </div>

                    <p className="text-3xl font-bold text-[#D4AF37]">
                      ₪
                      {servicesTotal.toLocaleString("he-IL")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ==========================================
                פרטי עסקה
            ========================================== */}

            <div className="md:col-span-2 mt-4">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4">
                💰 פרטי עסקה
              </h3>

              {services.length > 0 && (
                <p className="text-gray-500 text-sm mb-4">
                  הסכום הכולל מחושב אוטומטית לפי השירותים שהוספת.
                </p>
              )}
            </div>

            {/* סכום העסקה */}

            <div className="relative">
              <label
                className="
                  absolute
                  top-2
                  right-4
                  z-10
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
              >
                סכום העסקה
              </label>

              <input
                name="totalAmount"
                value={
                  services.length > 0
                    ? servicesTotal
                    : form.totalAmount
                }
                onChange={handleChange}
                placeholder="סכום העסקה"
                type="number"
                min="0"
                readOnly={services.length > 0}
                className="
                  w-full
                  bg-[#181818]
                  border
                  border-[#333]
                  rounded-xl
                  p-4
                  pt-7
                  text-white
                  outline-none
                  focus:border-[#D4AF37]
                  read-only:opacity-70
                "
              />
            </div>

            {/* מקדמה */}

            <div className="relative">
              <label
                className="
                  absolute
                  top-2
                  right-4
                  z-10
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
              >
                מקדמה
              </label>

              <input
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
                placeholder="0"
                type="number"
                min="0"
                className="
                  w-full
                  bg-[#181818]
                  border
                  border-[#333]
                  rounded-xl
                  p-4
                  pt-7
                  text-white
                  outline-none
                  focus:border-[#D4AF37]
                "
              />
            </div>

            <div
              className="
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
              "
            >
              <p className="text-gray-500 text-sm mb-1">
                יתרה לתשלום
              </p>

              <p className="text-2xl font-bold text-[#D4AF37]">
                ₪
                {Math.max(
                  0,
                  Number(
                    services.length > 0
                      ? servicesTotal
                      : form.totalAmount || 0
                  ) - Number(form.paidAmount || 0)
                ).toLocaleString("he-IL")}
              </p>
            </div>

            <textarea
              name="notes"
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="הערות"
              rows={4}
              className="
                md:col-span-2
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                resize-none
                focus:border-[#D4AF37]
              "
            />

            <textarea
              name="additionalInfo"
              value={form.additionalInfo}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  additionalInfo: e.target.value,
                }))
              }
              placeholder="מידע נוסף"
              rows={4}
              className="
                md:col-span-2
                bg-[#181818]
                border
                border-[#333]
                rounded-xl
                p-4
                outline-none
                resize-none
                focus:border-[#D4AF37]
              "
            />

            {/* ==========================================
                רשימת אלכוהול ומשקאות
            ========================================== */}

            <div className="md:col-span-2">
              <label className="block text-[#D4AF37] font-semibold mb-2">
                🍸 רשימת אלכוהול ומשקאות
              </label>

              <p className="text-gray-500 text-sm mb-3">
                הרשימה תוכל להיכנס אוטומטית לחוזה של בר אקטיבי.
              </p>

              <textarea
                name="alcoholList"
                value={form.alcoholList}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    alcoholList: e.target.value,
                  }))
                }
                placeholder={`לדוגמה:
וודקה – Grey Goose
וויסקי – Jack Daniel's
ג'ין – Bombay Sapphire
בירה – קורונה
יין אדום – 10 בקבוקים
שתייה קלה – קולה, ספרייט, תפוזים`}
                rows={7}
                className="
                  w-full
                  bg-[#181818]
                  border
                  border-[#333]
                  rounded-xl
                  p-4
                  outline-none
                  resize-none
                  focus:border-[#D4AF37]
                "
              />
            </div>

            <div
              className="
                md:col-span-2
                flex
                flex-col
                md:flex-row
                gap-3
              "
            >
              <button
                type="submit"
                disabled={saving}
                className="
                  bg-[#D4AF37]
                  text-black
                  font-semibold
                  px-8
                  py-3
                  rounded-xl
                  hover:bg-[#c89d24]
                  transition
                  disabled:opacity-50
                "
              >
                {saving
                  ? "שומר..."
                  : editingId !== null
                  ? "שמירת שינויים"
                  : "שמירת לקוח"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                disabled={saving}
                className="
                  border
                  border-[#444]
                  text-gray-300
                  px-8
                  py-3
                  rounded-xl
                  hover:border-[#D4AF37]
                  transition
                "
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          רשימת לקוחות
      ========================================== */}

      <div
        className="
          bg-[#111]
          border
          border-[#292929]
          rounded-2xl
          overflow-hidden
        "
      >
        <div
          className="
            p-6
            border-b
            border-[#292929]
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            "
          >
            <div>
              <h2 className="text-2xl font-bold">
                לקוחות
              </h2>

              <p className="text-gray-500 mt-1">
                {loading
                  ? "טוען לקוחות..."
                  : search
                  ? `${filteredClients.length} תוצאות מתוך ${clients.length}`
                  : `${clients.length} לקוחות במערכת`}
              </p>
            </div>

            {clients.length > 0 && !loading && (
              <button
                onClick={clearAllClients}
                className="
                  text-red-400
                  border
                  border-red-900
                  px-4
                  py-2
                  rounded-xl
                  hover:bg-red-900/20
                  transition
                "
              >
                מחיקת כל הלקוחות
              </button>
            )}
          </div>

          {/* חיפוש */}

          {!loading && clients.length > 0 && (
            <div className="mt-6 relative">
              <span
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-xl
                "
              >
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="חיפוש לפי שם, טלפון, אימייל, אירוע, מקום או סטטוס..."
                className="
                  w-full
                  bg-[#181818]
                  border
                  border-[#333]
                  rounded-xl
                  py-4
                  pr-12
                  pl-12
                  text-white
                  outline-none
                  transition
                  focus:border-[#D4AF37]
                  focus:ring-1
                  focus:ring-[#D4AF37]
                "
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-white
                    text-lg
                  "
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* טעינה */}

        {loading ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-5">
              ⏳
            </div>

            <h3 className="text-xl font-bold mb-2">
              טוען לקוחות...
            </h3>

            <p className="text-gray-500">
              מתחבר לבסיס הנתונים
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-5">
              {search ? "🔍" : "👥"}
            </div>

            <h3 className="text-xl font-bold mb-2">
              {search
                ? "לא נמצאו לקוחות"
                : "עדיין אין לקוחות"}
            </h3>

            <p className="text-gray-500 mb-6">
              {search
                ? `לא נמצאו תוצאות עבור "${search}"`
                : "הוסף את הלקוח הראשון שלך כדי להתחיל לנהל את המערכת."}
            </p>

            {search ? (
              <button
                onClick={() => setSearch("")}
                className="
                  border
                  border-[#D4AF37]
                  text-[#D4AF37]
                  px-6
                  py-3
                  rounded-xl
                  hover:bg-[#D4AF37]
                  hover:text-black
                  transition
                "
              >
                ניקוי חיפוש
              </button>
            ) : (
              <button
                onClick={openNewClientForm}
                className="
                  bg-[#D4AF37]
                  text-black
                  font-semibold
                  px-7
                  py-3
                  rounded-xl
                  hover:bg-[#c89d24]
                  transition
                "
              >
                + הוסף לקוח
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#292929]">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="
                  p-6
                  hover:bg-[#151515]
                  transition
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-6
                  "
                >
                  {/* פרטי לקוח */}

                  <div className="min-w-[220px]">
                    <h3 className="text-xl font-bold">
                      {client.name}
                    </h3>

                    <p className="text-gray-400 mt-2">
                      📞 {client.phone}
                    </p>

                    {client.email && (
                      <p className="text-gray-500 text-sm mt-1">
                        ✉️ {client.email}
                      </p>
                    )}

                    {client.location && (
                      <p className="text-gray-500 text-sm mt-1">
                        📍 {client.location}
                      </p>
                    )}
                  </div>

                  {/* נתוני אירוע */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      md:grid-cols-4
                      gap-5
                      text-sm
                      flex-1
                    "
                  >
                    <div>
                      <p className="text-gray-500 mb-1">
                        אירוע
                      </p>

                      <p>
                        {client.eventType || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-1">
                        תאריך
                      </p>

                      <p>
                        {client.eventDate || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-1">
                        מוזמנים
                      </p>

                      <p>
                        {client.guests || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 mb-1">
                        סטטוס
                      </p>

                      <p className="text-[#D4AF37]">
                        {client.status}
                      </p>
                    </div>
                  </div>

                  {/* שירותים */}

                  {client.services &&
                    client.services.length > 0 && (
                      <div
                        className="
                          bg-[#181818]
                          border
                          border-[#292929]
                          rounded-xl
                          p-4
                          min-w-[220px]
                        "
                      >
                        <p className="text-gray-500 text-sm mb-2">
                          שירותים
                        </p>

                        <div className="space-y-1">
                          {client.services.map((service) => (
                            <div
                              key={
                                service.id ??
                                service.serviceName
                              }
                              className="
                                flex
                                justify-between
                                gap-4
                                text-sm
                              "
                            >
                              <span>
                                {service.serviceName}
                              </span>

                              <span className="text-[#D4AF37]">
                                ₪
                                {Number(
                                  service.amount
                                ).toLocaleString(
                                  "he-IL"
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#333] mt-3 pt-3 flex justify-between font-bold">
                          <span>
                            סה״כ
                          </span>

                          <span className="text-[#D4AF37]">
                            ₪
                            {client.services
                              .reduce(
                                (
                                  sum,
                                  service
                                ) =>
                                  sum +
                                  Number(
                                    service.amount ||
                                      0
                                  ),
                                0
                              )
                              .toLocaleString(
                                "he-IL"
                              )}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* פעולות */}

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-3
                    "
                  >
                    {/* יומן */}

                    {client.addedToCalendar ? (
                      <button
                        disabled
                        className="
                          border
                          border-green-900
                          text-green-400
                          px-5
                          py-2
                          rounded-xl
                          opacity-90
                          cursor-default
                        "
                      >
                        ✅ נוסף ליומן
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          addToCalendar(client)
                        }
                        disabled={
                          addingToCalendarId ===
                            client.id ||
                          !client.eventDate
                        }
                        title={
                          !client.eventDate
                            ? "יש להוסיף תאריך אירוע לפני הוספה ליומן"
                            : ""
                        }
                        className="
                          border
                          border-[#D4AF37]
                          text-[#D4AF37]
                          px-5
                          py-2
                          rounded-xl
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                        "
                      >
                        {addingToCalendarId ===
                        client.id
                          ? "מוסיף..."
                          : "📅 הוסף ליומן"}
                      </button>
                    )}

                    {/* עריכה */}

                    <button
                      onClick={() =>
                        startEdit(client)
                      }
                      className="
                        border
                        border-[#D4AF37]
                        text-[#D4AF37]
                        px-5
                        py-2
                        rounded-xl
                        hover:bg-[#D4AF37]
                        hover:text-black
                        transition
                      "
                    >
                      ✏️ עריכה
                    </button>

                    {/* מחיקה */}

                    <button
                      onClick={() =>
                        deleteClient(client.id)
                      }
                      disabled={
                        deletingId ===
                        client.id
                      }
                      className="
                        border
                        border-red-900
                        text-red-400
                        px-5
                        py-2
                        rounded-xl
                        hover:bg-red-900/20
                        transition
                        disabled:opacity-50
                      "
                    >
                      {deletingId ===
                      client.id
                        ? "מוחק..."
                        : "🗑️ מחיקה"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* תחתית */}

      <div className="mt-6 text-center text-gray-600 text-sm">
        הנתונים נשמרים בבסיס הנתונים של Maestro.
      </div>
    </main>
  );
}