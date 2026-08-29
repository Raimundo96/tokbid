"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("No se pudo iniciar sesión. Revisa tu email y contraseña.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col px-4 py-20">
      <h1 className="font-display text-2xl font-bold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-white/50">Entra para poder pujar en el ranking.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs text-white/50">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs text-white/50">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-neon-pink">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 rounded-full bg-neon-pink py-3 text-sm font-bold shadow-neon-pink disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-neon-cyan underline">Regístrate</Link>
      </p>
    </section>
  );
}
