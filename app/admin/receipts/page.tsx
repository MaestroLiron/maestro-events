"use client";

export default function ReceiptsPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#111111] text-white p-4 md:p-8"
    >
      <div className="max-w-5xl mx-auto">

        {/* כותרת */}
        <div className="mb-10">
          <div className="text-[#D4AF37] text-sm font-bold tracking-[0.25em] mb-2">
            MAESTRO EVENTS
          </div>

          <h1 className="text-3xl md:text-4xl font-black">
            מערכת הקבלות
          </h1>

          <p className="text-gray-400 mt-2">
            ניהול והפקת קבלות ללקוחות
          </p>
        </div>

        {/* כרטיס */}
        <div className="min-h-[450px] flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-[#D4AF37]/30 bg-white/5 p-10 md:p-16 text-center shadow-2xl">

            {/* אייקון */}
            <div className="text-7xl mb-8">
              🧾
            </div>

            {/* כותרת */}
            <h2 className="text-3xl md:text-4xl font-black mb-5">
              מערכת הקבלות
            </h2>

            {/* הודעה */}
            <p className="text-xl md:text-2xl text-[#D4AF37] font-black mb-4">
              המערכת תחובר בקרוב!
            </p>

            <p className="text-gray-400 text-base md:text-lg leading-8 max-w-lg mx-auto">
              אנחנו עובדים על חיבור מערכת הקבלות ל־Maestro Events.
              <br />
              בקרוב ניתן יהיה להפיק ולנהל קבלות ישירות מהמערכת.
            </p>

            {/* פס עיצוב */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <div className="w-16 h-px bg-[#D4AF37]/40" />

              <div className="w-2 h-2 rotate-45 bg-[#D4AF37]" />

              <div className="w-16 h-px bg-[#D4AF37]/40" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}