// POST /api/report  {id, reason}  — 使用者回報優惠已結束。只存 3 天，不會直接下架。
const REASONS = ["已結束", "價格不對", "這間門市沒有"];
const DAY = 86400;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
async function hash(t){ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 16); }

export async function onRequestPost({ request, env }){
  if (!env.REPORTS) return json({ ok: false, error: "not_configured" }, 503);
  let body; try { body = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const id = String(body.id || "").slice(0, 80), reason = String(body.reason || "");
  if (!/^[\w-]+$/.test(id) || !REASONS.includes(reason)) return json({ ok: false, error: "bad_input" }, 400);
  const res = await env.ASSETS.fetch(new URL("/deals.json", request.url));
  const data = await res.json().catch(() => ({}));
  if (!Array.isArray(data.deals) || !data.deals.some(d => d.id === id)) return json({ ok: false, error: "unknown_id" }, 400);

  const today = new Date().toISOString().slice(0, 10);
  const who = await hash((request.headers.get("CF-Connecting-IP") || "?") + "|" + today);
  const lk = "ip:" + who, n = Number(await env.REPORTS.get(lk) || 0);
  if (n >= 10) return json({ ok: false, error: "limit" }, 429);
  await env.REPORTS.put(lk, String(n + 1), { expirationTtl: DAY });

  const ts = Date.now();
  await env.REPORTS.put("r:" + id + ":" + who, "1", { expirationTtl: 3 * DAY, metadata: { id, reason, ts } });
  return json({ ok: true });
}
export const onRequest = () => json({ ok: false, error: "method" }, 405);
