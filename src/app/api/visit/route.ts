import { fingerprint, total, visit } from "@/lib/visits";

// POST: count this browser (once, ever) and return its number. GET: the total, counting no one
// (used when Tejas has marked his own browser with ?notme).

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|linkedin|skype|embedly|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python|axios|node-fetch/i;
const ID = /^[a-f0-9-]{16,64}$/i;

export async function GET() {
  try {
    const t = await total();
    return Response.json({ total: t }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ total: null });
  }
}

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return Response.json({ n: null });

  let id = "";
  try { id = String(((await request.json()) as { id?: unknown }).id ?? ""); } catch {}
  if (!ID.test(id)) return Response.json({ n: null }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  try {
    const v = await visit(id, fingerprint(ip, ua));
    return Response.json(v ?? { n: null }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Visit count failed", err);
    return Response.json({ n: null });
  }
}
