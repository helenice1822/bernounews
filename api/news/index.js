const { kv } = require('@vercel/kv');

function now(){ return Date.now(); }
function genId(){ return Math.random().toString(36).slice(2,10); }

module.exports = async (req, res) => {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if (req.method === 'GET') {
    const ids = await kv.zrange('news:ids', 0, -1, { rev: true });
    const items = [];
    for (const id of ids) {
      const raw = await kv.hgetall(`news:${id}`);
      if (raw) items.push({ ...raw, tags: JSON.parse(raw.tags||'[]'), images: JSON.parse(raw.images||'[]') });
    }
    return res.status(200).send(JSON.stringify({ items }));
  }
  if (req.method === 'POST') {
    const b = req.body || {};
    const id = genId();
    const item = {
      id,
      title: b.title || "Sem título",
      author: b.author || "Redação BernouNews",
      date: b.date || new Date().toISOString().slice(0,10),
      body: b.body || "",
      tags: JSON.stringify(b.tags || []),
      images: JSON.stringify(b.images || []),
      createdAt: String(now()),
      updatedAt: String(now())
    };
    await kv.hset(`news:${id}`, item);
    await kv.zadd('news:ids', { score: now(), member: id });
    return res.status(200).send(JSON.stringify({ ok:true, item: { ...item, tags: JSON.parse(item.tags), images: JSON.parse(item.images) } }));
  }
  if (req.method === 'OPTIONS') return res.status(200).send('{}');
  return res.status(405).send(JSON.stringify({ error:'method_not_allowed' }));
};
