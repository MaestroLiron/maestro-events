"use client";

import { useEffect, useRef, useState } from "react";

type Gallery = {
  id: number;
  name: string;
  slug: string;
  password: string;
  expiresAt: string | null;
  isActive: boolean;
  allImagesDownloaded: boolean;
  completedDownloadAt: string | null;
  lastAccessAt: string | null;
  createdAt: string;

  images: {
    id: number;
  }[];
};

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // יצירת גלריה
  // ==========================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [galleryName, setGalleryName] =
    useState("");

  const [clientName, setClientName] =
    useState("");

  const [galleryPassword, setGalleryPassword] =
    useState("");

  const [expirationDays, setExpirationDays] =
    useState("30");

  const [creating, setCreating] =
    useState(false);

  // ==========================================
  // מחיקה
  // ==========================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [galleryToDelete, setGalleryToDelete] =
    useState<Gallery | null>(null);

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  // ==========================================
  // עריכת גלריה
  // ==========================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [galleryToEdit, setGalleryToEdit] =
    useState<Gallery | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editPassword, setEditPassword] =
    useState("");

  const [editExpiration, setEditExpiration] =
    useState("30");

  const [savingEdit, setSavingEdit] =
    useState(false);

  // ==========================================
  // העלאת תמונות
  // ==========================================

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const folderInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // טעינת גלריות
  // ==========================================

  useEffect(() => {
    loadGalleries();
  }, []);

  async function loadGalleries() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/galleries",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load galleries"
        );
      }

      const data =
        await response.json();

      setGalleries(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        "שגיאה בטעינת הגלריות"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // איפוס יצירה
  // ==========================================

  function resetCreateForm() {
    setGalleryName("");
    setClientName("");
    setGalleryPassword("");
    setExpirationDays("30");
  }

  // ==========================================
  // פתיחת יצירה
  // ==========================================

  function openCreateModal() {
    resetCreateForm();

    setShowCreateModal(true);
  }

  // ==========================================
  // סגירת יצירה
  // ==========================================

  function closeCreateModal() {
    if (creating) {
      return;
    }

    setShowCreateModal(false);
  }

  // ==========================================
  // יצירת גלריה
  // ==========================================

  async function handleCreateGallery() {
    if (!galleryName.trim()) {
      alert(
        "נא להזין שם לגלריה"
      );
      return;
    }

    if (!clientName.trim()) {
      alert(
        "נא להזין שם לקוח"
      );
      return;
    }

    if (!galleryPassword.trim()) {
      alert(
        "נא להזין סיסמה ללקוח"
      );
      return;
    }

    if (
      galleryPassword.trim()
        .length < 4
    ) {
      alert(
        "הסיסמה חייבת להכיל לפחות 4 תווים"
      );
      return;
    }

    try {
      setCreating(true);

      const response =
        await fetch(
          "/api/galleries",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: galleryName,
              clientName,
              password:
                galleryPassword,
              expirationDays,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "שגיאה ביצירת הגלריה"
        );

        return;
      }

      setShowCreateModal(false);

      resetCreateForm();

      await loadGalleries();

      alert(
        "הגלריה נוצרה בהצלחה"
      );
    } catch (error) {
      console.error(error);

      alert(
        "שגיאה ביצירת הגלריה"
      );
    } finally {
      setCreating(false);
    }
  }

  // ==========================================
  // פתיחת עריכה
  // ==========================================

  function openEditModal(
    gallery: Gallery
  ) {
    setGalleryToEdit(gallery);

    setEditName(
      gallery.name
    );

    setEditPassword("");

    if (!gallery.expiresAt) {
      setEditExpiration(
        "never"
      );
    } else {
      setEditExpiration(
        "30"
      );
    }

    setShowEditModal(true);
  }

  // ==========================================
  // סגירת עריכה
  // ==========================================

  function closeEditModal() {
    if (savingEdit || uploading) {
      return;
    }

    setShowEditModal(false);

    setGalleryToEdit(null);

    setEditName("");

    setEditPassword("");

    setEditExpiration("30");

    setUploadProgress("");
  }

  // ==========================================
  // שמירת עריכה
  // ==========================================

  async function handleSaveEdit() {
    if (!galleryToEdit) {
      return;
    }

    if (!editName.trim()) {
      alert(
        "נא להזין שם לגלריה"
      );
      return;
    }

    if (
      editPassword.trim() &&
      editPassword.trim().length < 4
    ) {
      alert(
        "הסיסמה חייבת להכיל לפחות 4 תווים"
      );
      return;
    }

    try {
      setSavingEdit(true);

      const response =
        await fetch(
          "/api/galleries",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              galleryId:
                galleryToEdit.id,
              name: editName,
              password:
                editPassword.trim()
                  ? editPassword
                  : undefined,
              expirationDays:
                editExpiration,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "שגיאה בעדכון הגלריה"
        );

        return;
      }

      await loadGalleries();

      alert(
        "הגלריה עודכנה בהצלחה"
      );

      setEditPassword("");
    } catch (error) {
      console.error(error);

      alert(
        "שגיאה בעדכון הגלריה"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  // ==========================================
  // בחירת תמונות
  // ==========================================

  function chooseImages() {
    fileInputRef.current?.click();
  }

  // ==========================================
  // בחירת תיקייה
  // ==========================================

  function chooseFolder() {
    folderInputRef.current?.click();
  }

  // ==========================================
  // העלאת קבצים
  // ==========================================

async function uploadFiles(files: FileList | File[]) {
    if (!galleryToEdit || uploading) {
      return;
    }

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|avif|bmp|heic|heif)$/i.test(file.name)
    );

    if (selectedFiles.length === 0) {
      alert("לא נמצאו קבצי תמונה");
      return;
    }

    setUploading(true);

    let uploaded = 0;
    const failed: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        setUploadProgress(
          `מעלה תמונה ${i + 1} מתוך ${selectedFiles.length}: ${file.name}`
        );

        try {
          const formData = new FormData();
          formData.append("galleryId", String(galleryToEdit.id));
          formData.append("files", file);

          const response = await fetch("/api/galleries", {
            method: "POST",
            body: formData,
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data.error || `שגיאת שרת (${response.status})`
            );
          }

          uploaded += Number(data.uploaded ?? 1);
        } catch (error) {
          console.error(`Upload failed: ${file.name}`, error);
          failed.push(file.name);
        }
      }

      await loadGalleries();

      const updated = await fetch("/api/galleries", {
        cache: "no-store",
      });

      if (updated.ok) {
        const all = await updated.json();
        const found = all.find(
          (item: Gallery) => item.id === galleryToEdit.id
        );

        if (found) {
          setGalleryToEdit(found);
        }
      }

      if (failed.length === 0) {
        setUploadProgress(
          `הועלו בהצלחה ${uploaded} מתוך ${selectedFiles.length} תמונות`
        );
      } else {
        setUploadProgress(
          `הועלו ${uploaded} תמונות; ${failed.length} נכשלו`
        );

        alert(
          `הועלו ${uploaded} תמונות מתוך ${selectedFiles.length}.\n` +
          `נכשלו ${failed.length} תמונות.\n` +
          `קבצים שנכשלו:\n${failed.slice(0, 10).join("\n")}`
        );
      }
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה במהלך העלאת התמונות או רענון הגלריה.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  }

  // ==========================================
  // בחירת תמונות
  // ==========================================

  function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      event.target.files;

    if (!files) {
      return;
    }

    uploadFiles(files);
  }

  // ==========================================
  // בחירת תיקייה
  // ==========================================

  function handleFolderSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      event.target.files;

    if (!files) {
      return;
    }

    uploadFiles(files);
  }

  // ==========================================
  // פתיחת מחיקה
  // ==========================================

  function openDeleteModal(
    gallery: Gallery
  ) {
    setGalleryToDelete(
      gallery
    );

    setDeletePassword("");

    setShowDeleteModal(true);
  }

  // ==========================================
  // סגירת מחיקה
  // ==========================================

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setShowDeleteModal(
      false
    );

    setGalleryToDelete(
      null
    );

    setDeletePassword("");
  }

  // ==========================================
  // מחיקה
  // ==========================================

  async function handleDeleteGallery() {
    if (!galleryToDelete) {
      return;
    }

    if (
      !deletePassword.trim()
    ) {
      alert(
        "נא להזין סיסמת מנהל"
      );

      return;
    }

    try {
      setDeleting(true);

      const response =
        await fetch(
          "/api/galleries",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              galleryId:
                galleryToDelete.id,
              password:
                deletePassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "לא ניתן למחוק את הגלריה"
        );

        return;
      }

      setGalleries(
        (current) =>
          current.filter(
            (gallery) =>
              gallery.id !==
              galleryToDelete.id
          )
      );

      setShowDeleteModal(
        false
      );

      setGalleryToDelete(
        null
      );

      setDeletePassword("");

      alert(
        "הגלריה נמחקה בהצלחה"
      );
    } catch (error) {
      console.error(error);

      alert(
        "שגיאה במחיקת הגלריה"
      );
    } finally {
      setDeleting(false);
    }
  }

  // ==========================================
  // תאריך
  // ==========================================

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "ללא הגבלת זמן";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "he-IL",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  // ==========================================
  // סטטוס
  // ==========================================

  function getGalleryStatus(
    gallery: Gallery
  ) {
    if (!gallery.isActive) {
      return {
        text: "לא פעילה",
        className:
          "bg-red-500/10 border-red-500/30 text-red-400",
      };
    }

    if (
      gallery.expiresAt &&
      new Date(
        gallery.expiresAt
      ).getTime() <
        Date.now()
    ) {
      return {
        text: "פג תוקף",
        className:
          "bg-red-500/10 border-red-500/30 text-red-400",
      };
    }

    return {
      text: "פעילה",
      className:
        "bg-green-500/10 border-green-500/30 text-green-400",
    };
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          bg-[#090909]
          text-white
          p-8
        "
      >
        <div className="max-w-7xl mx-auto">
          <div className="
            min-h-[400px]
            flex
            items-center
            justify-center
          ">
            <div className="
              text-[#D4AF37]
              text-xl
            ">
              טוען גלריות...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      dir="rtl"
className="min-h-screen bg-[#090909] text-white px-4 md:px-8 pt-24 pb-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-5
          mb-10
        ">
          <div>
            <h1 className="
              text-3xl
              md:text-4xl
              font-bold
              text-[#D4AF37]
            ">
              גלריה ללקוחות
            </h1>

            <p className="
              text-gray-400
              mt-2
            ">
              ניהול הגלריות הפרטיות של הלקוחות
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="
              bg-[#D4AF37]
              text-black
              font-bold
              px-6
              py-3
              rounded-xl
              hover:scale-105
              transition
            "
          >
            + צור גלריה חדשה
          </button>
        </div>

        {/* STATS */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
          mb-10
        ">

          <div className="
            bg-[#111]
            border
            border-[#2a2a2a]
            rounded-2xl
            p-6
          ">
            <div className="
              text-gray-400
              text-sm
              mb-2
            ">
              סך הגלריות
            </div>

            <div className="
              text-4xl
              font-bold
            ">
              {galleries.length}
            </div>
          </div>

          <div className="
            bg-[#111]
            border
            border-green-500/20
            rounded-2xl
            p-6
          ">
            <div className="
              text-green-400
              text-sm
              mb-2
            ">
              גלריות פעילות
            </div>

            <div className="
              text-4xl
              font-bold
            ">
              {
                galleries.filter(
                  (gallery) =>
                    getGalleryStatus(
                      gallery
                    ).text ===
                    "פעילה"
                ).length
              }
            </div>
          </div>

          <div className="
            bg-[#111]
            border
            border-[#D4AF37]/20
            rounded-2xl
            p-6
          ">
            <div className="
              text-[#D4AF37]
              text-sm
              mb-2
            ">
              הורידו את כל התמונות
            </div>

            <div className="
              text-4xl
              font-bold
            ">
              {
                galleries.filter(
                  (gallery) =>
                    gallery.allImagesDownloaded
                ).length
              }
            </div>
          </div>
        </div>

        {/* EMPTY */}

        {galleries.length === 0 && (
          <div className="
            bg-[#111]
            border
            border-[#2a2a2a]
            rounded-3xl
            p-12
            text-center
          ">
            <div className="
              text-6xl
              mb-5
            ">
              📸
            </div>

            <h2 className="
              text-2xl
              font-bold
              mb-3
            ">
              עדיין אין גלריות
            </h2>

            <p className="text-gray-400">
              צור את הגלריה הראשונה שלך כדי להתחיל.
            </p>
          </div>
        )}

        {/* GALLERIES */}

        {galleries.length > 0 && (
          <div className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          ">

            {galleries.map(
              (gallery) => {
                const status =
                  getGalleryStatus(
                    gallery
                  );

                return (
                  <div
                    key={
                      gallery.id
                    }
                    className="
                      bg-[#111]
                      border
                      border-[#2a2a2a]
                      rounded-3xl
                      p-6
                      hover:border-[#D4AF37]/50
                      transition
                    "
                  >

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                      mb-6
                    ">
                      <div>
                        <h2 className="
                          text-2xl
                          font-bold
                        ">
                          {
                            gallery.name
                          }
                        </h2>

                        <div className="
                          text-gray-500
                          text-sm
                          mt-2
                        ">
                          נוצרה בתאריך{" "}
                          {formatDate(
                            gallery.createdAt
                          )}
                        </div>
                      </div>

                      <div
                        className={`
                          px-3
                          py-1
                          rounded-full
                          border
                          text-xs
                          whitespace-nowrap
                          ${status.className}
                        `}
                      >
                        {
                          status.text
                        }
                      </div>
                    </div>

                    <div className="
                      grid
                      grid-cols-2
                      gap-3
                      mb-6
                    ">

                      <div className="
                        bg-[#0b0b0b]
                        border
                        border-[#222]
                        rounded-xl
                        p-4
                      ">
                        <div className="
                          text-gray-500
                          text-xs
                          mb-1
                        ">
                          תמונות
                        </div>

                        <div className="
                          text-xl
                          font-bold
                        ">
                          {
                            gallery
                              .images
                              .length
                          }
                        </div>
                      </div>

                      <div className="
                        bg-[#0b0b0b]
                        border
                        border-[#222]
                        rounded-xl
                        p-4
                      ">
                        <div className="
                          text-gray-500
                          text-xs
                          mb-1
                        ">
                          תוקף
                        </div>

                        <div className="
                          text-sm
                          font-bold
                        ">
                          {formatDate(
                            gallery.expiresAt
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="
                      bg-[#0b0b0b]
                      border
                      border-[#222]
                      rounded-xl
                      p-4
                      mb-6
                    ">
                      {gallery.allImagesDownloaded ? (
                        <div className="
                          text-green-400
                          font-bold
                        ">
                          ✓ הלקוח הוריד את כל התמונות
                        </div>
                      ) : (
                        <div className="
                          text-gray-400
                        ">
                          ⏳ הלקוח עדיין לא הוריד את כל הגלריה
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="
                      grid
                      grid-cols-1
                      sm:grid-cols-3
                      gap-3
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            gallery
                          )
                        }
                        className="
                          border
                          border-[#D4AF37]/40
                          text-[#D4AF37]
                          py-3
                          rounded-xl
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition
                        "
                      >
                        ✏️ עריכת גלריה
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const link =
                            `${window.location.origin}/gallery/${gallery.slug}`;

                          navigator.clipboard
                            .writeText(
                              link
                            )
                            .then(
                              () => {
                                alert(
                                  "הקישור הועתק בהצלחה"
                                );
                              }
                            )
                            .catch(
                              () => {
                                alert(
                                  "לא ניתן להעתיק את הקישור"
                                );
                              }
                            );
                        }}
                        className="
                          border
                          border-[#333]
                          text-gray-300
                          py-3
                          rounded-xl
                          hover:border-[#D4AF37]
                          transition
                        "
                      >
                        🔗 העתק קישור
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal(
                            gallery
                          )
                        }
                        className="
                          border
                          border-red-500/40
                          text-red-400
                          py-3
                          rounded-xl
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                      >
                        🗑 מחק גלריה
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* CREATE MODAL */}
      {/* ================================================= */}

      {showCreateModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closeCreateModal}
        >
          <div
            dir="rtl"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              w-full
              max-w-5xl
              bg-[#111]
              border
              border-[#D4AF37]/40
              rounded-3xl
              p-6
              md:p-8
            "
          >
            <div className="
              flex
              items-start
              justify-between
              mb-8
            ">
              <div>
                <h2 className="
                  text-3xl
                  font-bold
                  text-[#D4AF37]
                ">
                  📸 יצירת גלריה חדשה
                </h2>

                <p className="
                  text-gray-400
                  mt-2
                ">
                  צור גלריה פרטית ללקוח
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="
                  w-10
                  h-10
                  rounded-full
                  border
                  border-[#333]
                  text-gray-400
                "
              >
                ✕
              </button>
            </div>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            ">

              <div>
                <label className="
                  block
                  text-gray-300
                  mb-2
                ">
                  שם הגלריה
                </label>

                <input
                  value={
                    galleryName
                  }
                  onChange={(event) =>
                    setGalleryName(
                      event.target.value
                    )
                  }
                  placeholder="לדוגמה: חתונה - משפחת כהן"
                  className="
                    w-full
                    bg-[#0b0b0b]
                    border
                    border-[#333]
                    rounded-xl
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-[#D4AF37]
                  "
                />
              </div>

              <div>
                <label className="
                  block
                  text-gray-300
                  mb-2
                ">
                  שם הלקוח
                </label>

                <input
                  value={
                    clientName
                  }
                  onChange={(event) =>
                    setClientName(
                      event.target.value
                    )
                  }
                  placeholder="שם מלא של הלקוח"
                  className="
                    w-full
                    bg-[#0b0b0b]
                    border
                    border-[#333]
                    rounded-xl
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-[#D4AF37]
                  "
                />
              </div>

              <div>
                <label className="
                  block
                  text-gray-300
                  mb-2
                ">
                  סיסמה ללקוח
                </label>

                <input
                  type="text"
                  value={
                    galleryPassword
                  }
                  onChange={(event) =>
                    setGalleryPassword(
                      event.target.value
                    )
                  }
                  placeholder="לפחות 4 תווים"
                  className="
                    w-full
                    bg-[#0b0b0b]
                    border
                    border-[#333]
                    rounded-xl
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-[#D4AF37]
                  "
                />
              </div>

              <div>
                <label className="
                  block
                  text-gray-300
                  mb-2
                ">
                  זמן הגלריה
                </label>

                <select
                  value={
                    expirationDays
                  }
                  onChange={(event) =>
                    setExpirationDays(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    bg-[#0b0b0b]
                    border
                    border-[#333]
                    rounded-xl
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-[#D4AF37]
                  "
                >
                  <option value="7">
                    7 ימים
                  </option>

                  <option value="14">
                    14 ימים
                  </option>

                  <option value="30">
                    30 ימים
                  </option>

                  <option value="60">
                    60 ימים
                  </option>

                  <option value="90">
                    90 ימים
                  </option>

                  <option value="never">
                    ♾️ ללא הגבלת זמן
                  </option>
                </select>
              </div>
            </div>

            <div className="
              flex
              gap-3
              mt-8
            ">
              <button
                type="button"
                onClick={closeCreateModal}
                className="
                  flex-1
                  border
                  border-[#333]
                  text-gray-300
                  py-4
                  rounded-xl
                "
              >
                ביטול
              </button>

              <button
                type="button"
                onClick={
                  handleCreateGallery
                }
                disabled={
                  creating
                }
                className="
                  flex-1
                  bg-[#D4AF37]
                  text-black
                  font-bold
                  py-4
                  rounded-xl
                  disabled:opacity-50
                "
              >
                {creating
                  ? "יוצר..."
                  : "צור גלריה"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT MODAL */}
      {/* ================================================= */}

      {showEditModal &&
        galleryToEdit && (
          <div
            className="
              fixed
              inset-0
              z-[9999]
              bg-black/80
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-4
            "
            onClick={
              closeEditModal
            }
          >
            <div
              dir="rtl"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                w-full
                max-w-6xl
                max-h-[94vh]
                overflow-y-auto
                bg-[#111]
                border
                border-[#D4AF37]/40
                rounded-3xl
                p-6
                md:p-8
              "
            >

              {/* HEADER */}

              <div className="
                flex
                items-start
                justify-between
                mb-8
              ">
                <div>
                  <h2 className="
                    text-3xl
                    font-bold
                    text-[#D4AF37]
                  ">
                    ✏️ עריכת גלריה
                  </h2>

                  <p className="
                    text-gray-400
                    mt-2
                  ">
                    {galleryToEdit.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    border
                    border-[#333]
                    text-gray-400
                  "
                >
                  ✕
                </button>
              </div>

              {/* TOP AREA */}

              <div className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-6
              ">

                {/* פרטים */}

                <div className="
                  bg-[#0b0b0b]
                  border
                  border-[#222]
                  rounded-2xl
                  p-6
                ">
                  <h3 className="
                    text-xl
                    font-bold
                    mb-5
                    text-white
                  ">
                    פרטי הגלריה
                  </h3>

                  <div className="
                    space-y-5
                  ">

                    <div>
                      <label className="
                        block
                        text-gray-300
                        mb-2
                      ">
                        שם הגלריה
                      </label>

                      <input
                        value={
                          editName
                        }
                        onChange={(
                          event
                        ) =>
                          setEditName(
                            event.target
                              .value
                          )
                        }
                        className="
                          w-full
                          bg-[#111]
                          border
                          border-[#333]
                          rounded-xl
                          px-5
                          py-4
                          text-white
                          outline-none
                          focus:border-[#D4AF37]
                        "
                      />
                    </div>

                    <div>
                      <label className="
                        block
                        text-gray-300
                        mb-2
                      ">
                        סיסמה חדשה ללקוח
                      </label>

                      <input
                        type="text"
                        value={
                          editPassword
                        }
                        onChange={(
                          event
                        ) =>
                          setEditPassword(
                            event.target
                              .value
                          )
                        }
                        placeholder="השאר ריק כדי לא לשנות"
                        className="
                          w-full
                          bg-[#111]
                          border
                          border-[#333]
                          rounded-xl
                          px-5
                          py-4
                          text-white
                          outline-none
                          focus:border-[#D4AF37]
                        "
                      />
                    </div>

                    <div>
                      <label className="
                        block
                        text-gray-300
                        mb-2
                      ">
                        תוקף הגלריה
                      </label>

                      <select
                        value={
                          editExpiration
                        }
                        onChange={(
                          event
                        ) =>
                          setEditExpiration(
                            event.target
                              .value
                          )
                        }
                        className="
                          w-full
                          bg-[#111]
                          border
                          border-[#333]
                          rounded-xl
                          px-5
                          py-4
                          text-white
                          outline-none
                          focus:border-[#D4AF37]
                        "
                      >
                        <option value="7">
                          7 ימים מהיום
                        </option>

                        <option value="14">
                          14 ימים מהיום
                        </option>

                        <option value="30">
                          30 ימים מהיום
                        </option>

                        <option value="60">
                          60 ימים מהיום
                        </option>

                        <option value="90">
                          90 ימים מהיום
                        </option>

                        <option value="never">
                          ♾️ ללא הגבלת זמן
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSaveEdit
                      }
                      disabled={
                        savingEdit
                      }
                      className="
                        w-full
                        bg-[#D4AF37]
                        text-black
                        font-bold
                        py-4
                        rounded-xl
                        disabled:opacity-50
                      "
                    >
                      {savingEdit
                        ? "שומר..."
                        : "💾 שמור שינויים"}
                    </button>
                  </div>
                </div>

                {/* תמונות */}

                <div className="
                  bg-[#0b0b0b]
                  border
                  border-[#222]
                  rounded-2xl
                  p-6
                ">
                  <h3 className="
                    text-xl
                    font-bold
                    mb-2
                  ">
                    📸 תמונות בגלריה
                  </h3>

                  <p className="
                    text-gray-500
                    text-sm
                    mb-5
                  ">
                    כרגע קיימות{" "}
                    <span className="
                      text-[#D4AF37]
                      font-bold
                    ">
                      {
                        galleryToEdit
                          .images
                          .length
                      }
                    </span>{" "}
                    תמונות בגלריה.
                  </p>

                  <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  ">

                    <button
                      type="button"
                      onClick={
                        chooseImages
                      }
                      disabled={
                        uploading
                      }
                      className="
                        border
                        border-[#D4AF37]/50
                        text-[#D4AF37]
                        py-4
                        rounded-xl
                        hover:bg-[#D4AF37]
                        hover:text-black
                        transition
                        disabled:opacity-50
                      "
                    >
                      📷 הוסף תמונות
                    </button>

                    <button
                      type="button"
                      onClick={
                        chooseFolder
                      }
                      disabled={
                        uploading
                      }
                      className="
                        border
                        border-[#333]
                        text-gray-300
                        py-4
                        rounded-xl
                        hover:border-[#D4AF37]
                        transition
                        disabled:opacity-50
                      "
                    >
                      📁 הוסף תיקייה שלמה
                    </button>

                  </div>

                  {/* INPUT תמונות */}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageSelection
                    }
                    className="hidden"
                  />

                  {/* INPUT תיקייה */}

                  <input
                    ref={
                      folderInputRef
                    }
                    type="file"
                    accept="image/*"
                    multiple
                    // @ts-ignore
                    webkitdirectory=""
                    // @ts-ignore
                    directory=""
                    onChange={
                      handleFolderSelection
                    }
                    className="hidden"
                  />

                  {uploading && (
                    <div className="
                      mt-5
                      bg-[#111]
                      border
                      border-[#D4AF37]/20
                      rounded-xl
                      p-4
                      text-[#D4AF37]
                      text-center
                    ">
                      ⏳{" "}
                      {
                        uploadProgress
                      }
                    </div>
                  )}

                  {!uploading &&
                    uploadProgress && (
                      <div className="
                        mt-5
                        bg-green-500/10
                        border
                        border-green-500/20
                        rounded-xl
                        p-4
                        text-green-400
                        text-center
                      ">
                        ✓{" "}
                        {
                          uploadProgress
                        }
                      </div>
                    )}

                  <div className="
                    mt-5
                    text-gray-600
                    text-xs
                    leading-6
                  ">
                    ניתן לבחור מספר תמונות יחד,
                    או לבחור תיקייה שלמה.
                    המערכת תעלה את כל התמונות
                    באופן אוטומטי.
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="
                mt-8
                flex
                justify-end
              ">
                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    uploading
                  }
                  className="
                    border
                    border-[#333]
                    text-gray-300
                    px-8
                    py-3
                    rounded-xl
                    hover:border-[#D4AF37]
                    transition
                  "
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      {showDeleteModal &&
        galleryToDelete && (
          <div
            className="
              fixed
              inset-0
              z-[10000]
              bg-black/80
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-4
            "
            onClick={
              closeDeleteModal
            }
          >
            <div
              dir="rtl"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                w-full
                max-w-lg
                bg-[#111]
                border
                border-red-500/40
                rounded-3xl
                p-7
              "
            >

              <div className="
                text-center
                mb-6
              ">
                <div className="
                  text-5xl
                  mb-4
                ">
                  ⚠️
                </div>

                <h2 className="
                  text-2xl
                  font-bold
                ">
                  מחיקת גלריה
                </h2>

                <div className="
                  text-[#D4AF37]
                  font-bold
                  text-lg
                  mt-3
                ">
                  {
                    galleryToDelete.name
                  }
                </div>
              </div>

              <div className="
                bg-red-500/10
                border
                border-red-500/20
                rounded-2xl
                p-4
                mb-6
                text-red-300
                text-sm
                leading-6
              ">
                ⚠️ פעולה זו תמחק את הגלריה
                ואת כל התמונות הקשורות אליה.
                <br />
                לא ניתן יהיה לשחזר אותה מתוך
                המערכת.
              </div>

              <label className="
                block
                text-gray-300
                mb-2
              ">
                סיסמת מנהל למחיקה
              </label>

              <input
                type="password"
                value={
                  deletePassword
                }
                onChange={(event) =>
                  setDeletePassword(
                    event.target
                      .value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !deleting
                  ) {
                    handleDeleteGallery();
                  }
                }}
                placeholder="הזן סיסמת מנהל"
                autoFocus
                className="
                  w-full
                  bg-[#0b0b0b]
                  border
                  border-[#333]
                  rounded-xl
                  px-5
                  py-4
                  text-white
                  outline-none
                  focus:border-red-500
                  mb-6
                "
              />

              <div className="
                grid
                grid-cols-2
                gap-3
              ">
                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    deleting
                  }
                  className="
                    border
                    border-[#333]
                    text-gray-300
                    py-4
                    rounded-xl
                    disabled:opacity-50
                  "
                >
                  ביטול
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteGallery
                  }
                  disabled={
                    deleting
                  }
                  className="
                    bg-red-600
                    text-white
                    font-bold
                    py-4
                    rounded-xl
                    hover:bg-red-700
                    disabled:opacity-50
                  "
                >
                  {deleting
                    ? "מוחק..."
                    : "🗑 מחק לצמיתות"}
                </button>
              </div>

              <div className="
                text-center
                text-gray-600
                text-xs
                mt-4
              ">
                סיסמת מנהל זמנית
              </div>
            </div>
          </div>
        )}
    </div>
  );
}