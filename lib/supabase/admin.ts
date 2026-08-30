import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente "admin" de Supabase con la service_role key: BYPASS de RLS.
// SOLO se usa en el webhook de Stripe (servidor), nunca en el cliente
// ni en ninguna ruta pública. SUPABASE_SERVICE_ROLE_KEY no lleva
// NEXT_PUBLIC_, así que nunca llega al navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
