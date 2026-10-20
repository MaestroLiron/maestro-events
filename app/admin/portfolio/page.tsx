"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ==========================================
// TYPES
// ==========================================

type PortfolioImage = {
  id: number;
  url: string;
  title: string | null;
  alt: string | null;
  sortOrder: number;
  isActive: boolean;
  categoryId: number;
};

type PortfolioVideo = {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  categoryId: number;
};

type PortfolioCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  images: PortfolioImage[];
  videos: PortfolioVideo[];
};

// ==========================================
// COMPONENT
// ==========================================

export default function AdminPortfolioPage() {
  // ========================================
  // DATA
  // ========================================

  const [categories, setCategories] = useState<
    PortfolioCategory[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [managingCategory, setManagingCategory] =
  useState<PortfolioCategory | null>(null);

const [newGalleryFiles, setNewGalleryFiles] =
  useState<FileList | null>(null);

const [savingGalleryImages, setSavingGalleryImages] =
  useState(false);

  // ========================================
  // CATEGORY FORM
  // ========================================

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");

  // ========================================
  // IMAGE FORM
  // ========================================

  const [imageUrl, setImageUrl] =
    useState("");

  const [imageTitle, setImageTitle] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  // ========================================
  // VIDEO FORM
  // ========================================

  const [videoUrl, setVideoUrl] =
    useState("");

  const [videoTitle, setVideoTitle] =
    useState("");

  const [videoDescription, setVideoDescription] =
    useState("");

  const [videoThumbnailUrl, setVideoThumbnailUrl] =
    useState("");

  const [selectedVideoCategory, setSelectedVideoCategory] =
    useState("");

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [uploadingVideo, setUploadingVideo] =
    useState(false);

  // ========================================
  // UI
  // ========================================

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">(
      "info"
    );

  const [creatingCategory, setCreatingCategory] =
    useState(false);

  const [addingImage, setAddingImage] =
    useState(false);

  const [addingVideo, setAddingVideo] =
    useState(false);

  // ==========================================
  // MESSAGE
  // ==========================================

  const showMessage = (
    text: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // ==========================================
  // טעינת תיק העבודות
  // ==========================================

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/portfolio",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load portfolio"
        );
      }

      const data =
        await response.json();

      // ======================================
      // הגנה מפני נתונים חסרים
      // ======================================

      const normalizedCategories =
        Array.isArray(data)
          ? data.map((category: any) => ({
              ...category,

              images:
                Array.isArray(
                  category?.images
                )
                  ? category.images
                  : [],

              videos:
                Array.isArray(
                  category?.videos
                )
                  ? category.videos
                  : [],
            }))
          : [];

      setCategories(
        normalizedCategories
      );
    } catch (error) {
      console.error(
        "שגיאה בטעינת תיק העבודות:",
        error
      );

      showMessage(
        "אירעה שגיאה בטעינת תיק העבודות",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // טעינה ראשונית
  // ==========================================

  useEffect(() => {
    loadPortfolio();
  }, []);

  // ==========================================
  // יצירת קטגוריה
  // ==========================================

  const createCategory = async () => {
    if (!categoryName.trim()) {
      showMessage(
        "חובה להזין שם קטגוריה",
        "error"
      );

      return;
    }

    try {
      setCreatingCategory(true);

      const response = await fetch(
        "/api/portfolio",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "createCategory",

            name:
              categoryName.trim(),

            description:
              categoryDescription.trim() ||
              "",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה ביצירת הקטגוריה"
        );
      }

      setCategoryName("");
      setCategoryDescription("");

      showMessage(
        "הקטגוריה נוצרה בהצלחה",
        "success"
      );

      await loadPortfolio();
    } catch (error) {
      console.error(
        "שגיאה ביצירת קטגוריה:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה ביצירת הקטגוריה",
        "error"
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  // ==========================================
  // העלאת תמונה מהמחשב
  // ==========================================

  const uploadImage = async (
    file: File
  ) => {
    try {
      setUploadingImage(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "mediaType",
        "image"
      );

      const response =
        await fetch(
          "/api/portfolio/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בהעלאת התמונה"
        );
      }

      setImageUrl(
        data.url
      );

      showMessage(
        "התמונה הועלתה בהצלחה",
        "success"
      );

      return data.url;
    } catch (error) {
      console.error(
        "שגיאה בהעלאת תמונה:",
        error
      );

      setImageFile(null);

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה בהעלאת התמונה",
        "error"
      );

      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // ==========================================
  // הוספת תמונה
  // ==========================================

  const addImage = async () => {
    if (!selectedCategory) {
      showMessage(
        "בחר קטגוריה",
        "error"
      );

      return;
    }

    if (!imageFile && !imageUrl.trim()) {
      showMessage(
        "בחר תמונה מהמחשב או הזן כתובת תמונה",
        "error"
      );

      return;
    }

    try {
      setAddingImage(true);

      let finalImageUrl =
        imageUrl.trim();

      // ==========================================
      // אם נבחר קובץ מהמחשב
      // ==========================================

      if (imageFile) {
        setUploadingImage(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          imageFile
        );

        formData.append(
          "mediaType",
          "image"
        );

        const uploadResponse =
          await fetch(
            "/api/portfolio/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const uploadData =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData?.error ||
              "שגיאה בהעלאת התמונה"
          );
        }

        finalImageUrl =
          uploadData.url;

        setImageUrl(
          uploadData.url
        );

        setUploadingImage(false);
      }

      // ==========================================
      // שמירת התמונה בתיק העבודות
      // ==========================================

      const response =
        await fetch(
          "/api/portfolio",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "createImage",

              categoryId:
                Number(
                  selectedCategory
                ),

              url:
                finalImageUrl,

              title:
                imageTitle.trim() ||
                "",

              alt:
                imageTitle.trim() ||
                "",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בשמירת התמונה"
        );
      }

      // ==========================================
      // ניקוי הטופס
      // ==========================================

      setImageFile(null);
      setImageUrl("");
      setImageTitle("");

      const fileInput =
        document.getElementById(
          "portfolio-image-input"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      showMessage(
        "התמונה הועלתה ונוספה בהצלחה 🎉",
        "success"
      );

      await loadPortfolio();

    } catch (error) {
      console.error(
        "שגיאה בהעלאת תמונה:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה בהעלאת התמונה",
        "error"
      );
    } finally {
      setUploadingImage(false);
      setAddingImage(false);
    }
  };

  // ==========================================
  // העלאת סרטון מהמחשב
  // ==========================================

  const uploadVideo = async (
    file: File
  ) => {
    try {
      setUploadingVideo(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "mediaType",
        "video"
      );

      const response =
        await fetch(
          "/api/portfolio/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בהעלאת הסרטון"
        );
      }

      setVideoUrl(
        data.url
      );

      showMessage(
        "הסרטון הועלה בהצלחה",
        "success"
      );

      return data.url;

    } catch (error) {
      console.error(
        "שגיאה בהעלאת סרטון:",
        error
      );

      setVideoFile(null);

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה בהעלאת הסרטון",
        "error"
      );

      return null;

    } finally {
      setUploadingVideo(false);
    }
  };

  // ==========================================
  // הוספת סרטון
  // ==========================================

  const addVideo = async () => {
    if (!selectedVideoCategory) {
      showMessage(
        "בחר קטגוריה לסרטון",
        "error"
      );

      return;
    }

    if (
      !videoFile &&
      !videoUrl.trim()
    ) {
      showMessage(
        "בחר סרטון מהמחשב או הזן כתובת סרטון",
        "error"
      );

      return;
    }

    try {
      setAddingVideo(true);

      let finalVideoUrl =
        videoUrl.trim();

      // ==========================================
      // אם נבחר סרטון מהמחשב
      // ==========================================

      if (videoFile) {
        setUploadingVideo(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          videoFile
        );

        formData.append(
          "mediaType",
          "video"
        );

        const uploadResponse =
          await fetch(
            "/api/portfolio/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const uploadData =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData?.error ||
              "שגיאה בהעלאת הסרטון"
          );
        }

        finalVideoUrl =
          uploadData.url;

        setVideoUrl(
          uploadData.url
        );

        setUploadingVideo(false);
      }

      // ==========================================
      // שמירת הסרטון בתיק העבודות
      // ==========================================

      const response =
        await fetch(
          "/api/portfolio",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "createVideo",

              categoryId:
                Number(
                  selectedVideoCategory
                ),

              url:
                finalVideoUrl,

              title:
                videoTitle.trim() ||
                "",

              description:
                videoDescription.trim() ||
                "",

              thumbnailUrl:
                videoThumbnailUrl.trim() ||
                "",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה בשמירת הסרטון"
        );
      }

      // ==========================================
      // ניקוי הטופס
      // ==========================================

      setVideoFile(null);
      setVideoUrl("");
      setVideoTitle("");
      setVideoDescription("");
      setVideoThumbnailUrl("");

      const videoInput =
        document.getElementById(
          "portfolio-video-input"
        ) as HTMLInputElement | null;

      if (videoInput) {
        videoInput.value = "";
      }

      showMessage(
        "הסרטון הועלה ונוסף בהצלחה 🎬",
        "success"
      );

      await loadPortfolio();

    } catch (error) {
      console.error(
        "שגיאה בהוספת סרטון:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה בהוספת הסרטון",
        "error"
      );

    } finally {
      setUploadingVideo(false);
      setAddingVideo(false);
    }
  };

  // ==========================================
  // מחיקת קטגוריה
  // ==========================================

  const deleteCategory = async (
    categoryId: number,
    categoryName: string
  ) => {
    const confirmed =
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את הקטגוריה "${categoryName}"?\n\nכל התמונות והסרטונים שבתוכה יימחקו גם הם.`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          "/api/portfolio",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              type: "category",
              id: categoryId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "שגיאה במחיקת הקטגוריה"
        );
      }

      showMessage(
        "הקטגוריה נמחקה בהצלחה",
        "success"
      );

      await loadPortfolio();

    } catch (error) {
      console.error(
        "שגיאה במחיקת קטגוריה:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה במחיקת הקטגוריה",
        "error"
      );
    }
  };

  const addImagesToGallery = async () => {
  if (!managingCategory || !newGalleryFiles?.length) {
    alert("בחר תמונות להוספה");
    return;
  }

  setSavingGalleryImages(true);

  try {
    for (const file of Array.from(newGalleryFiles)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", "image");

      const uploadResponse = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error("העלאת תמונה נכשלה");
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createImage",
          categoryId: managingCategory.id,
          url: uploadData.url,
          title: file.name,
          alt: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("שמירת תמונה בגלריה נכשלה");
      }
    }

    setNewGalleryFiles(null);
    await loadPortfolio();
    alert("התמונות נוספו בהצלחה");
  } catch (error) {
    console.error(error);
    alert("לא הצלחנו להוסיף את כל התמונות");
    await loadPortfolio();
  } finally {
    setSavingGalleryImages(false);
  }
};

  // ==========================================
  // מחיקת תמונה בודדת
  // ==========================================

  const deleteImage = async (
    image: PortfolioImage
  ) => {
    const confirmed = window.confirm(
      `למחוק את התמונה "${image.title || "ללא כותרת"}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/portfolio",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "image",
            id: image.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "שגיאה במחיקת התמונה"
        );
      }

      showMessage("התמונה נמחקה בהצלחה", "success");
      await loadPortfolio();
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "שגיאה במחיקת התמונה",
        "error"
      );
    }
  };
  
  // ==========================================
  // מספר תמונות
  // ==========================================

  const getImageCount = (
    category: PortfolioCategory
  ) => {
    return Array.isArray(
      category.images
    )
      ? category.images.length
      : 0;
  };

  // ==========================================
  // מספר סרטונים
  // ==========================================

  const getVideoCount = (
    category: PortfolioCategory
  ) => {
    return Array.isArray(
      category.videos
    )
      ? category.videos.length
      : 0;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#090909]
        text-white
        p-6
        md:p-10
        pt-24
        md:pt-28
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}

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
                text-sm
                tracking-[0.3em]
                mb-3
              "
            >
              MAESTRO EVENTS
            </p>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-bold
              "
            >
              תיק עבודות
            </h1>

            <p className="text-gray-500 mt-3">
              ניהול קטגוריות, תמונות,
              סרטונים וסדר התצוגה באתר.
            </p>

          </div>

          <Link
            href="/admin"
            className="
              inline-flex
              items-center
              justify-center
              border
              border-[#D4AF37]
              text-[#D4AF37]
              px-6
              py-3
              rounded-xl
              hover:bg-[#D4AF37]
              hover:text-black
              transition
              font-semibold
            "
          >
            ← חזרה לדאשבורד
          </Link>

        </div>

        {/* ======================================
            הודעה
        ====================================== */}

        {message && (
          <div
            className={`
              mb-6
              rounded-xl
              border
              p-4

              ${
                messageType ===
                "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : messageType ===
                    "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* ======================================
            יצירת קטגוריה
        ====================================== */}

        <section
          className="
            bg-[#111]
            border
            border-[#292929]
            rounded-2xl
            p-6
            md:p-8
            mb-8
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            📁 יצירת קטגוריה חדשה
          </h2>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <input
              value={categoryName}
              onChange={(e) =>
                setCategoryName(
                  e.target.value
                )
              }
              placeholder="שם הקטגוריה"
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            />

            <input
              value={
                categoryDescription
              }
              onChange={(e) =>
                setCategoryDescription(
                  e.target.value
                )
              }
              placeholder="תיאור הקטגוריה"
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            />

          </div>

          <button
            onClick={createCategory}
            disabled={
              creatingCategory
            }
            className="
              mt-4
              bg-[#D4AF37]
              text-black
              font-bold
              px-6
              py-3
              rounded-xl
              hover:bg-[#e5c451]
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {creatingCategory
              ? "יוצר..."
              : "+ צור קטגוריה"}
          </button>

        </section>

        {/* ======================================
            הוספת תמונה
        ====================================== */}

        <section
          className="
            bg-[#111]
            border
            border-[#292929]
            rounded-2xl
            p-6
            md:p-8
            mb-8
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-2
            "
          >
            🖼️ הוספת תמונה
          </h2>

          <p
            className="
              text-gray-500
              text-sm
              mb-6
            "
          >
            ניתן להעלות תמונה מהמחשב
            או להשתמש בכתובת תמונה.
          </p>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >

            <select
              value={
                selectedCategory
              }
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            >

              <option value="">
                בחר קטגוריה
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}

            </select>

            <input
              id="portfolio-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                const file =
                  e.target.files?.[0] ||
                  null;

                setImageFile(file);

                if (file) {
                  setImageUrl("");
                }
              }}
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
                text-sm
              "
            />

            <input
              value={imageTitle}
              onChange={(e) =>
                setImageTitle(
                  e.target.value
                )
              }
              placeholder="כותרת התמונה"
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            />

          </div>

          <input
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(
                e.target.value
              )
            }
            placeholder="או הזן כתובת התמונה"
            className="
              w-full
              mt-4
              bg-[#090909]
              border
              border-[#292929]
              rounded-xl
              px-4
              py-3
              outline-none
              focus:border-[#D4AF37]
            "
          />

          {imageFile && (
            <p className="text-gray-400 text-sm mt-3">
              📎 נבחר:
              {" "}
              {imageFile.name}
            </p>
          )}

          <button
            onClick={addImage}
            disabled={
              addingImage ||
              uploadingImage
            }
            className="
              mt-4
              bg-[#D4AF37]
              text-black
              font-bold
              px-6
              py-3
              rounded-xl
              hover:bg-[#e5c451]
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {uploadingImage
              ? "מעלה תמונה..."
              : addingImage
              ? "שומר..."
              : "+ הוסף תמונה"}
          </button>

        </section>

        {/* ======================================
            הוספת סרטון
        ====================================== */}

        <section
          className="
            bg-[#111]
            border
            border-[#292929]
            rounded-2xl
            p-6
            md:p-8
            mb-10
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-2
            "
          >
            🎬 הוספת סרטון
          </h2>

          <p
            className="
              text-gray-500
              text-sm
              mb-6
            "
          >
            ניתן להעלות סרטון מהמחשב
            או להוסיף כתובת של סרטון.
            ניתן להעלות MP4, WEBM, MOV או AVI
            עד 200MB.
          </p>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            {/* CATEGORY */}

            <select
              value={
                selectedVideoCategory
              }
              onChange={(e) =>
                setSelectedVideoCategory(
                  e.target.value
                )
              }
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            >

              <option value="">
                בחר קטגוריה
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}

            </select>

            {/* VIDEO FILE */}

            <input
              id="portfolio-video-input"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={(e) => {
                const file =
                  e.target.files?.[0] ||
                  null;

                setVideoFile(file);

                if (file) {
                  setVideoUrl("");
                }
              }}
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
                text-sm
              "
            />

            {/* TITLE */}

            <input
              value={videoTitle}
              onChange={(e) =>
                setVideoTitle(
                  e.target.value
                )
              }
              placeholder="כותרת הסרטון"
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            />

            {/* THUMBNAIL */}

            <input
              value={
                videoThumbnailUrl
              }
              onChange={(e) =>
                setVideoThumbnailUrl(
                  e.target.value
                )
              }
              placeholder="כתובת תמונת הסרטון (אופציונלי)"
              className="
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#D4AF37]
              "
            />

          </div>

          {/* VIDEO URL */}

          <input
            value={videoUrl}
            onChange={(e) =>
              setVideoUrl(
                e.target.value
              )
            }
            placeholder="או הזן כתובת סרטון"
            className="
              w-full
              mt-4
              bg-[#090909]
              border
              border-[#292929]
              rounded-xl
              px-4
              py-3
              outline-none
              focus:border-[#D4AF37]
            "
          />

          {/* FILE NAME */}

          {videoFile && (
            <div
              className="
                mt-3
                bg-[#090909]
                border
                border-[#292929]
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-400
              "
            >
              🎬 נבחר סרטון:
              {" "}
              <span className="text-white">
                {videoFile.name}
              </span>

              <span className="text-gray-600 mr-2">
                (
                {(
                  videoFile.size /
                  (1024 * 1024)
                ).toFixed(1)}
                MB)
              </span>
            </div>
          )}

          {/* DESCRIPTION */}

          <textarea
            value={
              videoDescription
            }
            onChange={(e) =>
              setVideoDescription(
                e.target.value
              )
            }
            placeholder="תיאור הסרטון (אופציונלי)"
            rows={3}
            className="
              w-full
              mt-4
              bg-[#090909]
              border
              border-[#292929]
              rounded-xl
              px-4
              py-3
              outline-none
              focus:border-[#D4AF37]
              resize-none
            "
          />

          {/* BUTTON */}

          <button
            onClick={addVideo}
            disabled={
              addingVideo ||
              uploadingVideo
            }
            className="
              mt-4
              bg-[#D4AF37]
              text-black
              font-bold
              px-6
              py-3
              rounded-xl
              hover:bg-[#e5c451]
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {uploadingVideo
              ? "מעלה סרטון..."
              : addingVideo
              ? "שומר..."
              : "+ הוסף סרטון"}
          </button>

        </section>

        {/* ======================================
            הקטגוריות
        ====================================== */}

        <section>

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            📸 הקטגוריות שלך
          </h2>

          {loading ? (

            <div
              className="
                text-center
                py-16
                text-gray-500
              "
            >
              טוען תיק עבודות...
            </div>

          ) : categories.length === 0 ? (

            <div
              className="
                bg-[#111]
                border
                border-[#292929]
                rounded-2xl
                p-12
                text-center
              "
            >

              <div
                className="
                  text-5xl
                  mb-4
                "
              >
                📁
              </div>

              <h3
                className="
                  text-xl
                  font-bold
                  mb-2
                "
              >
                עדיין אין קטגוריות
              </h3>

              <p className="text-gray-500">
                צור את הקטגוריה הראשונה
                שלך למעלה.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
              "
            >

              {categories.map(
                (category) => {

                  const images =
                    Array.isArray(
                      category.images
                    )
                      ? category.images
                      : [];

                  const videos =
                    Array.isArray(
                      category.videos
                    )
                      ? category.videos
                      : [];

                  return (
                    <div
                      key={
                        category.id
                      }
                      className="
                        bg-[#111]
                        border
                        border-[#292929]
                        rounded-2xl
                        overflow-hidden
                      "
                    >

                      {/* CATEGORY HEADER */}

                      <div
                        className="
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >

                          <div>

                            <h3
                              className="
                                text-xl
                                font-bold
                              "
                            >
                              {
                                category.name
                              }
                            </h3>

                            {category.description && (
                              <p
                                className="
                                  text-gray-500
                                  text-sm
                                  mt-2
                                "
                              >
                                {
                                  category.description
                                }
                              </p>
                            )}

                          </div>

                          <span
                            className="
                              text-xs
                              px-3
                              py-1
                              rounded-full
                              border
                              border-[#D4AF37]/30
                              text-[#D4AF37]
                            "
                          >
                            {category.isActive
                              ? "פעיל"
                              : "מושבת"}
                          </span>

                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            deleteCategory(
                              category.id,
                              category.name
                            )
                          }
                          className="
                            mt-3
                            text-red-400
                            border
                            border-red-500/30
                            bg-red-500/10
                            hover:bg-red-500
                            hover:text-white
                            px-3
                            py-2
                            rounded-lg
                            text-sm
                            transition
                          "
                        >
                          🗑️ מחק קטגוריה
                        </button>

                        {/* COUNTERS */}

                        <div
                          className="
                            flex
                            gap-4
                            mt-5
                          "
                        >
{/* ניהול גלריה */}

<button
  type="button"
  onClick={() => setManagingCategory(category)}
  className="
    mt-3
    mr-2
    text-[#D4AF37]
    border
    border-[#D4AF37]/40
    bg-[#D4AF37]/10
    hover:bg-[#D4AF37]
    hover:text-black
    px-3
    py-2
    rounded-lg
    text-sm
    font-semibold
    transition
  "
>
  🖼️ ניהול תמונות
</button>

                          <span
                            className="
                              text-[#D4AF37]
                              font-semibold
                            "
                          >
                            🖼️{" "}
                            {getImageCount(
                              category
                            )}{" "}
                            תמונות
                          </span>

                          <span
                            className="
                              text-[#D4AF37]
                              font-semibold
                            "
                          >
                            🎬{" "}
                            {getVideoCount(
                              category
                            )}{" "}
                            סרטונים
                          </span>

                        </div>

                      </div>

                      {/* IMAGES */}

                      {images.length >
                        0 && (

                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-1
                          "
                        >

                          {images
                            .slice(0, 4)
                            .map(
                              (
                                image
                              ) => (

                                <div
                                  key={
                                    image.id
                                  }
                                  className="
                                    relative
                                    h-32
                                    bg-black
                                  "
                                >

                                 <div className="relative w-full h-full group">
  <img
    src={image.url}
    alt={
      image.alt ||
      image.title ||
      category.name
    }
    className="w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
    <button
      type="button"
      onClick={() => deleteImage(image)}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
    >
      🗑️ מחק תמונה
    </button>
  </div>
</div>

                                </div>

                              )
                            )}

                        </div>

                      )}

                      {/* VIDEO PREVIEW */}

                      {videos.length >
                        0 && (

                        <div
                          className="
                            px-5
                            py-4
                            border-t
                            border-[#292929]
                          "
                        >

                          <p
                            className="
                              text-sm
                              text-gray-400
                              mb-3
                            "
                          >
                            🎬 סרטונים בקטגוריה
                          </p>

                          <div
                            className="
                              space-y-2
                            "
                          >

                            {videos
                              .slice(0, 3)
                              .map(
                                (
                                  video
                                ) => (

                                  <div
                                    key={
                                      video.id
                                    }
                                    className="
                                      flex
                                      items-center
                                      gap-3
                                      bg-[#090909]
                                      border
                                      border-[#292929]
                                      rounded-xl
                                      p-3
                                    "
                                  >

                                    <div
                                      className="
                                        w-12
                                        h-12
                                        rounded-lg
                                        bg-[#D4AF37]/10
                                        flex
                                        items-center
                                        justify-center
                                        text-xl
                                        flex-shrink-0
                                      "
                                    >
                                      ▶️
                                    </div>

                                    <div
                                      className="
                                        min-w-0
                                      "
                                    >

                                      <p
                                        className="
                                          text-sm
                                          font-semibold
                                          truncate
                                        "
                                      >
                                        {
                                          video.title ||
                                          "סרטון ללא כותרת"
                                        }
                                      </p>

                                      <p
                                        className="
                                          text-xs
                                          text-gray-500
                                          truncate
                                          mt-1
                                        "
                                      >
                                        {
                                          video.url
                                        }
                                      </p>

                                    </div>

                                  </div>

                                )
                              )}

                          </div>

                        </div>

                      )}

                      {/* EMPTY */}

                      {images.length ===
                        0 &&
                        videos.length ===
                          0 && (

                          <div
                            className="
                              p-6
                              text-center
                              text-gray-600
                              border-t
                              border-[#292929]
                            "
                          >
                            אין עדיין תמונות
                            או סרטונים
                          </div>

                        )}

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>
      {/* חלון ניהול תמונות */}
{managingCategory && (
  <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 px-4 pt-28 pb-6">
    <div className="w-full max-w-5xl max-h-[calc(100vh-150px)] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-[#111] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#D4AF37]">
          ניהול תמונות — {managingCategory.name}
        </h2>

        <button
          type="button"
          onClick={() => {
            setManagingCategory(null);
            setNewGalleryFiles(null);
          }}
          className="rounded-lg border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          ✕ סגור
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-[#292929] bg-[#090909] p-4">
        <label className="mb-3 block font-semibold">
          הוספת תמונות מהמחשב
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setNewGalleryFiles(e.target.files)
          }
          className="block w-full text-sm text-gray-300"
        />

        <button
          type="button"
          onClick={addImagesToGallery}
          disabled={savingGalleryImages || !newGalleryFiles?.length}
          className="mt-4 rounded-xl bg-[#D4AF37] px-5 py-3 font-bold text-black disabled:opacity-50"
        >
          {savingGalleryImages
            ? "מעלה תמונות..."
            : `הוסף ${newGalleryFiles?.length || 0} תמונות`}
        </button>
      </div>

      <h3 className="mb-4 text-lg font-bold">
        התמונות בקטגוריה ({managingCategory.images.length})
      </h3>

      {managingCategory.images.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          עדיין אין תמונות בקטגוריה הזאת.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {managingCategory.images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-[#292929] bg-[#090909]"
            >
              <img
                src={image.url}
                alt={image.alt || image.title || ""}
                className="h-40 w-full object-cover"
              />

              <div className="p-3">
                <p className="mb-3 break-words text-sm text-gray-300">
                  {image.title || "ללא כותרת"}
                </p>

                <button
                  type="button"
                  onClick={() => deleteImage(image)}
                  className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                >
                  🗑️ מחק תמונה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
    </main>
  );
}