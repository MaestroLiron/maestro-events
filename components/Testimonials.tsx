"use client";

import { useEffect, useState } from "react";
import SectionTitle from "./SectionTitle";

type Testimonial = {
  id: number;
  name: string;
  eventType: string | null;
  rating: number;
  content: string;
  status: string;
  createdAt: string;
};

export default function Testimonials() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // טעינת המלצות מאושרות בלבד
  // ==========================================

  async function loadTestimonials() {
    try {
      setLoadingTestimonials(true);

      // חשוב מאוד:
      // בדף הבית אנחנו מבקשים מהשרת
      // רק המלצות שאושרו.
      const response = await fetch(
        "/api/testimonials?approved=true",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load testimonials");
      }

      const data = await response.json();

      // הגנה נוספת בצד הלקוח:
      // גם אם מסיבה כלשהי השרת יחזיר המלצה
      // שלא אושרה, היא לא תוצג באתר.
      const approvedOnly = Array.isArray(data)
        ? data.filter(
            (testimonial: Testimonial) =>
              testimonial.status?.toUpperCase() === "APPROVED"
          )
        : [];

      console.log(
        "APPROVED TESTIMONIALS FROM API:",
        approvedOnly
      );

      setTestimonials(approvedOnly);
    } catch (error) {
      console.error(
        "Error loading approved testimonials:",
        error
      );

      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  // ==========================================
  // שליחת המלצה
  // ==========================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !content.trim()) {
      alert("נא למלא שם והמלצה");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          eventType,
          rating,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "אירעה שגיאה");
        return;
      }

      // ========================================
      // איפוס הטופס
      // ========================================

      setName("");
      setEventType("");
      setRating(5);
      setContent("");
      setShowForm(false);

      // ========================================
      // חשוב:
      //
      // ההמלצה החדשה היא PENDING.
      //
      // לכן היא לא תתווסף לרשימת ההמלצות
      // באתר.
      //
      // היא תופיע רק בדאשבורד לאישור.
      // ========================================

      await loadTestimonials();

      // ========================================
      // חלון הצלחה
      // ========================================

      setShowSuccess(true);
    } catch (error) {
      console.error(
        "Submit testimonial error:",
        error
      );

      alert("אירעה שגיאה בשליחת ההמלצה");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // הצגת 3 המלצות
  // ==========================================

  const displayedTestimonials = showAll
    ? testimonials
    : testimonials.slice(0, 3);

  // ==========================================
  // כוכבים
  // ==========================================

  function Stars({ rating }: { rating: number }) {
    return (
      <div
        className="
          flex
          justify-center
          items-center
          gap-1
          text-2xl
          direction-ltr
        "
        dir="ltr"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.9)]"
                : "text-gray-600"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <section
      id="testimonials"
      className="bg-[#0b0b0b] py-24"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* ===================================== */}
        {/* כותרת */}
        {/* ===================================== */}

        <SectionTitle
          title="לקוחות ממליצים"
          subtitle="האהבה של הלקוחות שלנו היא ההצלחה הכי גדולה שלנו"
        />

        {/* ===================================== */}
        {/* המלצות */}
        {/* ===================================== */}

        {loadingTestimonials ? (
          <div className="text-center text-gray-400 py-12">
            טוען המלצות...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            עדיין אין המלצות מאושרות.
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-3">

              {displayedTestimonials.map(
                (testimonial) => (
                  <div
                    key={testimonial.id}
                    className="
                      bg-[#111]
                      p-8
                      rounded-3xl
                      border
                      border-[#2d2d2d]
                      transition-all
                      duration-300
                      hover:border-[#D4AF37]
                      hover:-translate-y-1
                      hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]

                      flex
                      flex-col
                      items-center
                      text-center
                    "
                  >

                    {/* ================================= */}
                    {/* כוכבים - במרכז */}
                    {/* ================================= */}

                    <div className="w-full flex justify-center mb-5">
                      <Stars
                        rating={testimonial.rating}
                      />
                    </div>

                    {/* ================================= */}
                    {/* תוכן - במרכז */}
                    {/* ================================= */}

                    <p
                      className="
                        text-gray-300
                        leading-8
                        text-center
                        w-full
                      "
                    >
                      ״{testimonial.content}״
                    </p>

                    {/* ================================= */}
                    {/* שם - במרכז */}
                    {/* ================================= */}

                    <div
                      className="
                        mt-6
                        text-[#D4AF37]
                        font-bold
                        text-center
                        w-full
                      "
                    >
                      {testimonial.name}
                    </div>

                    {/* ================================= */}
                    {/* סוג אירוע - במרכז */}
                    {/* ================================= */}

                    {testimonial.eventType && (
                      <div
                        className="
                          text-gray-500
                          mt-1
                          text-center
                          w-full
                        "
                      >
                        {testimonial.eventType}
                      </div>
                    )}

                  </div>
                )
              )}

            </div>

            {/* ===================================== */}
            {/* לכל ההמלצות */}
            {/* ===================================== */}

            {testimonials.length > 3 && (
              <div className="text-center mt-12">

                <button
                  onClick={() =>
                    setShowAll(!showAll)
                  }
                  className="
                    group
                    relative
                    overflow-hidden
                    bg-[#D4AF37]
                    text-black
                    font-bold
                    px-10
                    py-4
                    rounded-xl
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:shadow-[0_0_35px_rgba(212,175,55,0.65)]
                    active:scale-95
                  "
                >

                  <span
                    className="
                      absolute
                      inset-0
                      -translate-x-full
                      group-hover:translate-x-full
                      transition-transform
                      duration-700
                      bg-gradient-to-r
                      from-transparent
                      via-white/40
                      to-transparent
                    "
                  />

                  <span className="relative z-10">
                    {showAll
                      ? "הצג פחות"
                      : "לכל ההמלצות"}
                  </span>

                </button>

              </div>
            )}
          </>
        )}

        {/* ===================================== */}
        {/* כפתור הוספת המלצה */}
        {/* ===================================== */}

        <div className="text-center mt-10">

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="
              mx-auto
              w-fit
              bg-[#D4AF37]
              text-black
              font-bold
              px-10
              py-4
              rounded-xl
              shadow-[0_0_25px_rgba(212,175,55,0.45)]
              hover:shadow-[0_0_40px_rgba(212,175,55,0.75)]
              hover:scale-105
              transition-all
              duration-300
            "
          >
            {showForm
              ? "סגירת טופס"
              : "✍️ כתבו לנו המלצה"}
          </button>

        </div>

        {/* ===================================== */}
        {/* טופס המלצה */}
        {/* ===================================== */}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="
              max-w-2xl
              mx-auto
              mt-12
              bg-[#111]
              p-8
              rounded-3xl
              border
              border-[#2d2d2d]
            "
          >

            <h3
              className="
                text-white
                text-2xl
                font-bold
                text-center
                mb-6
              "
            >
              שתפו אותנו בחוויה שלכם
            </h3>

            {/* שם */}

            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="
                text-right
                w-full
                bg-[#0b0b0b]
                border
                border-[#333]
                rounded-xl
                px-5
                py-4
                text-white
                mb-4
                outline-none
                focus:border-[#D4AF37]
              "
            />

            {/* סוג אירוע */}

            <select
              value={eventType}
              onChange={(e) =>
                setEventType(e.target.value)
              }
              className="
                text-right
                w-full
                bg-[#0b0b0b]
                border
                border-[#333]
                rounded-xl
                px-5
                py-4
                text-white
                mb-5
                outline-none
                focus:border-[#D4AF37]
              "
            >
              <option value="">
                סוג האירוע
              </option>

              <option value="חתונה">
                חתונה
              </option>

              <option value="בר מצווה">
                בר מצווה
              </option>

              <option value="בת מצווה">
                בת מצווה
              </option>

              <option value="אירוסין">
                אירוסין
              </option>

              <option value="יום הולדת">
                יום הולדת
              </option>

              <option value="אירוע עסקי">
                אירוע עסקי
              </option>

              <option value="אחר">
                אחר
              </option>
            </select>

            {/* דירוג */}

            <div className="mb-6 text-center">

              <div className="text-white mb-3">
                דירוג
              </div>

              <div
                className="
                  flex
                  justify-center
                  gap-2
                  text-3xl
                "
                dir="ltr"
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(star)
                      }
                      className={`
                        transition-all
                        duration-200
                        hover:scale-110
                        ${
                          star <= rating
                            ? "text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.9)]"
                            : "text-gray-600"
                        }
                      `}
                    >
                      ★
                    </button>
                  )
                )}

              </div>

            </div>

            {/* תוכן */}

            <textarea
              placeholder="כתבו את ההמלצה שלכם..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows={5}
              className="
                text-right
                w-full
                bg-[#0b0b0b]
                border
                border-[#333]
                rounded-xl
                px-5
                py-4
                text-white
                mb-5
                outline-none
                focus:border-[#D4AF37]
                resize-none
              "
            />

            {/* שליחה */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-[#D4AF37]
                text-black
                font-bold
                py-4
                rounded-xl
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:shadow-[0_8px_30px_rgba(212,175,55,0.65)]
                active:scale-[0.98]
                disabled:opacity-50
                disabled:hover:scale-100
              "
            >
              {loading
                ? "שולח..."
                : "שליחת ההמלצה"}
            </button>

          </form>
        )}

      </div>

      {/* ===================================== */}
      {/* חלון הצלחה */}
      {/* ===================================== */}

      {showSuccess && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/70
            backdrop-blur-sm
            px-6
          "
        >

          <div
            className="
              relative
              w-full
              max-w-md
              bg-[#0b0b0b]
              border
              border-[#D4AF37]
              rounded-3xl
              p-8
              text-center
              shadow-[0_0_15px_rgba(212,175,55,0.45),0_0_35px_rgba(212,175,55,0.20)]
            "
          >

            {/* קישוט */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                mb-6
              "
            >

              <div className="h-px w-16 bg-[#D4AF37]" />

              <span className="text-[#D4AF37] text-xl">
                ◆
              </span>

              <span
                className="
                  text-[#D4AF37]
                  tracking-[0.3em]
                  text-sm
                  font-bold
                "
              >
                MAESTRO EVENTS
              </span>

              <span className="text-[#D4AF37] text-xl">
                ◆
              </span>

              <div className="h-px w-16 bg-[#D4AF37]" />

            </div>

            {/* ✓ */}

            <div
              className="
                mx-auto
                mb-5
                w-16
                h-16
                rounded-full
                border
                border-[#D4AF37]
                flex
                items-center
                justify-center
              "
            >
              <span className="text-[#D4AF37] text-3xl">
                ✓
              </span>
            </div>

            <h2
              className="
                text-white
                text-2xl
                font-bold
                mb-4
              "
            >
              תודה שבחרתם מאסטרו איוונט
            </h2>

            <p
              className="
                text-gray-300
                leading-7
                mb-7
              "
            >
              ההמלצה שלכם התקבלה בהצלחה.
              <br />
              היא תיבדק ותופיע באתר לאחר אישור.
              <br />
              ✨ שמחנו לקחת חלק ביום המיוחד שלכם ✨
            </p>

            <button
              onClick={() =>
                setShowSuccess(false)
              }
              className="
                group
                relative
                overflow-hidden
                w-full
                bg-[#D4AF37]
                text-black
                font-bold
                py-3.5
                rounded-xl
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:shadow-[0_0_30px_rgba(212,175,55,0.55)]
                active:scale-[0.98]
              "
            >

              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  group-hover:translate-x-full
                  transition-transform
                  duration-700
                  bg-gradient-to-r
                  from-transparent
                  via-white/50
                  to-transparent
                "
              />

              <span
                className="
                  relative
                  z-10
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                המשך באתר

                <span
                  className="
                    text-lg
                    transition-transform
                    duration-300
                    group-hover:-translate-x-1
                  "
                >
                  ←
                </span>

              </span>

            </button>

          </div>

        </div>
      )}

    </section>
  );
}