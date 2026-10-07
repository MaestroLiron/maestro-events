"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";
import Image from "next/image";

// ======================================================
// TYPES
// ======================================================

type Service = {
  id: number;
  title: string;
  image: string;
};

// ======================================================
// PAGE
// ======================================================

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File | null>
  >({});

  const [previews, setPreviews] = useState<
    Record<number, string>
  >({});

  const [savingId, setSavingId] = useState<number | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ====================================================
  // LOAD SERVICES
  // ====================================================

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה בטעינת השירותים"
        );
      }

      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load services error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה בטעינת השירותים"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  // ====================================================
  // SELECT IMAGE
  // ====================================================

  function handleImageChange(
    serviceId: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "סוג הקובץ אינו נתמך. ניתן להעלות JPG, PNG, WEBP או GIF."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "התמונה גדולה מדי. הגודל המקסימלי הוא 10MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [serviceId]: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    setPreviews((previous) => ({
      ...previous,
      [serviceId]: previewUrl,
    }));
  }

  // ====================================================
  // SAVE IMAGE
  // ====================================================

  async function saveImage(serviceId: number) {
    const file = selectedFiles[serviceId];

    if (!file) {
      setError("יש לבחור תמונה חדשה לפני השמירה.");
      return;
    }

    try {
      setSavingId(serviceId);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        `/api/services/${serviceId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה בעדכון התמונה"
        );
      }

      setSuccess("התמונה עודכנה בהצלחה.");

      setSelectedFiles((previous) => ({
        ...previous,
        [serviceId]: null,
      }));

      setPreviews((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[serviceId];

        return updated;
      });

      await loadServices();
    } catch (error) {
      console.error(
        "Update service image error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "שגיאה בעדכון התמונה"
      );
    } finally {
      setSavingId(null);
    }
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#080808]
        text-white
        px-6
        pt-24
        pb-10
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <h1
            className="
              text-3xl
              md:text-4xl
              font-bold
              text-[#D4AF37]
            "
          >
            ניהול שירותים
          </h1>

          <p className="text-gray-400 mt-3">
            כאן ניתן להחליף את התמונות של השירותים באתר
          </p>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              text-red-300
              px-5
              py-4
            "
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-green-500/30
              bg-green-500/10
              text-green-300
              px-5
              py-4
            "
          >
            {success}
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="flex justify-center py-20">

            <div
              className="
                w-10
                h-10
                rounded-full
                border-4
                border-[#D4AF37]/20
                border-t-[#D4AF37]
                animate-spin
              "
            />

          </div>

        ) : services.length === 0 ? (

          /* ==================================================
              EMPTY
          ================================================== */

          <div
            className="
              rounded-3xl
              border
              border-[#2a2a2a]
              bg-[#111]
              py-20
              text-center
            "
          >

            <div className="text-5xl mb-4">
              📦
            </div>

            <h2 className="text-2xl font-bold">
              אין שירותים במערכת
            </h2>

            <p className="text-gray-500 mt-2">
              השירותים מוגדרים דרך קוד האתר.
            </p>

          </div>

        ) : (

          /* ==================================================
              SERVICES
          ================================================== */

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >

            {services.map((service) => {

              const preview =
                previews[service.id];

              const selectedFile =
                selectedFiles[service.id];

              const isSaving =
                savingId === service.id;

              return (
                <div
                  key={service.id}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#2a2a2a]
                    bg-[#111]
                  "
                >

                  {/* ==================================================
                      IMAGE
                  ================================================== */}

                  <div
                    className="
                      relative
                      aspect-[4/3]
                      bg-black
                    "
                  >

                    <Image
                      src={
                        preview ||
                        service.image
                      }
                      alt={service.title}
                      fill
                      unoptimized={Boolean(preview)}
                      className="object-cover"
                    />

                    {preview && (
                      <div
                        className="
                          absolute
                          top-3
                          right-3
                          rounded-full
                          bg-[#D4AF37]
                          text-black
                          px-3
                          py-1
                          text-xs
                          font-bold
                        "
                      >
                        תמונה חדשה
                      </div>
                    )}

                  </div>

                  {/* ==================================================
                      CONTENT
                  ================================================== */}

                  <div className="p-5">

                    <h2
                      className="
                        text-xl
                        font-bold
                        text-[#D4AF37]
                        mb-5
                      "
                    >
                      {service.title}
                    </h2>

                    {/* ==================================================
                        FILE SELECT
                    ================================================== */}

                    <label
                      htmlFor={`service-image-${service.id}`}
                      className="
                        flex
                        items-center
                        justify-center
                        min-h-[55px]
                        rounded-xl
                        border
                        border-dashed
                        border-[#D4AF37]/50
                        bg-[#0b0b0b]
                        text-[#D4AF37]
                        cursor-pointer
                        hover:bg-[#D4AF37]/5
                        hover:border-[#D4AF37]
                        transition
                        px-4
                        text-center
                        font-semibold
                      "
                    >
                      📁 בחר תמונה חדשה
                    </label>

                    <input
                      id={`service-image-${service.id}`}
                      type="file"
                      accept="
                        image/jpeg,
                        image/jpg,
                        image/png,
                        image/webp,
                        image/gif
                      "
                      onChange={(event) =>
                        handleImageChange(
                          service.id,
                          event
                        )
                      }
                      className="hidden"
                    />

                    {/* ==================================================
                        FILE NAME
                    ================================================== */}

                    {selectedFile && (
                      <div
                        className="
                          mt-3
                          text-sm
                          text-gray-400
                          break-all
                        "
                      >
                        נבחרה:

                        <span className="text-white mr-2">
                          {selectedFile.name}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        SAVE
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        saveImage(service.id)
                      }
                      disabled={
                        !selectedFile ||
                        isSaving
                      }
                      className="
                        w-full
                        mt-4
                        min-h-[50px]
                        rounded-xl
                        bg-[#D4AF37]
                        text-black
                        font-bold
                        hover:bg-[#e6c34d]
                        transition
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      {isSaving
                        ? "מעלה תמונה..."
                        : "שמור תמונה"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}