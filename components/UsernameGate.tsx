"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidUsername } from "@/lib/utils/format";

export default function UsernameGate() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [needsUsername, setNeedsUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && !profile.username) {
        setUserId(user.id);
        setNeedsUsername(true);
      }
    }

    check();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    const cleanUsername = username.trim();
    if (!isValidUsername(cleanUsername)) {
      setError("Debe tener 3-20 caracteres: letras, números o _.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: cleanUsername })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "Ese nombre de usuario ya está en uso, prueba otro."
          : "No se pudo guardar. Inténtalo de nuevo."
      );
      return;
    }

    setNeedsUsername(false);
  }

  if (!needsUsername) return null;

  return (
    <div className="border-b border-neon-pink/30 bg-neon-pink/5 px-4 py-3">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-white/70 sm:flex-1">
          🔥 Elige tu nombre de usuario público para poder pujar.
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          <input
            type="text"
            required
            placeholder="ej. juanperez"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="focus-ring flex-1 rounded-lg border border-base-line bg-base-panel px-3 py-1.5 text-sm sm:w-40"
          />
          <button
            type="submit"
            disabled={loading}
            className="focus-ring rounded-full bg-neon-pink px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "..." : "Guardar"}
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-center text-xs text-neon-pink">{error}</p>}
    </div>
  );
}
