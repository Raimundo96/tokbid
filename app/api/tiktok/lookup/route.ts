import { NextResponse } from "next/server";

/**
 * Normaliza @usuario / usuario / URL → username limpio
 */
function normalizeUsername(input: string): string | null {
  let value = input.trim().replace(/\s+/g, "");

  if (/tiktok\.com/i.test(value)) {
    try {
      if (!value.startsWith("http")) value = "https://" + value;
      const url = new URL(value);
      const match = url.pathname.match(/@([A-Za-z0-9._]{2,24})/);
      if (match) return match[1].toLowerCase();
    } catch {
      /* ignore */
    }
    const match = value.match(/tiktok\.com\/@([A-Za-z0-9._]{2,24})/i);
    if (match) return match[1].toLowerCase();
    return null;
  }

  if (value.startsWith("@")) value = value.slice(1);
  value = value.replace(/[^A-Za-z0-9._]/g, "");
  if (value.length < 2 || value.length > 24) return null;
  return value.toLowerCase();
}

/**
 * Intenta extraer userInfo del HTML de TikTok con varios fallbacks.
 */
function extractFromHtml(html: string): {
  displayName: string | null;
  avatarUrl: string | null;
  followers: number;
  fetched: boolean;
} {
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let followers = 0;
  let fetched = false;

  // --- 1) __UNIVERSAL_DATA_FOR_REHYDRATION__ (formato actual) ---
  const universalMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (universalMatch) {
    try {
      const data = JSON.parse(universalMatch[1]);
      const scope = data?.__DEFAULT_SCOPE__ ?? data;
      const userInfo =
        scope?.["webapp.user-detail"]?.userInfo ??
        scope?.["webapp.user-detail"]?.userInfo?.userInfo ??
        null;
      const user = userInfo?.user ?? userInfo;
      const stats = userInfo?.stats ?? userInfo?.statsV2;

      if (user?.nickname || user?.uniqueId) {
        displayName = user.nickname || user.uniqueId;
        fetched = true;
      }
      if (user?.avatarLarger || user?.avatarMedium || user?.avatarThumb) {
        avatarUrl = user.avatarLarger || user.avatarMedium || user.avatarThumb;
        fetched = true;
      }
      const fc = stats?.followerCount ?? stats?.followerCount;
      if (typeof fc === "number" && fc > 0) {
        followers = fc;
        fetched = true;
      } else if (typeof fc === "string" && Number(fc) > 0) {
        followers = Number(fc);
        fetched = true;
      }
    } catch {
      /* formato cambió */
    }
  }

  // --- 2) SIGI_STATE (formato antiguo, a veces sigue apareciendo) ---
  if (!fetched) {
    const sigiMatch = html.match(
      /<script[^>]*id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i
    );
    if (sigiMatch) {
      try {
        const data = JSON.parse(sigiMatch[1]);
        const userModule = data?.UserModule?.users ?? data?.UserModule;
        if (userModule && typeof userModule === "object") {
          const firstKey = Object.keys(userModule)[0];
          const user = userModule[firstKey];
          if (user?.nickname) {
            displayName = user.nickname;
            fetched = true;
          }
          if (user?.avatarLarger || user?.avatarMedium) {
            avatarUrl = user.avatarLarger || user.avatarMedium;
            fetched = true;
          }
          if (typeof user?.followerCount === "number") {
            followers = user.followerCount;
            fetched = true;
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  // --- 3) Buscar en cualquier script un bloque con uniqueId + followerCount ---
  if (!fetched) {
    const scripts = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of scripts) {
      const text = m[1];
      if (!text.includes("uniqueId") || !text.includes("followerCount")) continue;
      try {
        // Intento de encontrar un objeto JSON razonable
        const jsonMatch = text.match(
          /\{[^{}]*"uniqueId"\s*:\s*"[^"]+"[^{}]*"followerCount"\s*:\s*\d+[^{}]*\}/
        );
        if (jsonMatch) {
          const obj = JSON.parse(jsonMatch[0]);
          if (obj.nickname) displayName = obj.nickname;
          if (obj.avatarLarger || obj.avatarMedium) {
            avatarUrl = obj.avatarLarger || obj.avatarMedium;
          }
          if (typeof obj.followerCount === "number") {
            followers = obj.followerCount;
          }
          fetched = true;
          break;
        }
      } catch {
        /* continue */
      }
    }
  }

  // --- 4) Meta Open Graph (más estable, menos datos) ---
  if (!avatarUrl) {
    const ogImage = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );
    if (ogImage) {
      avatarUrl = ogImage[1];
      fetched = true;
    }
  }
  if (!displayName) {
    const ogTitle = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    );
    if (ogTitle) {
      displayName = ogTitle[1].replace(/\s*\(@[^)]*\)\s*$/, "").trim() || null;
      if (displayName) fetched = true;
    }
  }

  // --- 5) JSON-LD ---
  if (!fetched) {
    const ldMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1]);
        if (ld?.name) displayName = ld.name;
        if (ld?.image) avatarUrl = typeof ld.image === "string" ? ld.image : ld.image?.url;
        if (displayName || avatarUrl) fetched = true;
      } catch {
        /* ignore */
      }
    }
  }

  return { displayName, avatarUrl, followers, fetched };
}

export async function POST(request: Request) {
  const body = await request.json();
  const raw = body.url || body.username || body.q || "";

  if (typeof raw !== "string" || !raw.trim()) {
    return NextResponse.json(
      { error: "Escribe un @usuario o pega un enlace de TikTok" },
      { status: 400 }
    );
  }

  let username = normalizeUsername(raw);
  let html = "";

  // Construir URL del perfil
  const profileUrl = username
    ? `https://www.tiktok.com/@${username}`
    : raw.startsWith("http")
      ? raw
      : `https://www.tiktok.com/@${raw.replace(/^@/, "")}`;

  try {
    const res = await fetch(profileUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    // Si TikTok redirigió (enlaces cortos), re-extraer username
    if (res.url) {
      const fromFinal = normalizeUsername(res.url);
      if (fromFinal) username = fromFinal;
    }

    html = await res.text();
  } catch {
    // Si falla el fetch, seguimos solo con el username
  }

  if (!username) {
    username = normalizeUsername(raw);
  }

  if (!username) {
    return NextResponse.json(
      {
        error:
          "No se pudo identificar el usuario. Prueba con @usuario o la URL completa del perfil.",
      },
      { status: 400 }
    );
  }

  const extracted = extractFromHtml(html);

  return NextResponse.json({
    username,
    displayName: extracted.displayName || username,
    avatarUrl: extracted.avatarUrl,
    followers: extracted.followers,
    fetched: extracted.fetched,
    // Señal clara para el frontend
    limitedData: !extracted.fetched || extracted.followers === 0,
  });
}
