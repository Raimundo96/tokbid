export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-ES")}`;
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

export function countryFlag(code: string | null): string {
  const flags: Record<string, string> = {
    es: "🇪🇸",
    mx: "🇲🇽",
    ar: "🇦🇷",
    gq: "🇬🇶",
    ng: "🇳🇬",
    global: "🌎",
  };
  return flags[code ?? ""] ?? "🌎";
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_REGEX.test(value);
}
