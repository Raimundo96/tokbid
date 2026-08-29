"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError("No se pudo completar el registro. Inténtalo de nuevo.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <section className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
        <span className="text-3xl">✅</span>
        <h1 className="mt-3 font-display text-xl font-bold">Revisa tu email</h1>
        <p className="mt-2 text-sm text-white/50">
          Te hemos enviado un enlace de confirmación para activar tu cuenta.
        </p>
        <Link href="/login" className="mt-6 text-sm text-neon-cyan underline">
          Ir a iniciar sesión
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col px-4 py-20">
      <h1 className="font-display text-2xl font-bold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-white/50">Regístrate para empezar a pujar.</p>

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
            minLength={6}
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
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-neon-cyan underline">Inicia sesión</Link>
      </p>
    </section>
  );
}
