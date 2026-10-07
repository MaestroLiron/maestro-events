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
  const [categories, setCategories] = useState<
    PortfolioCategory[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<number | "all">("all");

  // ==========================================
  // הצגת כל התמונות
  // ==========================================

  const [expandedCategories, setExpandedCategories] =
    useState<number[]>([]);

  const [isAllExpanded, setIsAllExpanded] =
    useState(false);

  // ==========================================
  // LIGHTBOX
  // ==========================================

  const [isLightboxOpen, setIsLightboxOpen] =
    useState(false);

  const [lightboxImages, setLightboxImages] =
    useState<PortfolioImage[]>([]);

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  // ==========================================
  // טעינת תיק העבודות
  // ==========================================

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch(
          "/api/portfolio",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "שגיאה בטעינת תיק העבודות"
          );
        }

        const data =
          await response.json();

        const activeCategories =
          Array.isArray(data)
            ? data
                .filter(
                  (
                    category: PortfolioCategory
                  ) => category.isActive
                )
                .map(
                  (
                    category: PortfolioCategory
                  ) => ({
                    ...category,

                    images:
                      Array.isArray(
                        category.images
                      )
                        ? category.images
                            .filter(
                              (
                                image
                              ) =>
                                image.isActive
                            )
                            .sort(
                              (
                                a,
                                b
                              ) =>
                                a.sortOrder -
                                b.sortOrder
                            )
                        : [],

                    videos:
                      Array.isArray(
                        category.videos
                      )
                        ? category.videos
                            .filter(
                              (
                                video
                              ) =>
                                video.isActive
                            )
                            .sort(
                              (
                                a,
                                b
                              ) =>
                                a.sortOrder -
                                b.sortOrder
                            )
                        : [],
                  })
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.sortOrder -
                    b.sortOrder
                )
            : [];

        setCategories(
          activeCategories
        );
      } catch (error) {
        console.error(
          "Portfolio error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  // ==========================================
  // כל התמונות
  // ==========================================

  const allImages = useMemo(() => {
    const result: PortfolioImage[] =
      [];

    categories.forEach(
      (category) => {
        category.images.forEach(
          (image) => {
            result.push(image);
          }
        );
      }
    );

    return result;
  }, [categories]);

// ==========================================
  // כל הסרטונים
  // ==========================================

  const allVideos = useMemo(() => {
    const result: PortfolioVideo[] = [];

    categories.forEach((category) => {
      category.videos.forEach((video) => {
        result.push(video);
      });
    });

    return result;
  }, [categories]);

  // ==========================================
  // פתיחה / סגירה של כל התמונות בקטגוריה
  // ==========================================

  function toggleCategoryExpanded(
    categoryId: number
  ) {
    setExpandedCategories(
      (current) => {
        if (
          current.includes(
            categoryId
          )
        ) {
          return current.filter(
            (id) =>
              id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  // ==========================================
  // פתיחה / סגירה של כל התמונות
  // ==========================================

  function toggleAllExpanded() {
    setIsAllExpanded(
      (current) => !current
    );
  }

  // ==========================================
  // פתיחת תמונה
  // ==========================================

  function openImage(
    images: PortfolioImage[],
    index: number
  ) {
    if (!images.length) {
      return;
    }

    setLightboxImages(
      images
    );

    setCurrentImageIndex(
      index
    );

    setIsLightboxOpen(
      true
    );
  }

  // ==========================================
  // סגירת תמונה
  // ==========================================

  function closeImage() {
    setIsLightboxOpen(
      false
    );

    setLightboxImages([]);

    setCurrentImageIndex(0);
  }

  // ==========================================
  // תמונה הבאה
  // ==========================================

  function nextImage() {
    if (
      lightboxImages.length <=
      1
    ) {
      return;
    }

    setCurrentImageIndex(
      (current) =>
        (current + 1) %
        lightboxImages.length
    );
  }

  // ==========================================
  // תמונה קודמת
  // ==========================================

  function previousImage() {
    if (
      lightboxImages.length <=
      1
    ) {
      return;
    }

    setCurrentImageIndex(
      (current) =>
        (current -
          1 +
          lightboxImages.length) %
        lightboxImages.length
    );
  }

  // ==========================================
  // מקלדת
  // ==========================================

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyboard(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        closeImage();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        nextImage();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        previousImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );

      document.body.style.overflow =
        "";
    };
  }, [
    isLightboxOpen,
    lightboxImages.length,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section
        id="portfolio"
        className="bg-black py-24"
      >
        <div className="max-w-7xl mx-auto px-6">

          <SectionTitle
            title="תיק עבודות"
            subtitle="הצצה לרגעים היפים שתיעדנו"
          />

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

        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <>
      <section
        id="portfolio"
        className="bg-black py-24"
      >
        <div className="max-w-7xl mx-auto px-6">

          <SectionTitle
            title="תיק עבודות"
            subtitle="הצצה לרגעים היפים שתיעדנו"
          />

          {/* ==================================
              כפתורי קטגוריות
          ================================== */}

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-14">

              <button
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    "all"
                  )
                }
                className={`
                  px-6
                  py-3
                  rounded-full
                  border
                  transition-all
                  duration-300
                  ${
                    selectedCategory ===
                    "all"
                      ? `
                        bg-[#D4AF37]
                        text-black
                        border-[#D4AF37]
                        shadow-[0_0_25px_rgba(212,175,55,0.25)]
                      `
                      : `
                        text-[#D4AF37]
                        border-[#D4AF37]
                        hover:bg-[#D4AF37]
                        hover:text-black
                      `
                  }
                `}
              >
                הכל
              </button>

              {categories.map(
                (category) => (
                  <button
                    type="button"
                    key={
                      category.id
                    }
                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }
                    className={`
                      px-6
                      py-3
                      rounded-full
                      border
                      transition-all
                      duration-300
                      ${
                        selectedCategory ===
                        category.id
                          ? `
                            bg-[#D4AF37]
                            text-black
                            border-[#D4AF37]
                            shadow-[0_0_25px_rgba(212,175,55,0.25)]
                          `
                          : `
                            text-[#D4AF37]
                            border-[#D4AF37]
                            hover:bg-[#D4AF37]
                            hover:text-black
                          `
                      }
                    `}
                  >
                    {
                      category.name
                    }
                  </button>
                )
              )}

            </div>
          )}

          {/* ==================================
              הכל
          ================================== */}

          {selectedCategory ===
            "all" && (
            <div>

              <div className="text-center mb-10">

                <h3 className="text-white text-2xl md:text-3xl font-bold">
                  מכל הרגעים שלנו
                </h3>

                <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />

              </div>

              {allImages.length >
              0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

                    {(isAllExpanded
                      ? allImages
                      : allImages.slice(
                          0,
                          3
                        )
                    ).map(
                      (
                        image,
                        index
                      ) => (
                        <PortfolioImageCard
                          key={
                            image.id
                          }
                          image={
                            image
                          }
                          onClick={() =>
                            openImage(
                              allImages,
                              isAllExpanded
                                ? index
                                : allImages.findIndex(
                                    (
                                      item
                                    ) =>
                                      item.id ===
                                      image.id
                                  )
                            )
                          }
                        />
                      )
                    )}

                  </div>

{/* ==================================
    סרטונים
================================== */}

{categories.some(
  (category) =>
    category.videos &&
    category.videos.length > 0
) && (
  <div className="mt-16">

    <div className="text-center mb-10">

      <h3 className="text-white text-2xl md:text-3xl font-bold">
        הסרטונים שלנו
      </h3>

      <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />

    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

      {categories
        .flatMap(
          (category) =>
            category.videos || []
        )
        .map((video) => (
          <PortfolioVideoCard
            key={video.id}
            video={video}
          />
        ))}

    </div>

  </div>
)}

                  {allImages.length >
                    3 && (
                    <div className="flex justify-center mt-10">

                      <button
                        type="button"
                        onClick={
                          toggleAllExpanded
                        }
                        className="
                          px-8
                          py-3
                          rounded-full
                          border
                          border-[#D4AF37]
                          text-[#D4AF37]
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition-all
                          duration-300
                          shadow-[0_5px_25px_rgba(212,175,55,0.08)]
                        "
                      >
                        {isAllExpanded
                          ? "הצג פחות"
                          : "הצג את כל התמונות"}
                      </button>

                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-16">
                  עדיין אין תמונות.
                </p>
              )}

            </div>
          )}

          {/* ==================================
              קטגוריה ספציפית
          ================================== */}

          {selectedCategory !==
            "all" &&
            categories
              .filter(
                (
                  category
                ) =>
                  category.id ===
                  selectedCategory
              )
              .map(
                (
                  category
                ) => (
                  <CategoryGallery
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    onOpenImage={
                      openImage
                    }
                    isExpanded={expandedCategories.includes(
                      category.id
                    )}
                    onToggleExpanded={() =>
                      toggleCategoryExpanded(
                        category.id
                      )
                    }
                  />
                )
              )}

        </div>
      </section>

      {/* ======================================
          LIGHTBOX
      ====================================== */}

      {isLightboxOpen &&
        lightboxImages.length >
          0 && (
          <div
            className="
              fixed
              inset-0
              z-[99999]
              bg-black/95
              backdrop-blur-md
              flex
              items-center
              justify-center
            "
            onClick={
              closeImage
            }
          >

            {/* כפתור סגירה */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeImage();
              }}
              className="
                absolute
                top-5
                right-5
                z-[100000]
                w-12
                h-12
                rounded-full
                bg-black/80
                border
                border-white/20
                text-white
                text-3xl
                flex
                items-center
                justify-center
                hover:border-[#D4AF37]
                hover:text-[#D4AF37]
                transition-all
              "
              aria-label="סגור"
            >
              ×
            </button>

            {/* מספר תמונה */}

            <div
              className="
                absolute
                top-7
                left-1/2
                -translate-x-1/2
                z-[100000]
                text-white
                bg-black/60
                px-4
                py-2
                rounded-full
                text-sm
              "
            >
              {currentImageIndex +
                1}{" "}
              /{" "}
              {
                lightboxImages.length
              }
            </div>

            {/* תמונה */}

            <div
              className="
                relative
                w-full
                h-full
                flex
                items-center
                justify-center
                px-16
                md:px-24
                py-20
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <img
                src={
                  lightboxImages[
                    currentImageIndex
                  ].url
                }
                alt={
                  lightboxImages[
                    currentImageIndex
                  ].alt ||
                  "Maestro Events"
                }
                className="
                  max-w-full
                  max-h-full
                  object-contain
                  rounded-xl
                  shadow-[0_25px_100px_rgba(0,0,0,0.8)]
                  select-none
                "
                draggable={false}
              />

            </div>

            {/* חץ קודם */}

            {lightboxImages.length >
              1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="
                  absolute
                  left-4
                  md:left-8
                  top-1/2
                  -translate-y-1/2
                  z-[100000]
                  w-14
                  h-14
                  md:w-16
                  md:h-16
                  rounded-full
                  bg-black/80
                  border
                  border-white/20
                  text-white
                  text-4xl
                  flex
                  items-center
                  justify-center
                  hover:border-[#D4AF37]
                  hover:text-[#D4AF37]
                  hover:scale-105
                  transition-all
                "
                aria-label="תמונה קודמת"
              >
                ‹
              </button>
            )}

            {/* חץ הבא */}

            {lightboxImages.length >
              1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="
                  absolute
                  right-4
                  md:right-8
                  top-1/2
                  -translate-y-1/2
                  z-[100000]
                  w-14
                  h-14
                  md:w-16
                  md:h-16
                  rounded-full
                  bg-black/80
                  border
                  border-white/20
                  text-white
                  text-4xl
                  flex
                  items-center
                  justify-center
                  hover:border-[#D4AF37]
                  hover:text-[#D4AF37]
                  hover:scale-105
                  transition-all
                "
                aria-label="תמונה הבאה"
              >
                ›
              </button>
            )}

          </div>
        )}
    </>
  );
}

// ======================================================
// CATEGORY GALLERY
// ======================================================

// ======================================================
// CATEGORY GALLERY
// ======================================================

function CategoryGallery({
  category,
  onOpenImage,
  isExpanded,
  onToggleExpanded,
}: {
  category: PortfolioCategory;

  onOpenImage: (
    images: PortfolioImage[],
    index: number
  ) => void;

  isExpanded: boolean;

  onToggleExpanded: () => void;
}) {
  const images = category.images;
  const videos = category.videos;

  const previewImages = images.slice(0, 3);

  const visibleImages = isExpanded
    ? images
    : previewImages;

  return (
    <div>

      {/* ==================================
          כותרת קטגוריה
      ================================== */}

      <div className="text-center mb-10">

        <h3 className="text-white text-2xl md:text-3xl font-bold">
          {category.name}
        </h3>

        {category.description && (
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            {category.description}
          </p>
        )}

        <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />

      </div>

      {/* ==================================
          תמונות
      ================================== */}

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {visibleImages.map((image) => {

              const originalIndex =
                images.findIndex(
                  (item) =>
                    item.id === image.id
                );

              return (
                <PortfolioImageCard
                  key={image.id}
                  image={image}
                  onClick={() =>
                    onOpenImage(
                      images,
                      originalIndex
                    )
                  }
                />
              );
            })}

          </div>

          {/* ==================================
              כפתור הצג הכל
          ================================== */}

          {images.length > 3 && (
            <div className="flex justify-center mt-10">

              <button
                type="button"
                onClick={onToggleExpanded}
                className="
                  px-8
                  py-3
                  rounded-full
                  border
                  border-[#D4AF37]
                  text-[#D4AF37]
                  hover:bg-[#D4AF37]
                  hover:text-black
                  transition-all
                  duration-300
                  shadow-[0_5px_25px_rgba(212,175,55,0.08)]
                "
              >
                {isExpanded
                  ? "הצג פחות"
                  : "הצג את כל התמונות"}
              </button>

            </div>
          )}
        </>
      )}

      {/* ==================================
          סרטונים
      ================================== */}

      {videos.length > 0 && (
        <div className="mt-16">

          <div className="text-center mb-10">

            <h3 className="text-white text-2xl md:text-3xl font-bold">
              סרטונים
            </h3>

            <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-4" />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

            {videos.map((video) => (
              <PortfolioVideoCard
                key={video.id}
                video={video}
              />
            ))}

          </div>

        </div>
      )}

      {/* ==================================
          אין תוכן
      ================================== */}

      {images.length === 0 &&
        videos.length === 0 && (
          <p className="text-center text-gray-500 py-16">
            עדיין אין תמונות או סרטונים בקטגוריה.
          </p>
        )}

    </div>
  );
}

// ======================================================
// IMAGE CARD
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
      aria-label="פתח תמונה"
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-3xl
        bg-black
        border
        border-[#252525]
        hover:border-[#D4AF37]
        transition-all
        duration-500
        shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        hover:shadow-[0_18px_60px_rgba(212,175,55,0.18)]
        hover:-translate-y-1
        focus:outline-none
        focus:ring-2
        focus:ring-[#D4AF37]
      "
    >

      {/* ==================================
          תמונה בלבד
      ================================== */}

      <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">

        <img
          src={image.url}
          alt={
            image.alt ||
            image.title ||
            "Maestro Events"
          }
          loading="lazy"
          draggable={false}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-105
          "
        />

        {/* שכבת הצללה עדינה */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
            bg-black/0
            group-hover:bg-black/10
            transition-all
            duration-500
          "
        />

      </div>

    </button>
  );
}

// ======================================================
// VIDEO CARD
// ======================================================

function PortfolioVideoCard({
  video,
}: {
  video: PortfolioVideo;
}) {
  return (
    <div
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-3xl
        bg-black
        border
        border-[#252525]
        hover:border-[#D4AF37]
        transition-all
        duration-500
        shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        hover:shadow-[0_18px_60px_rgba(212,175,55,0.18)]
        hover:-translate-y-1
      "
    >
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          poster={video.thumbnailUrl || undefined}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
        />
      </div>

      {(video.title || video.description) && (
        <div className="p-5 text-right">
          {video.title && (
            <h4 className="text-white text-lg font-bold">
              {video.title}
            </h4>
          )}

          {video.description && (
            <p className="text-gray-400 text-sm mt-2">
              {video.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}