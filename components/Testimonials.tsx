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
  // טעינת המלצות מאושרות בלבד
  async function loadTestimonials() {
    try {
      setLoadingTestimonials(true);
      const response = await fetch(
        "/api/testimonials?approved=true",
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error("Failed to load testimonials");
      }
      const data = await response.json();
      const approvedOnly = Array.isArray(data)
        ? data.filter(
            (testimonial: Testimonial) =>
              testimonial.status?.toUpperCase() === "APPROVED"
          )
        : [];
      setTestimonials(approvedOnly);
    } catch (error) {
      console.error("Error loading approved testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }
  useEffect(() => {
    loadTestimonials();
  }, []);
  // שליחת המלצה
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      setName("");
      setEventType("");
      setRating(5);
      setContent("");
      setShowForm(false);
      // המלצה חדשה תוצג באתר רק לאחר אישור
      await loadTestimonials();
      setShowSuccess(true);
    } catch (error) {
      console.error("Submit testimonial error:", error);
      alert("אירעה שגיאה בשליחת ההמלצה");
    } finally {
      setLoading(false);
    }
  }
  const displayedTestimonials = showAll
    ? testimonials
    : testimonials.slice(0, 3);
  // כוכבי דירוג
  function Stars({ rating }: { rating: number }) {
    return (
      <div
        className="flex items-center justify-center gap-1 text-xl sm:text-2xl"
        dir="ltr"
        aria-label={`דירוג ${rating} מתוך 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                : "text-gray-600"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }
  return (
    <>
      <section
        id="testimonials"
        className="overflow-hidden bg-[#0b0b0b] py-12 sm:py-16 lg:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="לקוחות ממליצים"
            subtitle="האהבה של הלקוחות שלנו היא ההצלחה הכי גדולה שלנו"
          />
          {/* המלצות */}
          {loadingTestimonials ? (
            <div className="py-10 text-center text-sm text-gray-400 sm:py-12 sm:text-base">
              טוען המלצות...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 sm:py-12 sm:text-base">
              עדיין אין המלצות מאושרות.
            </div>
          ) : (
            <>
              {/* מובייל: קרוסלה | מחשב: שלוש עמודות */}
              <div
                dir="rtl"
                className="
                  -mx-4 flex snap-x snap-mandatory gap-4
                  overflow-x-auto overscroll-x-contain
                  px-4 pb-3
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                  sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5
                  sm:overflow-visible sm:px-0 sm:pb-0
                  lg:grid-cols-3 lg:gap-8
                "
              >
                {displayedTestimonials.map((testimonial) => (
                  <article
                    key={testimonial.id}
                    className="
                      flex w-[86%] shrink-0 snap-center
                      flex-col items-center rounded-2xl
                      border border-[#2d2d2d] bg-[#111]
                      p-5 text-center transition-colors duration-300
                      hover:border-[#D4AF37]
                      sm:w-auto sm:shrink sm:rounded-3xl sm:p-6
                      lg:p-8
                      lg:hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]
                    "
                  >
                    <div className="mb-4 w-full sm:mb-5">
                      <Stars rating={testimonial.rating} />
                    </div>
                    <p className="w-full flex-1 break-words text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
                      ״{testimonial.content}״
                    </p>
                    <div className="mt-5 w-full text-center font-bold text-[#D4AF37] sm:mt-6">
                      {testimonial.name}
                    </div>
                    {testimonial.eventType && (
                      <div className="mt-1 w-full text-center text-sm text-gray-500">
                        {testimonial.eventType}
                      </div>
                    )}
                  </article>
                ))}
              </div>
              {/* הצגת כל ההמלצות */}
              {testimonials.length > 3 && (
                <div className="mt-6 text-center sm:mt-10">
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="
                      rounded-xl bg-[#D4AF37]
                      px-6 py-3 text-sm font-bold text-black
                      transition-all duration-300
                      hover:bg-[#e8c65b] active:scale-[0.98]
                      sm:px-10 sm:py-4 sm:text-base
                    "
                  >
                    {showAll ? "הצג פחות" : "לכל ההמלצות"}
                  </button>
                </div>
              )}
            </>
          )}
          {/* כפתור הוספת המלצה */}
          <div className="mt-7 text-center sm:mt-10">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              aria-expanded={showForm}
              className="
                w-full max-w-xs rounded-xl
                bg-[#D4AF37] px-5 py-3
                text-sm font-bold text-black
                shadow-[0_0_20px_rgba(212,175,55,0.2)]
                transition-all duration-300
                hover:bg-[#e8c65b] active:scale-[0.98]
                sm:w-auto sm:max-w-none sm:px-10 sm:py-4 sm:text-base
              "
            >
              {showForm ? "סגירת טופס" : "✍️ כתבו לנו המלצה"}
            </button>
          </div>
          {/* טופס המלצה */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="
                mx-auto mt-6 max-w-2xl
                rounded-2xl border border-[#2d2d2d]
                bg-[#111] p-4
                sm:mt-10 sm:rounded-3xl sm:p-8
              "
            >
              <h3 className="mb-5 text-center text-xl font-bold text-white sm:mb-6 sm:text-2xl">
                שתפו אותנו בחוויה שלכם
              </h3>
              <label className="mb-2 block text-sm text-gray-300">
                שם מלא *
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                placeholder="שם מלא"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="
                  mb-4 w-full rounded-xl border border-[#333]
                  bg-[#0b0b0b] px-4 py-3.5 text-right text-base
                  text-white outline-none
                  focus:border-[#D4AF37]
                "
              />
              <label className="mb-2 block text-sm text-gray-300">
                סוג האירוע
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="
                  mb-5 w-full rounded-xl border border-[#333]
                  bg-[#0b0b0b] px-4 py-3.5 text-right text-base
                  text-white outline-none
                  focus:border-[#D4AF37]
                "
              >
                <option value="">סוג האירוע</option>
                <option value="חתונה">חתונה</option>
                <option value="בר מצווה">בר מצווה</option>
                <option value="בת מצווה">בת מצווה</option>
                <option value="אירוסין">אירוסין</option>
                <option value="יום הולדת">יום הולדת</option>
                <option value="אירוע עסקי">אירוע עסקי</option>
                <option value="אחר">אחר</option>
              </select>
              <fieldset className="mb-5">
                <legend className="mb-3 w-full text-center text-sm text-white">
                  דירוג
                </legend>
                <div className="flex justify-center gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star} כוכבים`}
                      aria-pressed={rating === star}
                      className={`
                        text-3xl transition-transform
                        hover:scale-110
                        ${
                          star <= rating
                            ? "text-[#D4AF37]"
                            : "text-gray-600"
                        }
                      `}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mb-2 block text-sm text-gray-300">
                ההמלצה שלכם *
              </label>
              <textarea
                required
                placeholder="כתבו את ההמלצה שלכם..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="
                  mb-5 w-full resize-y rounded-xl
                  border border-[#333] bg-[#0b0b0b]
                  px-4 py-3.5 text-right text-base text-white
                  outline-none focus:border-[#D4AF37]
                "
              />
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-xl bg-[#D4AF37]
                  py-3.5 font-bold text-black
                  transition-colors hover:bg-[#e8c65b]
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {loading ? "שולח..." : "שליחת ההמלצה"}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                ההמלצה תפורסם באתר לאחר בדיקה ואישור.
              </p>
            </form>
          )}
        </div>
      </section>
      {/* חלון הצלחה */}
      {showSuccess && (
        <div
          className="
            fixed inset-0 z-[99999] flex items-center
            justify-center overflow-y-auto bg-black/80
            px-4 py-6 backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="testimonial-success-title"
        >
          <div
            className="
              relative my-auto w-full max-w-md
              rounded-2xl border border-[#D4AF37]
              bg-[#0b0b0b] p-5 text-center
              shadow-[0_0_30px_rgba(212,175,55,0.2)]
              sm:rounded-3xl sm:p-8
            "
          >
            <div className="mb-5 flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-sm text-[#D4AF37]">◆</span>
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] sm:text-sm">
                MAESTRO EVENTS
              </span>
              <span className="text-sm text-[#D4AF37]">◆</span>
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37] sm:h-16 sm:w-16">
              <span className="text-3xl text-[#D4AF37]">✓</span>
            </div>
            <h2
              id="testimonial-success-title"
              className="mb-3 text-xl font-bold text-white sm:text-2xl"
            >
              תודה שבחרתם במאסטרו איוונט
            </h2>
            <p className="mb-6 text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
              ההמלצה שלכם התקבלה בהצלחה.
              <br />
              היא תיבדק ותופיע באתר לאחר אישור.
              <br />
              ✨ שמחנו לקחת חלק ביום המיוחד שלכם ✨
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="
                w-full rounded-xl bg-[#D4AF37]
                py-3.5 font-bold text-black
                transition-colors hover:bg-[#e8c65b]
              "
            >
              המשך באתר ←
            </button>
          </div>
        </div>
      )}
    </>
  );
}