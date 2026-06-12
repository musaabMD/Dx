const MAX_PAGES = 8;
const MAX_CHARS_PER_PAGE = 6000;

export type WebsitePage = {
  url: string;
  title: string;
  text: string;
};

export async function ingestWebsite(inputUrl: string) {
  const startUrl = normalizeUrl(inputUrl);
  const firstPage = await fetchPage(startUrl);
  const links = extractSameOriginLinks(firstPage.html, startUrl).slice(
    0,
    MAX_PAGES - 1
  );

  const pages = [toWebsitePage(startUrl, firstPage.html)];

  for (const link of links) {
    try {
      const page = await fetchPage(link);
      pages.push(toWebsitePage(link, page.html));
    } catch {
      // Some public pages block bots or time out; keep the successful pages.
    }
  }

  const content = pages
    .map((page) => `# ${page.title}\nURL: ${page.url}\n${page.text}`)
    .join("\n\n---\n\n");

  return {
    url: startUrl,
    pages,
    content: trimText(content, 28000),
  };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Website URL is required");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function fetchPage(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "LnkbaseBot/1.0 (+https://lnkbase.local; website training crawler)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Unsupported content type for ${url}`);
    }

    return { html: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function toWebsitePage(url: string, html: string): WebsitePage {
  return {
    url,
    title: extractTitle(html) || new URL(url).hostname,
    text: trimText(htmlToText(html), MAX_CHARS_PER_PAGE),
  };
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeEntities(stripTags(match?.[1] ?? "")).trim();
}

function htmlToText(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  return decodeEntities(stripTags(withoutScripts))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractSameOriginLinks(html: string, startUrl: string) {
  const origin = new URL(startUrl).origin;
  const seen = new Set<string>();
  const links: string[] = [];

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(match[1], startUrl);
      url.hash = "";

      if (url.origin !== origin) continue;
      if (!["http:", "https:"].includes(url.protocol)) continue;
      if (/\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|mov)$/i.test(url.pathname)) {
        continue;
      }

      const normalized = url.toString();
      if (seen.has(normalized) || normalized === startUrl) continue;

      seen.add(normalized);
      links.push(normalized);
    } catch {
      // Ignore invalid href values.
    }
  }

  return links;
}

function trimText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
