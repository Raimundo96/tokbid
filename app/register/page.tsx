"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isValidUsername } from "@/lib/utils/format";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!isValidUsername(cleanUsername)) {
      setError("El nombre de usuario debe tener 3-20 caracteres: letras, números o _.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Comprobar disponibilidad antes de registrar
    const { data: existing } = await supabase
      .from("public_profiles")
      .select("id")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("Ese nombre de usuario ya está en uso, prueba otro.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setLoading(false);
      setError(`No se pudo completar el registro: ${signUpError.message}`);
      return;
    }

    // Si la confirmación por email está activada, no hay sesión todavía:
    // no podemos guardar el username hasta que el usuario confirme e inicie sesión.
    if (!data.session || !data.user) {
      setLoading(false);
      setNeedsEmailConfirm(true);
      return;
    }

    const { error: usernameError } = await supabase
      .from("profiles")
      .update({ username: cleanUsername })
      .eq("id", data.user.id);

    setLoading(false);

    if (usernameError) {
      setError(
        usernameError.code === "23505"
          ? "Ese nombre de usuario ya está en uso, prueba otro."
          : "Cuenta creada, pero no se pudo guardar el nombre de usuario. Podrás configurarlo al iniciar sesión."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (needsEmailConfirm) {
    return (
      <section className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
        <span className="text-3xl">✅</span>
        <h1 className="mt-3 font-display text-xl font-bold">Revisa tu email</h1>
        <p className="mt-2 text-sm text-white/50">
          Te hemos enviado un enlace de confirmación. Cuando confirmes e inicies sesión,
          te pediremos tu nombre de usuario.
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
          <label htmlFor="username" className="mb-1 block text-xs text-white/50">
            Nombre de usuario público
          </label>
          <input
            id="username"
            type="text"
            required
            placeholder="ej. juanperez"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="focus-ring w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
          <p className="mt-1 text-[11px] text-white/30">
            Esto es lo que verán los demás junto a tus pujas.
          </p>
        </div>
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
