import { Redis } from '@upstash/redis';

// Lê explicitamente as variáveis do Upstash da Vercel
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const ids = await redis.zrevrange('news:ids', 0, 99);
      const items = [];
      for (const id of ids) {
        const it = await redis.get('news:' + id);
        if (it) items.push(it);
      }
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const adminOk =
        (req.headers['x-admin-password'] || '') ===
        (process.env.ADMIN_PASSWORD || 'helena2025');

      if (!adminOk) return res.status(401).send('no');

      const { title, body, cover } = req.body || {};
      if (!title || !body) return res.status(400).send('missing');

      const id = Date.now().toString(36);
      const item = { id, title, body, cover, createdAt: Date.now() };

      await redis.set('news:' + id, item);
      await redis.zadd('news:ids', { score: Date.now(), member: id });

      return res.status(201).json({ item });
    }

    res.status(405).end();
  } catch (e) {
    console.error('API /news error:', e);
    res.status(500).json({ error: 'internal' });
  }
}
