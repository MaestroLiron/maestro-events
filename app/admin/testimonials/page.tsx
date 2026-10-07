"use client";

import { useEffect, useMemo, useState } from "react";

type Testimonial = {
  id: number;
  name: string;
  eventType: string | null;
  rating: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ==========================================
  // טעינת ההמלצות
  // ==========================================

  async function loadTestimonials() {
    try {
      setLoading(true);

      const response = await fetch("/api/testimonials", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load testimonials");
      }

      const data = await response.json();

      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Testimonials loading error:", error);
      alert("שגיאה בטעינת ההמלצות");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  // ==========================================
  // שינוי סטטוס
  // ==========================================

  async function updateStatus(
    id: number,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) {
    try {
      setActionLoading(id);

      const response = await fetch("/api/testimonials", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "שגיאה בעדכון");
      }

      setTestimonials((current) =>
        current.map((testimonial) =>
          testimonial.id === id
            ? {
                ...testimonial,
                status: data.status,
              }
            : testimonial
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("שגיאה בעדכון ההמלצה");
    } finally {
      setActionLoading(null);
    }
  }

  // ==========================================
  // מחיקת המלצה
  // ==========================================

  async function deleteTestimonial(id: number) {
    const confirmed = window.confirm(
      "האם אתה בטוח שאתה רוצה למחוק את ההמלצה?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);

      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "שגיאה במחיקה");
      }

      setTestimonials((current) =>
        current.filter((testimonial) => testimonial.id !== id)
      );
    } catch (error) {
      console.error("Delete testimonial error:", error);
      alert("שגיאה במחיקת ההמלצה");
    } finally {
      setActionLoading(null);
    }
  }

  // ==========================================
  // סטטיסטיקות
  // ==========================================

  const pendingTestimonials = useMemo(
    () =>
      testimonials.filter(
        (testimonial) =>
          testimonial.status.toUpperCase() === "PENDING"
      ),
    [testimonials]
  );

  const approvedTestimonials = useMemo(
    () =>
      testimonials.filter(
        (testimonial) =>
          testimonial.status.toUpperCase() === "APPROVED"
      ),
    [testimonials]
  );

  const rejectedTestimonials = useMemo(
    () =>
      testimonials.filter(
        (testimonial) =>
          testimonial.status.toUpperCase() === "REJECTED"
      ),
    [testimonials]
  );

  // ==========================================
  // כוכבים
  // ==========================================

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1 justify-center" dir="ltr">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={
              index < rating
                ? "text-[#D4AF37] text-xl"
                : "text-gray-700 text-xl"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  // ==========================================
  // סטטוס
  // ==========================================

  function statusLabel(status: string) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "מאושרת";

      case "REJECTED":
        return "נדחתה";

      case "PENDING":
        return "ממתינה לאישור";

      default:
        return status;
    }
  }

  function statusClass(status: string) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-500/10 border-green-500/30 text-green-400";

      case "REJECTED":
        return "bg-red-500/10 border-red-500/30 text-red-400";

      default:
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    }
  }

  // ==========================================
  // תאריך
  // ==========================================

  function formatDate(date: string) {
    try {
      return new Date(date).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#090909] text-white px-8 pt-24 pb-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[#D4AF37] text-xl">
              טוען המלצות...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#090909] text-white px-4 md:px-8 pt-24 pb-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
                המלצות לקוחות
              </h1>

              <p className="text-gray-400 mt-2">
                ניהול המלצות שמופיעות באתר
              </p>
            </div>

            <button
              onClick={loadTestimonials}
              className="
                border
                border-[#D4AF37]
                text-[#D4AF37]
                px-5
                py-3
                rounded-xl
                hover:bg-[#D4AF37]
                hover:text-black
                transition
              "
            >
              ↻ רענן
            </button>

          </div>

        </div>

        {/* ===================================== */}
        {/* STATISTICS */}
        {/* ===================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* ממתינות */}

          <div
            className="
              bg-[#111]
              border
              border-yellow-500/30
              rounded-2xl
              p-6
            "
          >
            <div className="text-yellow-400 text-sm mb-2">
              ממתינות לאישור
            </div>

            <div className="text-4xl font-bold">
              {pendingTestimonials.length}
            </div>
          </div>

          {/* מאושרות */}

          <div
            className="
              bg-[#111]
              border
              border-green-500/30
              rounded-2xl
              p-6
            "
          >
            <div className="text-green-400 text-sm mb-2">
              מופיעות באתר
            </div>

            <div className="text-4xl font-bold">
              {approvedTestimonials.length}
            </div>
          </div>

          {/* נדחו */}

          <div
            className="
              bg-[#111]
              border
              border-red-500/30
              rounded-2xl
              p-6
            "
          >
            <div className="text-red-400 text-sm mb-2">
              נדחו
            </div>

            <div className="text-4xl font-bold">
              {rejectedTestimonials.length}
            </div>
          </div>

        </div>

        {/* ===================================== */}
        {/* EMPTY STATE */}
        {/* ===================================== */}

        {testimonials.length === 0 && (
          <div
            className="
              bg-[#111]
              border
              border-[#2a2a2a]
              rounded-3xl
              p-12
              text-center
            "
          >
            <div className="text-5xl mb-5">
              ⭐
            </div>

            <h2 className="text-2xl font-bold mb-2">
              עדיין אין המלצות
            </h2>

            <p className="text-gray-400">
              כאשר לקוח ישאיר המלצה היא תופיע כאן
              לאישור.
            </p>
          </div>
        )}

        {/* ===================================== */}
        {/* TESTIMONIALS */}
        {/* ===================================== */}

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {testimonials.map((testimonial) => {

              const isLoading =
                actionLoading === testimonial.id;

              const currentStatus =
                testimonial.status.toUpperCase();

              return (
                <div
                  key={testimonial.id}
                  className="
                    bg-[#111]
                    border
                    border-[#2a2a2a]
                    rounded-3xl
                    p-6
                    hover:border-[#D4AF37]/50
                    transition
                  "
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4 mb-5">

                    <div>

                      <h2 className="text-xl font-bold">
                        {testimonial.name}
                      </h2>

                      {testimonial.eventType && (
                        <div className="text-gray-500 text-sm mt-1">
                          {testimonial.eventType}
                        </div>
                      )}

                    </div>

                    <div
                      className={`
                        px-3
                        py-1
                        rounded-full
                        border
                        text-xs
                        whitespace-nowrap
                        ${statusClass(testimonial.status)}
                      `}
                    >
                      {statusLabel(testimonial.status)}
                    </div>

                  </div>

                  {/* RATING */}

                  <div className="mb-5">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      bg-[#0b0b0b]
                      border
                      border-[#222]
                      rounded-2xl
                      p-5
                      mb-5
                    "
                  >

                    <div className="text-gray-300 leading-8 text-right">
                      ״{testimonial.content}״
                    </div>

                  </div>

                  {/* DATE */}

                  <div className="text-gray-600 text-xs mb-5">
                    התקבלה בתאריך:{" "}
                    {formatDate(testimonial.createdAt)}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-col gap-3">

                    {/* PENDING */}

                    {currentStatus === "PENDING" && (
                      <div className="grid grid-cols-2 gap-3">

                        <button
                          disabled={isLoading}
                          onClick={() =>
                            updateStatus(
                              testimonial.id,
                              "APPROVED"
                            )
                          }
                          className="
                            bg-green-600
                            hover:bg-green-500
                            disabled:opacity-50
                            text-white
                            font-bold
                            py-3
                            rounded-xl
                            transition
                          "
                        >
                          {isLoading
                            ? "מעדכן..."
                            : "✓ אשר והצג באתר"}
                        </button>

                        <button
                          disabled={isLoading}
                          onClick={() =>
                            updateStatus(
                              testimonial.id,
                              "REJECTED"
                            )
                          }
                          className="
                            bg-red-600/10
                            border
                            border-red-500/40
                            text-red-400
                            hover:bg-red-600
                            hover:text-white
                            disabled:opacity-50
                            font-bold
                            py-3
                            rounded-xl
                            transition
                          "
                        >
                          {isLoading
                            ? "מעדכן..."
                            : "✕ דחה"}
                        </button>

                      </div>
                    )}

                    {/* APPROVED */}

                    {currentStatus === "APPROVED" && (
                      <div className="grid grid-cols-2 gap-3">

                        <button
                          disabled={isLoading}
                          onClick={() =>
                            updateStatus(
                              testimonial.id,
                              "PENDING"
                            )
                          }
                          className="
                            border
                            border-yellow-500/40
                            text-yellow-400
                            hover:bg-yellow-500
                            hover:text-black
                            disabled:opacity-50
                            py-3
                            rounded-xl
                            transition
                          "
                        >
                          החזר להמתנה
                        </button>

                        <button
                          disabled={isLoading}
                          onClick={() =>
                            updateStatus(
                              testimonial.id,
                              "REJECTED"
                            )
                          }
                          className="
                            border
                            border-red-500/40
                            text-red-400
                            hover:bg-red-600
                            hover:text-white
                            disabled:opacity-50
                            py-3
                            rounded-xl
                            transition
                          "
                        >
                          הסר מהאתר
                        </button>

                      </div>
                    )}

                    {/* REJECTED */}

                    {currentStatus === "REJECTED" && (
                      <button
                        disabled={isLoading}
                        onClick={() =>
                          updateStatus(
                            testimonial.id,
                            "APPROVED"
                          )
                        }
                        className="
                          bg-green-600
                          hover:bg-green-500
                          disabled:opacity-50
                          text-white
                          font-bold
                          py-3
                          rounded-xl
                          transition
                        "
                      >
                        אשר והצג באתר
                      </button>
                    )}

                    {/* DELETE */}

                    <button
                      disabled={isLoading}
                      onClick={() =>
                        deleteTestimonial(testimonial.id)
                      }
                      className="
                        text-gray-500
                        hover:text-red-400
                        text-sm
                        py-2
                        transition
                      "
                    >
                      🗑 מחק המלצה
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}