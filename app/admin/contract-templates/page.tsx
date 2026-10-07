"use client";

import { useEffect, useState } from "react";

type Service = {
  id: number;
  title: string;
};

type ContractTemplate = {
  id: number;
  name: string;
  description: string | null;
  content: string;
  isActive: boolean;
  serviceId: number | null;
  service: Service | null;
  _count?: {
    contracts: number;
  };
};

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  // =====================================================
  // טעינת תבניות
  // =====================================================

  async function loadTemplates() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/contract-templates"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה בטעינת התבניות"
        );
      }

      setTemplates(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "שגיאה בטעינת תבניות החוזים"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // טעינת שירותים
  // =====================================================

  async function loadServices() {
    try {
      const response = await fetch(
        "/api/services"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה בטעינת השירותים"
        );
      }

      /*
       * ה־API של השירותים יכול להחזיר:
       *
       * מערך ישירות
       * או
       * { services: [...] }
       */

      if (Array.isArray(data)) {
        setServices(data);
      } else if (
        Array.isArray(data?.services)
      ) {
        setServices(data.services);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error(error);

      /*
       * אם השירותים לא נטענו,
       * עדיין אפשר ליצור תבנית.
       */
      setServices([]);
    }
  }

  // =====================================================
  // טעינה ראשונית
  // =====================================================

  useEffect(() => {
    loadTemplates();
    loadServices();
  }, []);

  // =====================================================
  // ניקוי הטופס
  // =====================================================

  function resetForm() {
    setName("");
    setDescription("");
    setContent("");
    setServiceId("");
    setEditingId(null);
  }

  // =====================================================
  // יצירת / עדכון תבנית
  // =====================================================

  async function saveTemplate() {
    if (!name.trim()) {
      alert("חובה להזין שם לתבנית");
      return;
    }

    if (!content.trim()) {
      alert("חובה להזין תוכן לחוזה");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // יצירת תבנית
      // =================================================

      if (editingId === null) {
        const response = await fetch(
          "/api/contract-templates",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: name.trim(),
              description:
                description.trim() || null,
              content: content.trim(),
              serviceId:
                serviceId || null,
              isActive: true,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "שגיאה ביצירת התבנית"
          );
        }

        alert(
          "תבנית החוזה נוצרה בהצלחה"
        );
      }

      // =================================================
      // עדכון תבנית
      // =================================================

      else {
        const response = await fetch(
          "/api/contract-templates",
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              id: editingId,
              name: name.trim(),
              description:
                description.trim() || null,
              content: content.trim(),
              serviceId:
                serviceId || null,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "שגיאה בעדכון התבנית"
          );
        }

        alert(
          "תבנית החוזה עודכנה בהצלחה"
        );
      }

      resetForm();
      await loadTemplates();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "שגיאה בשמירת התבנית"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // עריכת תבנית
  // =====================================================

  function editTemplate(
    template: ContractTemplate
  ) {
    setEditingId(template.id);

    setName(template.name);

    setDescription(
      template.description || ""
    );

    setContent(template.content);

    setServiceId(
      template.serviceId
        ? String(template.serviceId)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // מחיקת תבנית
  // =====================================================

  async function deleteTemplate(
    id: number
  ) {
    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך למחוק את תבנית החוזה?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/contract-templates",
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה במחיקת התבנית"
        );
      }

      alert(
        "תבנית החוזה נמחקה בהצלחה"
      );

      await loadTemplates();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "שגיאה במחיקת התבנית"
      );
    }
  }

  // =====================================================
  // הפעלה / השבתה
  // =====================================================

  async function toggleTemplate(
    template: ContractTemplate
  ) {
    try {
      const response = await fetch(
        "/api/contract-templates",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id: template.id,
            isActive: !template.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בעדכון סטטוס התבנית"
        );
      }

      await loadTemplates();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "שגיאה בעדכון התבנית"
      );
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0b0b0b] text-white p-4 md:p-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            כותרת
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
            תבניות חוזים
          </h1>

          <p className="mt-2 text-gray-400">
            יצירה וניהול של חוזים מוכנים לכל שירות
          </p>

        </div>

        {/* =================================================
            טופס
        ================================================= */}

        <section className="mb-10 rounded-2xl border border-[#D4AF37]/30 bg-[#111111] p-5 md:p-7 shadow-xl">

          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-bold">
                {editingId
                  ? "עריכת תבנית חוזה"
                  : "יצירת תבנית חוזה חדשה"}
              </h2>

              <p className="text-sm text-gray-400">
                התבנית תשמש ליצירת חוזים אוטומטיים ללקוחות
              </p>

            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-600 px-4 py-2 text-sm hover:bg-white/10"
              >
                ביטול עריכה
              </button>
            )}

          </div>

          {/* =================================================
              שם
          ================================================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              שם התבנית
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="לדוגמה: חוזה בר אקטיבי"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            />

          </div>

          {/* =================================================
              שירות
          ================================================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              שירות
            </label>

            <select
              value={serviceId}
              onChange={(e) =>
                setServiceId(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            >

              <option value="">
                ללא שירות ספציפי
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.title}
                </option>
              ))}

            </select>

            {services.length === 0 && (
              <p className="mt-2 text-xs text-yellow-500">
                לא נמצאו שירותים. אפשר עדיין ליצור תבנית.
              </p>
            )}

          </div>

          {/* =================================================
              תיאור
          ================================================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              תיאור
            </label>

            <input
              type="text"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="תיאור קצר של התבנית"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            />

          </div>

          {/* =================================================
              תוכן החוזה
          ================================================= */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium">
              תוכן החוזה
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder={`לדוגמה:

חוזה התקשרות - Maestro Events

פרטי הלקוח:
שם: {{clientName}}
טלפון: {{clientPhone}}

פרטי האירוע:
סוג אירוע: {{eventType}}
תאריך: {{eventDate}}
מיקום: {{location}}
מספר מוזמנים: {{guests}}

השירות:
{{serviceName}}

סכום העסקה:
{{totalAmount}} ₪

הערות מיוחדות:
{{notes}}

...`}
              rows={18}
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 font-sans text-sm leading-7 outline-none transition focus:border-[#D4AF37]"
            />

            <div className="mt-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">

              <p className="mb-2 text-sm font-semibold text-[#D4AF37]">
                משתנים שנוכל למלא אוטומטית בהמשך:
              </p>

              <div className="flex flex-wrap gap-2 text-xs">

                {[
                  "{{clientName}}",
                  "{{clientPhone}}",
                  "{{clientEmail}}",
                  "{{eventType}}",
                  "{{eventDate}}",
                  "{{guests}}",
                  "{{location}}",
                  "{{serviceName}}",
                  "{{totalAmount}}",
                  "{{depositAmount}}",
                  "{{remainingAmount}}",
                  "{{notes}}",
                  "{{alcoholList}}",
                ].map((variable) => (
                  <span
                    key={variable}
                    className="rounded-lg border border-white/10 bg-black px-2 py-1 text-gray-300"
                  >
                    {variable}
                  </span>
                ))}

              </div>

            </div>

          </div>

          {/* =================================================
              כפתור שמירה
          ================================================= */}

          <button
            type="button"
            onClick={saveTemplate}
            disabled={saving}
            className="w-full rounded-xl bg-[#D4AF37] px-6 py-3 font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {saving
              ? "שומר..."
              : editingId
              ? "שמור שינויים"
              : "צור תבנית חוזה"}
          </button>

        </section>

        {/* =================================================
            רשימת תבניות
        ================================================= */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              התבניות שלי
            </h2>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-400">
              {templates.length} תבניות
            </span>

          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-gray-400">
              טוען תבניות...
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111111] p-10 text-center">

              <div className="mb-3 text-4xl">
                📄
              </div>

              <h3 className="mb-2 text-xl font-bold">
                עדיין אין תבניות חוזים
              </h3>

              <p className="text-gray-400">
                צור את התבנית הראשונה שלך למעלה.
              </p>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-lg"
                >

                  {/* כותרת */}

                  <div className="mb-4 flex items-start justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-bold">
                        {template.name}
                      </h3>

                      {template.service && (
                        <p className="mt-1 text-sm text-[#D4AF37]">
                          {template.service.title}
                        </p>
                      )}

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        template.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {template.isActive
                        ? "פעיל"
                        : "לא פעיל"}
                    </span>

                  </div>

                  {/* תיאור */}

                  {template.description && (
                    <p className="mb-4 text-sm text-gray-400">
                      {template.description}
                    </p>
                  )}

                  {/* מספר חוזים */}

                  <div className="mb-5 rounded-xl bg-black p-3 text-sm text-gray-400">

                    חוזים שנוצרו מהתבנית:

                    <span className="mr-2 font-bold text-white">
                      {template._count?.contracts ?? 0}
                    </span>

                  </div>

                  {/* כפתורים */}

                  <div className="grid grid-cols-3 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        editTemplate(
                          template
                        )
                      }
                      className="rounded-xl border border-[#D4AF37]/40 px-3 py-2 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
                    >
                      עריכה
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleTemplate(
                          template
                        )
                      }
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                    >
                      {template.isActive
                        ? "השבת"
                        : "הפעל"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTemplate(
                          template.id
                        )
                      }
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      מחיקה
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}