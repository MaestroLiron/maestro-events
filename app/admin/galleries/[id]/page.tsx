"use client";

import { useParams, useRouter } from "next/navigation";

export default function GalleryManagementPage() {
  const params = useParams();
  const router = useRouter();

  const galleryId = params.id;

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-[#090909]
        text-white
        p-4
        md:p-8
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

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

            <div className="flex items-center gap-3 mb-3">

              <button
                type="button"
                onClick={() => router.push("/admin/galleries")}
                className="
                  w-10
                  h-10
                  rounded-xl
                  border
                  border-[#333]
                  text-gray-300
                  hover:border-[#D4AF37]
                  hover:text-[#D4AF37]
                  transition
                "
              >
                →
              </button>

              <span className="text-3xl">
                📸
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
                ניהול גלריה
              </h1>

            </div>

            <p className="text-gray-400">
              ניהול התמונות והפרטים של הגלריה
            </p>

          </div>

          <div
            className="
              px-4
              py-2
              rounded-xl
              border
              border-[#D4AF37]/30
              text-[#D4AF37]
              bg-[#D4AF37]/5
            "
          >
            מזהה גלריה: {galleryId}
          </div>

        </div>

        {/* ================================= */}
        {/* MAIN */}
        {/* ================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================================= */}
          {/* GALLERY INFO */}
          {/* ================================= */}

          <div
            className="
              lg:col-span-2
              bg-[#111]
              border
              border-[#2a2a2a]
              rounded-3xl
              p-6
              md:p-8
            "
          >

            <div className="flex items-center gap-3 mb-6">

              <span className="text-2xl">
                🖼️
              </span>

              <h2 className="text-2xl font-bold">
                תמונות הגלריה
              </h2>

            </div>

            <div
              className="
                min-h-[350px]
                rounded-2xl
                border
                border-dashed
                border-[#333]
                bg-[#0b0b0b]
                flex
                flex-col
                items-center
                justify-center
                text-center
                p-8
              "
            >

              <div className="text-6xl mb-5">
                📸
              </div>

              <h3 className="text-xl font-bold mb-2">
                עדיין אין תמונות
              </h3>

              <p className="text-gray-500 max-w-md">
                בשלב הבא נחבר כאן את מערכת העלאת התמונות
                ואת האפשרות להעלות תיקייה שלמה בבת אחת.
              </p>

            </div>

          </div>

          {/* ================================= */}
          {/* SIDE PANEL */}
          {/* ================================= */}

          <div
            className="
              bg-[#111]
              border
              border-[#2a2a2a]
              rounded-3xl
              p-6
            "
          >

            <h2 className="text-xl font-bold mb-6">
              פעולות
            </h2>

            <div className="space-y-3">

              <button
                type="button"
                className="
                  w-full
                  bg-[#D4AF37]
                  text-black
                  font-bold
                  py-4
                  rounded-xl
                  hover:scale-[1.02]
                  transition
                "
              >
                + הוספת תמונות
              </button>

              <button
                type="button"
                className="
                  w-full
                  border
                  border-[#333]
                  text-gray-300
                  py-4
                  rounded-xl
                  hover:border-[#D4AF37]
                  hover:text-[#D4AF37]
                  transition
                "
              >
                📁 העלאת תיקייה
              </button>

            </div>

            <div className="border-t border-[#222] my-6" />

            <div className="space-y-4">

              <div>
                <div className="text-gray-500 text-sm mb-1">
                  מספר תמונות
                </div>

                <div className="text-2xl font-bold">
                  0
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-1">
                  מזהה
                </div>

                <div className="text-gray-300">
                  {galleryId}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}