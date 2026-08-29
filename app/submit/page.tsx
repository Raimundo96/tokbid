"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isValidCreatorUsername } from "@/lib/utils/format";
import { Creator, SubmitCreatorResult } from "@/lib/types";

const COUNTRIES = [
  { code: "es", label: "🇪🇸 España" },
  { code: "mx", label: "🇲🇽 México" },
  { code: "ar", label: "🇦🇷 Argentina" },
  { code: "gq", label: "🇬🇶 Guinea Ecuatorial" },
  { code: "ng", label: "🇳🇬 Nigeria" },
];

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Debes iniciar sesión para añadir un creador.",
  invalid_username: "El usuario de TikTok debe tener 2-24 caracteres: letras minúsculas, números, puntos o _.",
  invalid_display_name: "Escribe un nombre para mostrar.",
  too_many_creators: "Ya tienes 5 creadores en el ranking, ese es el máximo por usuario.",
  username_taken: "Ese usuario de TikTok ya está en el ranking.",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pendiente de aprobación",
  active: "✅ Activo en el ranking",
  suspended: "⛔ Suspendido",
};

export default function SubmitCreatorPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [myCreators, setMyCreators] = useState<Creator[]>([]);

  const [tiktokUsername, setTiktokUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("es");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [followers, setFollowers] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadMyCreators() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    setAuthed(!!userData.user);
    if (!userData.user) return;

    const { data } = await supabase
      .from("creators")
      .select("*")
      .eq("owner_id", userData.user.id)
      .order("created_at", { ascending: false });

    setMyCreators((data as Creator[]) ?? []);
  }

  useEffect(() => {
    loadMyCreators();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!isValidCreatorUsername(tiktokUsername)) {
      setMessage({ type: "error", text: ERROR_MESSAGES.invalid_username });
      return;
    }
    if (!displayName.trim()) {
      setMessage({ type: "error", text: ERROR_MESSAGES.invalid_display_name });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("submit_creator", {
      p_tiktok_username: tiktokUsername.trim(),
      p_display_name: displayName.trim(),
      p_country: country,
      p_avatar_url: avatarUrl.trim(),
      p_followers: followers ? Number(followers) : 0,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "No se pudo enviar. Inténtalo de nuevo." });
      return;
    }

    const result = data as SubmitCreatorResult;

    if (!result.success) {
      setMessage({
        type: "error",
        text: (result.error && ERROR_MESSAGES[result.error]) || "No se pudo enviar.",
      });
      return;
    }

    setMessage({ type: "success", text: "🔥 ¡Ya está en el ranking! A partir de ahora cualquiera puede pujar por él." });
    setTiktokUsername("");
    setDisplayName("");
    setAvatarUrl("");
    setFollowers("");
    loadMyCreators();
  }

  if (authed === false) {
    return (
      <section className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
        <span className="text-3xl">🔒</span>
        <h1 className="mt-3 font-display text-xl font-bold">Inicia sesión primero</h1>
        <p className="mt-2 text-sm text-white/50">
          Necesitas una cuenta para añadir un creador al ranking.
        </p>
        <Link href="/login" className="mt-6 text-sm text-neon-cyan underline">
          Ir a iniciar sesión
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold">Añade tu creador ⚔️</h1>
      <p className="mt-1 text-sm text-white/50">
        Añade cualquier perfil de TikTok al ranking. Empieza en $1 y se activa al instante.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs text-white/50">Usuario de TikTok (sin @)</label>
          <input
            type="text"
            required
            placeholder="ej. mia.dance"
            value={tiktokUsername}
            onChange={(e) => setTiktokUsername(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Nombre para mostrar</label>
          <input
            type="text"
            required
            placeholder="ej. Mia Torres"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">País</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Foto de perfil (URL, opcional)</label>
          <input
            type="url"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Seguidores (opcional)</label>
          <input
            type="number"
            min={0}
            placeholder="ej. 500000"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-neon-cyan" : "text-neon-pink"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 rounded-full bg-neon-pink py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-neon-pink disabled:opacity-50"
        >
          {loading ? "Enviando..." : "⚔️ Enviar para aprobación"}
        </button>
      </form>

      {myCreators.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 font-display text-lg font-bold">Mis creadores</h2>
          <ul className="space-y-2">
            {myCreators.map((c) => (
              <li
                key={c.id}
                className="card-panel flex items-center justify-between rounded-xl border border-base-line px-4 py-3 text-sm"
              >
                <span>@{c.tiktok_username}</span>
                <span className="text-xs text-white/50">{STATUS_LABEL[c.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
