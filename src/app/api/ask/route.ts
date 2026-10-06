import { person } from "@/content/site";

// Messages from the Space page's form, delivered to Tejas's inbox through Resend.
// RESEND_API_KEY lives in .env.local (and in the host's environment variables once deployed).
// CONTACT_EMAIL (optional) is where messages go; it defaults to person.inbox. Until a domain
// is verified in Resend, this must be the email the Resend account was created with.
//
// Spam: a hidden "website" field that people never see (bots fill it), a minimum time on the form,
// and a small per-visitor limit. Anything that trips these gets a quiet "ok" so bots learn nothing.

type Body = {
  mode?: string; kind?: string; title?: string; message?: string;
  name?: string; email?: string; website?: string; startedAt?: number;
};

const KINDS = ["Book", "Film", "Series", "Anime"];
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

function limited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "Bad request" }, { status: 400 }); }

  // Bots: filled the hidden field, or submitted faster than a person can type.
  const tooFast = typeof body.startedAt === "number" && Date.now() - body.startedAt < 2500;
  if (clean(body.website, 200) || tooFast) return Response.json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ ok: false, error: "Too many messages. Try again in a few minutes." }, { status: 429 });

  const mode = body.mode === "recommend" ? "recommend" : "ask";
  const kind = KINDS.includes(body.kind ?? "") ? body.kind! : "Book";
  const title = clean(body.title, 200);
  const message = clean(body.message, 4000);
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);

  if (mode === "ask" && message.length < 2) return Response.json({ ok: false, error: "Write a message first." }, { status: 400 });
  if (mode === "recommend" && title.length < 1) return Response.json({ ok: false, error: "Add the title you're recommending." }, { status: 400 });
  if (email && !isEmail(email)) return Response.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ ok: false, error: "Messages aren't set up yet." }, { status: 503 });

  const from = name || "Someone on your site";
  const subject = mode === "ask" ? `Question from ${from}` : `${kind} recommendation: ${title}`;
  const lines = [
    mode === "recommend" ? `${kind}: ${title}` : "",
    message,
    "",
    `From: ${from}${email ? ` <${email}>` : ""}`,
  ].filter((l, i) => l !== "" || i > 0);
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p style="margin:0 0 4px;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:.08em">${mode === "ask" ? "Ask me anything" : "Recommendation"}</p>
      ${mode === "recommend" ? `<p style="margin:0 0 12px;font-size:18px"><strong>${esc(kind)}:</strong> ${esc(title)}</p>` : ""}
      ${message ? `<p style="margin:0 0 16px;white-space:pre-wrap">${esc(message)}</p>` : ""}
      <p style="margin:0;color:#555">From ${esc(from)}${email ? ` &lt;${esc(email)}&gt;` : ""}</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Without a verified domain, Resend sends from its own address, and only to the account owner.
      from: "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL?.trim() || person.inbox],
      subject,
      html,
      text: lines.join("\n"),
      ...(email ? { reply_to: email } : {}),
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return Response.json({ ok: false, error: "Couldn't send right now." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
