const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  const { id } = req.query || {};
  if (!id) return res.status(400).send(JSON.stringify({ error: 'missing_id' }));
  if (req.method === 'GET') {
    const raw = await kv.hgetall(`news:${id}`);
    if (!raw) return res.status(404).send(JSON.stringify({ error: 'not_found' }));
    const item = { ...raw, tags: JSON.parse(raw.tags||'[]'), images: JSON.parse(raw.images||'[]') };
    return res.status(200).send(JSON.stringify({ item }));
  }
  if (req.method === 'PUT') {
    const b = req.body || {};
    const raw = await kv.hgetall(`news:${id}`);
    if (!raw) return res.status(404).send(JSON.stringify({ error: 'not_found' }));
    const item = {
      ...raw,
      title: b.title ?? raw.title,
      author: b.author ?? raw.author,
      body: b.body ?? raw.body,
      tags: JSON.stringify(b.tags ?? JSON.parse(raw.tags||'[]')),
      images: JSON.stringify(b.images ?? JSON.parse(raw.images||'[]')),
      updatedAt: String(Date.now())
    };
    await kv.hset(`news:${id}`, item);
    const out = { ...item, tags: JSON.parse(item.tags), images: JSON.parse(item.images) };
    return res.status(200).send(JSON.stringify({ ok:true, item: out }));
  }
  if (req.method === 'DELETE') {
    await kv.del(`news:${id}`);
    await kv.zrem('news:ids', id);
    return res.status(200).send(JSON.stringify({ ok:true }));
  }
  if (req.method === 'OPTIONS') return res.status(200).send('{}');
  return res.status(405).send(JSON.stringify({ error:'method_not_allowed' }));
};
