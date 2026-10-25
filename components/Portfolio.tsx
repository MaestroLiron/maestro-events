"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";

type PortfolioImage = {
  id: number;
  categoryId: number;
  url: string;
  title?: string | null;
  alt?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type PortfolioVideo = {
  id: number;
  categoryId: number;
  url: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type PortfolioCategory = {
  id: number;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  images: PortfolioImage[];
  videos: PortfolioVideo[];
};

export default function Portfolio() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<number | "all">("all");

  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedVideoCategories, setExpandedVideoCategories] = useState<
    number[]
  >([]);

  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [isAllVideosExpanded, setIsAllVideosExpanded] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<PortfolioImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // טעינת תיק העבודות
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch("/api/portfolio", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("שגיאה בטעינת תיק העבודות");
        }

        const data = await response.json();

        const activeCategories: PortfolioCategory[] = Array.isArray(data)
          ? data
              .filter((category: PortfolioCategory) => category.isActive)
              .map((category: PortfolioCategory) => ({
                ...category,
                images: Array.isArray(category.images)
                  ? category.images
                      .filter((image) => image.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                  : [],
                videos: Array.isArray(category.videos)
                  ? category.videos
                      .filter((video) => video.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                  : [],
              }))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          : [];

        setCategories(activeCategories);
      } catch (error) {
        console.error("Portfolio error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  // כל התמונות
  const allImages = useMemo(
    () => categories.flatMap((category) => category.images),
    [categories]
  );

  // כל הסרטונים
  const categoryVideos = useMemo(
    () => categories.flatMap((category) => category.videos || []),
    [categories]
  );

  // פתיחה וסגירה של קטגוריית תמונות
  function toggleCategoryExpanded(categoryId: number) {
    setExpandedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  // פתיחה וסגירה של סרטוני קטגוריה
  function toggleCategoryVideosExpanded(categoryId: number) {
    setExpandedVideoCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  // פתיחה וסגירה של כל התמונות
  function toggleAllExpanded() {
    setIsAllExpanded((current) => !current);
  }

  // פתיחה וסגירה של כל הסרטונים
  function toggleAllVideosExpanded() {
    setIsAllVideosExpanded((current) => !current);
  }

  // פתיחת תמונה מוגדלת
  function openImage(images: PortfolioImage[], index: number) {
    if (!images.length) return;

    setLightboxImages(images);
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  }

  // סגירת תמונה מוגדלת
  function closeImage() {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setCurrentImageIndex(0);
  }

  // תמונה הבאה
  function nextImage() {
    if (lightboxImages.length <= 1) return;

    setCurrentImageIndex(
      (current) => (current + 1) % lightboxImages.length
    );
  }

  // תמונה קודמת
  function previousImage() {
    if (lightboxImages.length <= 1) return;

    setCurrentImageIndex(
      (current) =>
        (current - 1 + lightboxImages.length) % lightboxImages.length
    );
  }

  // מקלדת ומניעת גלילה ברקע בעת פתיחת תמונה
  useEffect(() => {
    if (!isLightboxOpen) return;

    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") closeImage();
      if (event.key === "ArrowLeft") nextImage();
      if (event.key === "ArrowRight") previousImage();
    }

    const previousOverflow = document.body.style.overflow;

    window.addEventListener("keydown", handleKeyboard);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, lightboxImages.length]);

  // מסך טעינה
  if (loading) {
    return (
      <section id="portfolio" className="bg-black py-12 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="תיק עבודות"
            subtitle="הצצה לרגעים היפים שתיעדנו"
          />

          <div className="flex justify-center py-16 md:py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="portfolio"
        className="overflow-hidden bg-black py-12 sm:py-16 lg:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="תיק עבודות"
            subtitle="הצצה לרגעים היפים שתיעדנו"
          />

          {/* קטגוריות */}
          {categories.length > 0 && (
            <div
              dir="rtl"
              className="
                -mx-4 mb-8 flex snap-x snap-mandatory
                gap-2 overflow-x-auto overscroll-x-contain
                px-4 pb-3
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:mx-0 sm:mb-12 sm:flex-wrap
                sm:justify-center sm:overflow-visible sm:px-0
              "
            >
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`
                  shrink-0 snap-start rounded-full border
                  px-5 py-2.5 text-sm font-semibold
                  transition-all duration-300 sm:px-6 sm:py-3 sm:text-base
                  ${
                    selectedCategory === "all"
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  }
                `}
              >
                הכל
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    shrink-0 snap-start rounded-full border
                    px-4 py-2.5 text-sm font-semibold
                    transition-all duration-300 sm:px-6 sm:py-3 sm:text-base
                    ${
                      selectedCategory === category.id
                        ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                        : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* כל התמונות והסרטונים */}
          {selectedCategory === "all" && (
            <div>
              {/* גלריית תמונות */}
              <div className="mb-6 text-center sm:mb-10">
                <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  מכל הרגעים שלנו
                </h3>
                <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37] sm:mt-4" />
              </div>

              {allImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
                    {(isAllExpanded ? allImages : allImages.slice(0, 6)).map(
                      (image) => {
                        const imageIndex = allImages.findIndex(
                          (item) => item.id === image.id
                        );

                        return (
                          <PortfolioImageCard
                            key={image.id}
                            image={image}
                            onClick={() => openImage(allImages, imageIndex)}
                          />
                        );
                      }
                    )}
                  </div>

                  {allImages.length > 4 && (
                    <div className="mt-7 flex justify-center sm:mt-10">
                      <button
                        type="button"
                        onClick={toggleAllExpanded}
                        className="
                          rounded-full border border-[#D4AF37]
                          px-6 py-2.5 text-sm font-semibold
                          text-[#D4AF37] transition-all duration-300
                          hover:bg-[#D4AF37] hover:text-black
                          sm:px-8 sm:py-3 sm:text-base
                        "
                      >
                        {isAllExpanded ? "הצג פחות" : "הצג את כל התמונות"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500 sm:py-12 sm:text-base">
                  עדיין אין תמונות.
                </p>
              )}

              {/* סרטונים מכל הקטגוריות */}
              {categoryVideos.length > 0 && (
                <VideoSection
                  title="הסרטונים שלנו"
                  videos={categoryVideos}
                  isExpanded={isAllVideosExpanded}
                  onToggle={toggleAllVideosExpanded}
                />
              )}
            </div>
          )}

          {/* קטגוריה ספציפית */}
          {selectedCategory !== "all" &&
            categories
              .filter((category) => category.id === selectedCategory)
              .map((category) => (
                <CategoryGallery
                  key={category.id}
                  category={category}
                  onOpenImage={openImage}
                  isExpanded={expandedCategories.includes(category.id)}
                  onToggleExpanded={() =>
                    toggleCategoryExpanded(category.id)
                  }
                  areVideosExpanded={expandedVideoCategories.includes(
                    category.id
                  )}
                  onToggleVideos={() =>
                    toggleCategoryVideosExpanded(category.id)
                  }
                />
              ))}
        </div>
      </section>

      {/* תצוגת תמונה מוגדלת */}
      {isLightboxOpen && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeImage}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeImage();
            }}
            className="
              absolute right-4 top-4 z-[100000]
              flex h-10 w-10 items-center justify-center
              rounded-full border border-white/20
              bg-black/80 text-3xl text-white
              transition hover:border-[#D4AF37]
              hover:text-[#D4AF37] sm:right-5 sm:top-5
              sm:h-12 sm:w-12
            "
            aria-label="סגור"
          >
            ×
          </button>

          <div className="absolute left-1/2 top-5 z-[100000] -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white sm:top-7">
            {currentImageIndex + 1} / {lightboxImages.length}
          </div>

          <div
            className="flex h-full w-full items-center justify-center px-12 py-16 sm:px-24 sm:py-20"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightboxImages[currentImageIndex].url}
              alt={
                lightboxImages[currentImageIndex].alt ||
                lightboxImages[currentImageIndex].title ||
                "Maestro Events"
              }
              className="max-h-full max-w-full select-none rounded-lg object-contain sm:rounded-xl"
              draggable={false}
            />
          </div>

          {lightboxImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="
                  absolute left-2 top-1/2 z-[100000]
                  flex h-10 w-10 -translate-y-1/2
                  items-center justify-center rounded-full
                  border border-white/20 bg-black/80
                  text-3xl text-white transition
                  hover:border-[#D4AF37] hover:text-[#D4AF37]
                  sm:left-8 sm:h-14 sm:w-14 sm:text-4xl
                "
                aria-label="תמונה קודמת"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="
                  absolute right-2 top-1/2 z-[100000]
                  flex h-10 w-10 -translate-y-1/2
                  items-center justify-center rounded-full
                  border border-white/20 bg-black/80
                  text-3xl text-white transition
                  hover:border-[#D4AF37] hover:text-[#D4AF37]
                  sm:right-8 sm:h-14 sm:w-14 sm:text-4xl
                "
                aria-label="תמונה הבאה"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ======================================================
// אזור סרטונים עם הצג הכל / הצג פחות
// ======================================================
function VideoSection({
  title,
  videos,
  isExpanded,
  onToggle,
}: {
  title: string;
  videos: PortfolioVideo[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const visibleVideos = isExpanded ? videos : videos.slice(0, 3);

  return (
    <div className="mt-10 sm:mt-16">
      <div className="mb-6 text-center sm:mb-10">
        <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          {title}
        </h3>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37] sm:mt-4" />
      </div>

      {/* שלושה סרטונים בשורה בכל רוחבי המסך */}
      <div
        dir="rtl"
        className="grid grid-cols-3 items-start gap-2 sm:gap-4 lg:gap-7"
      >
        {visibleVideos.map((video) => (
          <PortfolioVideoCard key={video.id} video={video} />
        ))}
      </div>

      {videos.length > 3 && (
        <div className="mt-7 flex justify-center sm:mt-10">
          <button
            type="button"
            onClick={onToggle}
            className="
              rounded-full border border-[#D4AF37]
              px-5 py-2.5 text-xs font-semibold
              text-[#D4AF37] transition-all duration-300
              hover:bg-[#D4AF37] hover:text-black
              focus:outline-none focus:ring-2 focus:ring-[#D4AF37]
              focus:ring-offset-2 focus:ring-offset-black
              sm:px-8 sm:py-3 sm:text-base
            "
          >
            {isExpanded ? "הצג פחות" : "הצג את כל הסרטונים"}
          </button>
        </div>
      )}
    </div>
  );
}

// ======================================================
// גלריית קטגוריה
// ======================================================
function CategoryGallery({
  category,
  onOpenImage,
  isExpanded,
  onToggleExpanded,
  areVideosExpanded,
  onToggleVideos,
}: {
  category: PortfolioCategory;
  onOpenImage: (images: PortfolioImage[], index: number) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  areVideosExpanded: boolean;
  onToggleVideos: () => void;
}) {
  const images = category.images;
  const videos = category.videos;

  const visibleImages = isExpanded ? images : images.slice(0, 4);

  return (
    <div>
      <div className="mb-6 text-center sm:mb-10">
        <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          {category.name}
        </h3>

        {category.description && (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-400 sm:mt-3 sm:text-base">
            {category.description}
          </p>
        )}

        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#D4AF37] sm:mt-4" />
      </div>

      {/* תמונות הקטגוריה */}
      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
            {visibleImages.map((image) => {
              const originalIndex = images.findIndex(
                (item) => item.id === image.id
              );

              return (
                <PortfolioImageCard
                  key={image.id}
                  image={image}
                  onClick={() => onOpenImage(images, originalIndex)}
                />
              );
            })}
          </div>

          {images.length > 4 && (
            <div className="mt-7 flex justify-center sm:mt-10">
              <button
                type="button"
                onClick={onToggleExpanded}
                className="
                  rounded-full border border-[#D4AF37]
                  px-6 py-2.5 text-sm font-semibold
                  text-[#D4AF37] transition-all duration-300
                  hover:bg-[#D4AF37] hover:text-black
                  sm:px-8 sm:py-3 sm:text-base
                "
              >
                {isExpanded ? "הצג פחות" : "הצג את כל התמונות"}
              </button>
            </div>
          )}
        </>
      )}

      {/* סרטוני הקטגוריה */}
      {videos.length > 0 && (
        <VideoSection
          title="סרטונים"
          videos={videos}
          isExpanded={areVideosExpanded}
          onToggle={onToggleVideos}
        />
      )}

      {images.length === 0 && videos.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500 sm:py-16 sm:text-base">
          עדיין אין תמונות או סרטונים בקטגוריה.
        </p>
      )}
    </div>
  );
}

// ======================================================
// כרטיס תמונה
// ======================================================
function PortfolioImageCard({
  image,
  onClick,
}: {
  image: PortfolioImage;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`פתח תמונה: ${
        image.title || image.alt || "Maestro Events"
      }`}
      className="
        group relative w-full overflow-hidden
        rounded-xl border border-[#252525] bg-black
        shadow-[0_6px_20px_rgba(0,0,0,0.3)]
        transition-colors duration-300
        hover:border-[#D4AF37]
        focus:outline-none focus:ring-2 focus:ring-[#D4AF37]
        sm:rounded-2xl lg:rounded-3xl
        lg:shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        lg:hover:-translate-y-1
        lg:hover:shadow-[0_18px_60px_rgba(212,175,55,0.18)]
      "
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={image.url}
          alt={image.alt || image.title || "Maestro Events"}
          loading="lazy"
          draggable={false}
          className="
            absolute inset-0 h-full w-full object-cover
            transition-transform duration-500
            lg:duration-700 lg:ease-out lg:group-hover:scale-105
          "
        />
      </div>
    </button>
  );
}

// ======================================================
// כרטיס סרטון
// ======================================================
function PortfolioVideoCard({
  video,
}: {
  video: PortfolioVideo;
}) {
  return (
    <div
      className="
        group relative min-w-0 w-full overflow-hidden
        rounded-lg border border-[#252525] bg-black
        transition-colors duration-300 hover:border-[#D4AF37]
        sm:rounded-2xl lg:rounded-3xl
      "
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black sm:aspect-video">
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          poster={video.thumbnailUrl || undefined}
          aria-label={video.title || "סרטון Maestro Events"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {(video.title || video.description) && (
        <div className="p-2 text-right sm:p-4 lg:p-5">
          {video.title && (
            <h4 className="break-words text-xs font-bold text-white sm:text-base lg:text-lg">
              {video.title}
            </h4>
          )}

          {video.description && (
            <p className="mt-1 break-words text-[10px] leading-4 text-gray-400 sm:mt-2 sm:text-sm sm:leading-5">
              {video.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}