import { NextResponse } from "next/server";

// Extrae el @usuario de una URL de TikTok, admitiendo enlaces normales
// y enlaces cortos (vm.tiktok.com) una vez resueltos.
function extractUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([a-zA-Z0-9._]{2,24})/i);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (typeof url !== "string" || !url.includes("tiktok.com")) {
    return NextResponse.json({ error: "Pega un enlace válido de TikTok" }, { status: 400 });
  }

  let finalUrl = url;
  let html = "";
  let fetchStatus: number | null = null;
  let fetchErrorMessage: string | null = null;

  try {
    // Nos hacemos pasar por un navegador normal para aumentar las
    // probabilidades de que TikTok nos devuelva la página completa.
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });
    finalUrl = res.url;
    fetchStatus = res.status;
    html = await res.text();
  } catch (err) {
    // Si falla la petición, seguimos solo con lo que podamos sacar de la URL.
    fetchErrorMessage = err instanceof Error ? err.message : "error desconocido";
  }

  const username = extractUsername(finalUrl) ?? extractUsername(url);
  if (!username) {
    return NextResponse.json(
      { error: "No se pudo identificar el usuario de TikTok en ese enlace" },
      { status: 400 }
    );
  }

  let displayName = username;
  let avatarUrl: string | null = null;
  let followers = 0;
  let fetched = false;

  // Intento 1: el JSON interno que TikTok incrusta en la página
  // (más completo, pero TikTok puede cambiar su formato sin avisar).
  const jsonMatch = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const userInfo =
        data?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo ??
        data?.["webapp.user-detail"]?.userInfo;
      const user = userInfo?.user;
      const stats = userInfo?.stats;

      if (user?.nickname) {
        displayName = user.nickname;
        fetched = true;
      }
      if (user?.avatarLarger || user?.avatarMedium) {
        avatarUrl = user.avatarLarger ?? user.avatarMedium;
        fetched = true;
      }
      if (typeof stats?.followerCount === "number") {
        followers = stats.followerCount;
      }
    } catch {
      // El formato interno cambió o no se pudo parsear: seguimos con el plan B.
    }
  }

  // Intento 2 (plan B): metaetiquetas Open Graph, más estables aunque menos completas.
  if (!fetched) {
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (ogImage) {
      avatarUrl = ogImage[1];
      fetched = true;
    }
    if (ogTitle) {
      displayName = ogTitle[1].replace(/\s*\(@.*\)\s*$/, "") || username;
    }
  }

  // Si no se pudo leer nada, devolvemos igualmente el @usuario:
  // la persona podrá pujar aunque no tengamos foto ni nombre.
  return NextResponse.json({ username, displayName, avatarUrl, followers, fetched });
}
