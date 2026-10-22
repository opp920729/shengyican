// GET /api/reports  — 近 3 天的回報（只有優惠 id、原因、時間，沒有個資）
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
export async function onRequestGet({ env }){
  if (!env.REPORTS) return json({ ok: false, error: "not_configured", reports: [] });
  const out = []; let cursor;
  do {
    const r = await env.REPORTS.list({ prefix: "r:", cursor });
    r.keys.forEach(k => { if (k.metadata) out.push(k.metadata); });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  out.sort((a, b) => b.ts - a.ts);
  return json({ ok: true, reports: out });
}
