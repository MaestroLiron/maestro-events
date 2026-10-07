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

export default function Contact() {
  const [eventDate, setEventDate] = useState<Date | null>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service]
    );
  };

  const sendToWhatsApp = async () => {
    if (!fullName.trim() || !phone.trim() || !eventType.trim()) {
      alert("נא למלא שם מלא, טלפון וסוג האירוע.");
      return;
    }

    try {
      // ==========================================
      // שמירת הליד במסד הנתונים
      // ==========================================

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
          eventDate: eventDate
            ? eventDate.toISOString()
            : null,
          guests: guests || null,
          services: selectedServices,
          notes: notes.trim() || null,
        }),
      });

      // ==========================================
      // קריאת תשובת השרת בצורה בטוחה
      // מונע Unexpected end of JSON input
      // ==========================================

      const responseText = await response.text();

      let data: any = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error(
            "❌ Failed to parse server response:",
            jsonError
          );

          console.error(
            "Server response:",
            responseText
          );
        }
      }

      // ==========================================
      // בדיקת הצלחת שמירת הליד
      // ==========================================

      if (!response.ok) {
        console.error("❌ Lead save error:", {
          status: response.status,
          statusText: response.statusText,
          data,
          responseText,
        });

        if (response.status === 405) {
          alert(
            "השרת לא מאפשר POST לכתובת /api/leads. נבדוק עכשיו את קובץ ה-route של הלידים."
          );
        } else {
          alert(
            data?.error ||
              "לא הצלחנו לשמור את הפרטים. נסו שוב."
          );
        }

        return;
      }

      console.log("✅ Lead saved:", data);

      // ==========================================
      // הכנת ההודעה לוואטסאפ
      // ==========================================

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
    ? selectedServices
        .map((service) => `✔ ${service}`)
        .join("\n")
    : "לא נבחרו"
}

📝 הערות:
${notes || "אין"}
`;

      // ==========================================
      // פתיחת וואטסאפ
      // ==========================================

      const url = `https://wa.me/972528913271?text=${encodeURIComponent(
        message
      )}`;

      window.open(url, "_blank");
    } catch (error) {
      console.error("❌ Send lead error:", error);

      alert(
        "אירעה שגיאה בשליחת הבקשה. נסו שוב."
      );
    }
  };

  return (
    <section
      id="contact"
      dir="rtl"
      className="bg-[#090909] py-24 text-right"
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* ==========================================
            כותרת דקורטיבית
        ========================================== */}

        <div className="flex items-center justify-center mb-8">

          <div className="flex-1 max-w-[180px] h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37]" />

          <span className="mx-4 text-[#D4AF37] text-lg">
            ◆
          </span>

          <span className="mx-2 uppercase tracking-[10px] text-[#D4AF37] text-sm font-semibold">
            Maestro Events
          </span>

          <span className="mx-4 text-[#D4AF37] text-lg">
            ◆
          </span>

          <div className="flex-1 max-w-[180px] h-px bg-gradient-to-l from-transparent via-[#D4AF37] to-[#D4AF37]" />

        </div>

        {/* ==========================================
            כותרת
        ========================================== */}

        <h2 className="text-5xl font-bold text-center text-[#D4AF37] mb-4">
          קבלו הצעת מחיר
        </h2>

        <p className="text-center text-gray-400 mb-14">
          נשמח לחזור אליכם עם הצעה מותאמת אישית.
        </p>

        <form className="space-y-8">

          {/* ==========================================
              פרטי לקוח ואירוע
          ========================================== */}

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="שם מלא"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="text-right bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <input
              type="tel"
              placeholder="טלפון"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="text-right bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <input
              type="email"
              placeholder="אימייל (לא חובה)"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="text-right bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <select
              value={eventType}
              onChange={(e) =>
                setEventType(e.target.value)
              }
              className="text-right bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="">
                בחר סוג אירוע
              </option>

              <option>חתונה</option>
              <option>בר מצווה</option>
              <option>בת מצווה</option>
              <option>חינה</option>
              <option>ברית / בריתה</option>
              <option>יום הולדת</option>
              <option>אירוע עסקי</option>
              <option>אחר</option>
            </select>

            {/* תאריך */}

            <div className="w-full">

              <DatePicker
                selected={eventDate}
                onChange={(date: Date | null) =>
                  setEventDate(date)
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="📅 בחרו תאריך"
                wrapperClassName="w-full"
                calendarClassName="maestro-calendar"
                popperClassName="maestro-popper"
                className="
                  text-right
                  w-full
                  bg-[#111]
                  border
                  border-[#2d2d2d]
                  rounded-2xl
                  px-5
                  py-4
                  text-white
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#D4AF37]
                  hover:border-[#D4AF37]
                  shadow-lg
                "
              />

            </div>

            {/* מספר מוזמנים */}

            <input
              type="number"
              placeholder="מספר מוזמנים"
              value={guests}
              onChange={(e) =>
                setGuests(e.target.value)
              }
              className="text-right bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37]"
            />

          </div>

          {/* ==========================================
              שירותים
          ========================================== */}

          <div>

            <h3 className="text-2xl font-bold text-[#D4AF37] text-center mb-8">
              אילו שירותים מעניינים אתכם?
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">

              {services.map((service) => {

                const selected =
                  selectedServices.includes(service);

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() =>
                      toggleService(service)
                    }
                    className={`
                      px-6
                      py-3
                      rounded-full
                      font-semibold
                      border
                      transition-all
                      duration-300
                      hover:scale-105
                      ${
                        selected
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30"
                          : "bg-[#111] text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      }
                    `}
                  >
                    {service}
                  </button>
                );

              })}

            </div>

          </div>

          {/* ==========================================
              הערות
          ========================================== */}

          <div>

            <label className="block text-[#D4AF37] font-bold mb-3">
              ספרו לנו קצת על האירוע
            </label>

            <textarea
              rows={6}
              placeholder="ספרו לנו קצת על האירוע..."
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full bg-[#111] border border-[#2d2d2d] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#D4AF37] resize-none"
            />

          </div>

          {/* ==========================================
              כפתור שליחה
          ========================================== */}

          <div className="text-center pt-4">

            <button
              type="button"
              onClick={sendToWhatsApp}
              className="
                bg-[#D4AF37]
                text-black
                font-bold
                text-lg
                px-12
                py-4
                rounded-2xl
                transition-all
                duration-300
                hover:bg-[#c9a227]
                hover:scale-105
                hover:shadow-2xl
                hover:shadow-[#D4AF37]/30
              "
            >
              שלחו בקשה להצעת מחיר
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}