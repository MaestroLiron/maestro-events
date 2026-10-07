"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "שם המשתמש או הסיסמה שגויים");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();

    } catch (error) {
      console.error(error);
      setError("אירעה שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-black
      "
    >

      {/* Glow Background */}

      <div
        className="
          absolute
          w-[700px]
          h-[700px]
          rounded-full
          bg-yellow-500/10
          blur-[180px]
        "
      />

      {/* Login Card */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-sm
          rounded-3xl
          border
          border-yellow-500/40
          bg-white/5
          backdrop-blur-2xl
          p-7
          shadow-[0_0_50px_rgba(212,175,55,0.25)]
        "
      >

        {/* Logo */}

        <div className="flex justify-center mb-5">

          <Image
            src="/logo.png"
            alt="Maestro Events"
            width={260}
            height={150}
            priority
            className="
              w-[240px]
              h-auto
              select-none
              drop-shadow-[0_0_25px_rgba(212,175,55,0.45)]
            "
          />

        </div>

        {/* Username */}

        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full
            mb-4
            rounded-xl
            border
            border-white/20
            bg-white/10
            p-3
            text-white
            placeholder:text-gray-300
            outline-none
            focus:border-yellow-400
            focus:ring-2
            focus:ring-yellow-500/30
          "
        />

        {/* Password */}

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            mb-5
            rounded-xl
            border
            border-white/20
            bg-white/10
            p-3
            text-white
            placeholder:text-gray-300
            outline-none
            focus:border-yellow-400
            focus:ring-2
            focus:ring-yellow-500/30
          "
        />

        {/* Error */}

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Login */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            rounded-xl
            bg-gradient-to-r
            from-yellow-400
            via-yellow-500
            to-yellow-600
            py-3
            text-black
            text-lg
            font-bold
            transition-all
            hover:scale-105
            hover:shadow-[0_0_30px_rgba(255,215,0,0.8)]
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "מתחבר..." : "התחבר"}
        </button>

      </div>

    </main>
  );
}