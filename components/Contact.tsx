"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const services = [
  "צילום סטילס",
  "צילום מגנטים",
  "חבילת סלואו",
  "זיקוקים קרים",
  "בר אקטיבי",
  "קיאק פירות",
  "עיצוב בלונים",
  "קיר משקפיים",
];
const inputClass =
  "w-full min-w-0 rounded-xl sm:rounded-2xl border border-[#2d2d2d] bg-[#111] px-4 py-3.5 sm:px-5 sm:py-4 text-base text-white text-right outline-none transition-colors duration-300 placeholder:text-gray-400 focus:border-[#D4AF37] hover:border-[#D4AF37]";
export default function Contact() {
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service]
    );
  };
  const sendToWhatsApp = async () => {
    if (sending) return;
    if (!fullName.trim() || !phone.trim() || !eventType.trim()) {
      alert("נא למלא שם מלא, טלפון וסוג האירוע.");
      return;
    }
    setSending(true);
    try {
      // שמירת הפנייה במסד הנתונים
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          eventType: eventType.trim(),
          eventDate: eventDate ? eventDate.toISOString() : null,
          guests: guests || null,
          services: selectedServices,
          notes: notes.trim() || null,
        }),
      });
      const responseText = await response.text();
      let data: any = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error("Failed to parse lead response:", error);
        }
      }
      if (!response.ok) {
        console.error("Lead save error:", {
          status: response.status,
          data,
          responseText,
        });
        alert(
          data?.error ||
            "לא הצלחנו לשמור את הפרטים. נסו שוב."
        );
        return;
      }
      // הכנת הודעת WhatsApp
      const formattedDate = eventDate
        ? eventDate.toLocaleDateString("he-IL")
        : "לא נבחר";
      const message = `
שלום Maestro Events 👋
אשמח לקבל הצעת מחיר.
👤 שם: ${fullName}
📞 טלפון: ${phone}
📧 אימייל: ${email || "לא הוזן"}
🎉 סוג אירוע: ${eventType}
📅 תאריך האירוע: ${formattedDate}
👥 מספר מוזמנים: ${guests || "לא הוזן"}
⭐ שירותים:
${
  selectedServices.length
    ? selectedServices.map((service) => `✔ ${service}`).join("\n")
    : "לא נבחרו"
}
📝 הערות:
${notes.trim() || "אין"}
`;
      const url = `https://wa.me/972528913271?text=${encodeURIComponent(
        message
      )}`;
      window.location.assign(url);
    } catch (error) {
      console.error("Send lead error:", error);
      alert("אירעה שגיאה בשליחת הבקשה. נסו שוב.");
    } finally {
      setSending(false);
    }
  };
  return (
    <section
      id="contact"
      dir="rtl"
      className="overflow-hidden bg-[#090909] py-12 text-right sm:py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* כותרת דקורטיבית */}
        <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8 sm:gap-4">
          <div className="h-px max-w-[180px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37]" />
          <span className="text-sm text-[#D4AF37] sm:text-lg">◆</span>
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-sm sm:tracking-[0.5em]">
            Maestro Events
          </span>
          <span className="text-sm text-[#D4AF37] sm:text-lg">◆</span>
          <div className="h-px max-w-[180px] flex-1 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#D4AF37]" />
        </div>
        {/* כותרת */}
        <h2 className="mb-3 text-center text-3xl font-bold leading-tight text-[#D4AF37] sm:mb-4 sm:text-4xl lg:text-5xl">
          קבלו הצעת מחיר
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-sm leading-6 text-gray-400 sm:mb-12 sm:text-base sm:leading-7 lg:mb-14">
          נשמח לחזור אליכם עם הצעה מותאמת אישית.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendToWhatsApp();
          }}
          className="space-y-7 sm:space-y-10"
        >
          {/* פרטי לקוח ואירוע */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm text-gray-300">
                שם מלא *
              </label>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                required
                placeholder="הקלידו שם מלא"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="mb-2 block text-sm text-gray-300">
                טלפון *
              </label>
              <input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                placeholder="מספר טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm text-gray-300">
                אימייל (לא חובה)
              </label>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-event-type" className="mb-2 block text-sm text-gray-300">
                סוג האירוע *
              </label>
              <select
                id="contact-event-type"
                required
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={`${inputClass} appearance-auto`}
              >
                <option value="">בחרו סוג אירוע</option>
                <option value="חתונה">חתונה</option>
                <option value="בר מצווה">בר מצווה</option>
                <option value="בת מצווה">בת מצווה</option>
                <option value="חינה">חינה</option>
                <option value="ברית / בריתה">ברית / בריתה</option>
                <option value="יום הולדת">יום הולדת</option>
                <option value="אירוע עסקי">אירוע עסקי</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            {/* תאריך */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm text-gray-300">
                תאריך האירוע
              </label>
              <DatePicker
                selected={eventDate}
                onChange={(date: Date | null) => setEventDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="📅 בחרו תאריך"
                wrapperClassName="w-full"
                calendarClassName="maestro-calendar"
                popperClassName="maestro-popper"
                showPopperArrow={false}
                minDate={new Date()}
                isClearable
                className={inputClass}
              />
            </div>
            {/* מספר מוזמנים */}
            <div>
              <label htmlFor="contact-guests" className="mb-2 block text-sm text-gray-300">
                מספר מוזמנים
              </label>
              <input
                id="contact-guests"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="כמה אורחים צפויים?"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {/* בחירת שירותים */}
          <div>
            <h3 className="mb-2 text-center text-xl font-bold text-[#D4AF37] sm:mb-3 sm:text-2xl">
              אילו שירותים מעניינים אתכם?
            </h3>
            <p className="mb-5 text-center text-xs text-gray-500 sm:mb-7 sm:text-sm">
              ניתן לבחור כמה שירותים
            </p>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
              {services.map((service) => {
                const selected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleService(service)}
                    className={`
                      flex min-h-12 items-center justify-center
                      rounded-xl border px-2 py-3
                      text-center text-xs font-semibold leading-5
                      transition-colors duration-200
                      active:scale-[0.98]
                      sm:rounded-full sm:px-4 sm:text-sm
                      ${
                        selected
                          ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                          : "border-[#D4AF37]/70 bg-[#111] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      }
                    `}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
          </div>
          {/* הערות */}
          <div>
            <label
              htmlFor="contact-notes"
              className="mb-2 block text-sm font-bold text-[#D4AF37] sm:mb-3 sm:text-base"
            >
              ספרו לנו קצת על האירוע
            </label>
            <textarea
              id="contact-notes"
              rows={4}
              placeholder="רעיונות, בקשות מיוחדות או פרטים נוספים..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} resize-y leading-7`}
            />
          </div>
          {/* שליחה */}
          <div className="pt-1 text-center sm:pt-3">
            <button
              type="submit"
              disabled={sending}
              className="
                w-full max-w-md rounded-xl
                bg-[#D4AF37] px-6 py-4
                text-base font-bold text-black
                transition-colors duration-300
                hover:bg-[#c9a227]
                active:scale-[0.99]
                disabled:cursor-not-allowed disabled:opacity-60
                sm:w-auto sm:px-12 sm:text-lg
                sm:hover:shadow-2xl
                sm:hover:shadow-[#D4AF37]/30
              "
            >
              {sending ? "שולח את הבקשה..." : "שלחו בקשה להצעת מחיר"}
            </button>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              הפרטים יישמרו במערכת והבקשה תועבר ל-WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}