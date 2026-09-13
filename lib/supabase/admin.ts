import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente "admin": bypass de RLS. SOLO se usa en el webhook de Stripe.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
