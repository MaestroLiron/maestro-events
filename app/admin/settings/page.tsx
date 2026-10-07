"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("signature");

  return (
    <div
      dir="rtl"
    className="min-h-screen bg-[#090909] text-white px-4 md:px-8 pt-24 pb-8"
    >
      {/* כותרת */}
      <div className="mb-8">
        <div className="text-[#D4AF37] text-sm font-bold tracking-[0.25em] mb-2">
          MAESTRO EVENTS
        </div>

        <h1 className="text-3xl md:text-4xl font-black">
          הגדרות
        </h1>

        <p className="text-gray-400 mt-2">
          ניהול חתימת העסק, משתמשים והרשאות מערכת
        </p>
      </div>

      {/* תפריט הגדרות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveSection("signature")}
          className={`rounded-2xl border p-5 text-right transition ${
            activeSection === "signature"
              ? "border-[#D4AF37] bg-[#D4AF37]/10"
              : "border-white/10 bg-white/5 hover:border-[#D4AF37]/50"
          }`}
        >
          <div className="text-3xl mb-3">✍️</div>

          <div className="font-black text-lg">
            חתימת העסק
          </div>

          <div className="text-sm text-gray-400 mt-1">
            העלאה וניהול של חתימת העסק
          </div>
        </button>

        <button
          onClick={() => setActiveSection("users")}
          className={`rounded-2xl border p-5 text-right transition ${
            activeSection === "users"
              ? "border-[#D4AF37] bg-[#D4AF37]/10"
              : "border-white/10 bg-white/5 hover:border-[#D4AF37]/50"
          }`}
        >
          <div className="text-3xl mb-3">👤</div>

          <div className="font-black text-lg">
            משתמשים והרשאות
          </div>

          <div className="text-sm text-gray-400 mt-1">
            יצירת משתמשים וניהול הרשאות
          </div>
        </button>

        <button
          onClick={() => setActiveSection("password")}
          className={`rounded-2xl border p-5 text-right transition ${
            activeSection === "password"
              ? "border-[#D4AF37] bg-[#D4AF37]/10"
              : "border-white/10 bg-white/5 hover:border-[#D4AF37]/50"
          }`}
        >
          <div className="text-3xl mb-3">🔐</div>

          <div className="font-black text-lg">
            שינוי סיסמה
          </div>

          <div className="text-sm text-gray-400 mt-1">
            שינוי הסיסמה של המשתמש המחובר
          </div>
        </button>
      </div>

      {/* תוכן */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8">

        {/* חתימה */}
        {activeSection === "signature" && (
          <SignatureSettings />
        )}

        {/* משתמשים */}
        {activeSection === "users" && (
          <UsersSettings />
        )}

        {/* סיסמה */}
        {activeSection === "password" && (
          <PasswordSettings />
        )}

      </div>
    </div>
  );
}


/* =========================================================
   חתימת העסק
========================================================= */

function SignatureSettings() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSignature, setLoadingSignature] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // טעינת חתימה קיימת
  // =========================================================

  useEffect(() => {
    async function loadSignature() {
      try {
        setLoadingSignature(true);
        setError("");

        const response = await fetch(
          "/api/admin/business-signature",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "שגיאה בטעינת חתימת העסק"
          );
        }

        if (data.businessSignatureData) {
          setPreview(data.businessSignatureData);
        }
      } catch (error) {
        console.error(
          "LOAD BUSINESS SIGNATURE ERROR:",
          error
        );

        setError("שגיאה בטעינת חתימת העסק");
      } finally {
        setLoadingSignature(false);
      }
    }

    loadSignature();
  }, []);

  // =========================================================
  // בחירת חתימה
  // =========================================================

  function handleSignatureUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("יש להעלות קובץ תמונה בלבד.");
      return;
    }

    // הגבלת גודל ל־5MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "הקובץ גדול מדי. ניתן להעלות תמונה עד 5MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result as string);
    };

    reader.onerror = () => {
      setError("אירעה שגיאה בקריאת הקובץ.");
    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // שמירת חתימה
  // =========================================================

  async function saveSignature() {
    if (!preview) {
      setError("יש לבחור חתימה לפני השמירה.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/business-signature",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessSignatureData: preview,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "שגיאה בשמירת חתימת העסק"
        );
        return;
      }

      setPreview(
        data.businessSignatureData || preview
      );

      setMessage(
        "✓ חתימת העסק נשמרה בהצלחה"
      );
    } catch (error) {
      console.error(
        "SAVE BUSINESS SIGNATURE ERROR:",
        error
      );

      setError(
        "אירעה שגיאה בחיבור למערכת"
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // מחיקת חתימה
  // =========================================================

  async function deleteSignature() {
    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך למחוק את חתימת העסק?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/business-signature",
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "שגיאה במחיקת חתימת העסק"
        );
        return;
      }

      setPreview(null);

      setMessage(
        "✓ חתימת העסק נמחקה"
      );
    } catch (error) {
      console.error(
        "DELETE BUSINESS SIGNATURE ERROR:",
        error
      );

      setError(
        "אירעה שגיאה בחיבור למערכת"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">
          ✍️ חתימת העסק
        </h2>

        <p className="text-gray-400 mt-2">
          העלה את תמונת החתימה שלך. החתימה תישמר
          במערכת ותוכל לשמש בהמשך לחוזים.
        </p>
      </div>

      {/* הודעת שגיאה */}
      {error && (
        <div className="mb-5 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {/* הודעת הצלחה */}
      {message && (
        <div className="mb-5 max-w-2xl rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
          {message}
        </div>
      )}

      <div className="max-w-2xl">

        {/* טעינה */}
        {loadingSignature ? (
          <div className="border border-white/10 rounded-2xl p-10 text-center text-gray-400">
            טוען את חתימת העסק...
          </div>
        ) : (
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-[#D4AF37]/60 transition">

            {preview ? (
              <div>
                {/* תצוגת חתימה */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <img
                    src={preview}
                    alt="חתימת העסק"
                    className="max-h-40 max-w-full mx-auto object-contain"
                  />
                </div>

                <p className="text-green-400 font-bold mb-5">
                  ✓ חתימת העסק מוכנה
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">

                  {/* החלפת חתימה */}
                  <label className="inline-flex items-center justify-center cursor-pointer bg-[#D4AF37] hover:bg-[#e5c451] text-black font-black px-6 py-3 rounded-xl transition">
                    החלף חתימה

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </label>

                  {/* מחיקה */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={deleteSignature}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-6 py-3 rounded-xl transition disabled:opacity-50"
                  >
                    🗑️ מחק חתימה
                  </button>

                </div>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">
                  ✍️
                </div>

                <h3 className="text-xl font-black mb-2">
                  העלאת חתימה
                </h3>

                <p className="text-gray-400 mb-6">
                  מומלץ להעלות PNG עם רקע שקוף
                </p>

                <label className="inline-flex cursor-pointer bg-[#D4AF37] hover:bg-[#e5c451] text-black font-black px-7 py-3 rounded-xl transition">
                  📁 בחר תמונת חתימה

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

          </div>
        )}

        {/* שמירה */}
        {preview && (
          <button
            type="button"
            disabled={loading || loadingSignature}
            onClick={saveSignature}
            className="mt-5 w-full bg-[#D4AF37] hover:bg-[#e5c451] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition"
          >
            {loading
              ? "שומר..."
              : "💾 שמור חתימה"}
          </button>
        )}

      </div>
    </div>
  );
}


/* =========================================================
   משתמשים והרשאות
========================================================= */

function UsersSettings() {
  const [users, setUsers] = useState<any[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     טעינת משתמשים
  ========================================================= */

  async function loadUsers() {
    try {
      setError("");

      const response = await fetch("/api/admin/users");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "שגיאה בטעינת המשתמשים"
        );
      }

      setUsers(data);
    } catch (error) {
      console.error(error);
      setError("שגיאה בטעינת המשתמשים");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================================================
     הוספת משתמש
  ========================================================= */

  async function addUser() {
    setMessage("");
    setError("");

    if (!username.trim() || !password) {
      setError("יש למלא שם משתמש וסיסמה");
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "שגיאה ביצירת המשתמש"
        );
        return;
      }

      setUsername("");
      setPassword("");
      setRole("employee");

      setMessage("✓ המשתמש נוסף בהצלחה");

      await loadUsers();
    } catch (error) {
      console.error(error);
      setError("שגיאה ביצירת המשתמש");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     הפעלה / השבתה
  ========================================================= */

  async function toggleUser(user: any) {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "שגיאה בעדכון המשתמש"
        );
        return;
      }

      setMessage(
        user.isActive
          ? "✓ המשתמש הושבת"
          : "✓ המשתמש הופעל"
      );

      await loadUsers();
    } catch (error) {
      console.error(error);
      setError("שגיאה בעדכון המשתמש");
    }
  }

  /* =========================================================
     שינוי תפקיד
  ========================================================= */

  async function changeRole(
    user: any,
    newRole: string
  ) {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "שגיאה בעדכון התפקיד"
        );
        return;
      }

      setMessage("✓ התפקיד עודכן");

      await loadUsers();
    } catch (error) {
      console.error(error);
      setError("שגיאה בעדכון התפקיד");
    }
  }

  /* =========================================================
     מחיקת משתמש
  ========================================================= */

  async function deleteUser(user: any) {
    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למחוק את המשתמש "${user.username}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "שגיאה במחיקת המשתמש"
        );
        return;
      }

      setMessage("✓ המשתמש נמחק");

      await loadUsers();
    } catch (error) {
      console.error(error);
      setError("שגיאה במחיקת המשתמש");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">
          👤 משתמשים והרשאות
        </h2>

        <p className="text-gray-400 mt-2">
          כאן ננהל את המשתמשים שיכולים להיכנס לדאשבורד.
        </p>
      </div>

      {/* הודעת שגיאה */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {/* הודעת הצלחה */}
      {message && (
        <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
          {message}
        </div>
      )}

      {/* =====================================================
          הוספת משתמש
      ===================================================== */}

      <div className="border border-white/10 rounded-2xl p-5 mb-6">
        <h3 className="text-lg font-black mb-5">
          הוספת משתמש חדש
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* שם משתמש */}
          <input
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          {/* סיסמה */}
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          {/* תפקיד */}
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
          >
            <option value="admin">
              מנהל — גישה מלאה
            </option>

            <option value="employee">
              עובד — גישה מוגבלת
            </option>

            <option value="viewer">
              צפייה בלבד
            </option>
          </select>

          {/* הוספה */}
          <button
            type="button"
            disabled={loading}
            onClick={addUser}
            className="bg-[#D4AF37] hover:bg-[#e5c451] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black rounded-xl px-4 py-3 transition"
          >
            {loading
              ? "מוסיף..."
              : "➕ הוסף משתמש"}
          </button>

        </div>
      </div>

      {/* =====================================================
          משתמשים קיימים
      ===================================================== */}

      <div className="border border-white/10 rounded-2xl p-5">

        <h3 className="text-lg font-black mb-5">
          משתמשים במערכת
        </h3>

        {users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            אין משתמשים להצגה.
          </div>
        ) : (
          <div className="space-y-3">

            {users.map((user) => (
              <div
                key={user.id}
                className="border border-white/10 rounded-2xl p-4 bg-black/20"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                  {/* משתמש */}
                  <div className="flex-1">
                    <div className="font-black text-lg">
                      {user.username}
                    </div>

                    <div
                      className={`text-sm mt-1 ${
                        user.isActive
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {user.isActive
                        ? "● פעיל"
                        : "● מושבת"}
                    </div>
                  </div>

                  {/* תפקיד */}
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeRole(
                        user,
                        e.target.value
                      )
                    }
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="admin">
                      מנהל
                    </option>

                    <option value="employee">
                      עובד
                    </option>

                    <option value="viewer">
                      צפייה בלבד
                    </option>
                  </select>

                  {/* הפעלה / השבתה */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleUser(user)
                    }
                    className={`rounded-xl px-4 py-2 font-bold transition ${
                      user.isActive
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {user.isActive
                      ? "השבת"
                      : "הפעל"}
                  </button>

                  {/* מחיקה */}
                  <button
                    type="button"
                    onClick={() =>
                      deleteUser(user)
                    }
                    className="rounded-xl px-4 py-2 font-bold bg-white/5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    🗑️ מחק
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}


/* =========================================================
   שינוי סיסמה
========================================================= */

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function changePassword() {
    setMessage("");
    setError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("יש למלא את כל השדות");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "הסיסמה החדשה חייבת להכיל לפחות 6 תווים"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות החדשות אינן זהות");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "אירעה שגיאה בשינוי הסיסמה"
        );
        return;
      }

      setMessage(
        "✓ הסיסמה שונתה בהצלחה"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setError(
        "אירעה שגיאה בחיבור למערכת"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">
          🔐 שינוי סיסמה
        </h2>

        <p className="text-gray-400 mt-2">
          שינוי הסיסמה של המשתמש המחובר.
        </p>
      </div>

      <div className="max-w-xl space-y-4">

        {/* סיסמה נוכחית */}
        <input
          type="password"
          placeholder="סיסמה נוכחית"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
        />

        {/* סיסמה חדשה */}
        <input
          type="password"
          placeholder="סיסמה חדשה"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
        />

        {/* אימות */}
        <input
          type="password"
          placeholder="אימות סיסמה חדשה"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
        />

        {/* הודעת שגיאה */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* הודעת הצלחה */}
        {message && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
            {message}
          </div>
        )}

        {/* שמירה */}
        <button
          type="button"
          disabled={loading}
          onClick={changePassword}
          className="w-full bg-[#D4AF37] hover:bg-[#e5c451] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition"
        >
          {loading
            ? "שומר..."
            : "🔐 שמור סיסמה חדשה"}
        </button>

      </div>
    </div>
  );
}