import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const it = await redis.get('news:' + id);
      if (!it) return res.status(404).end();
      return res.status(200).json({ item: it });
    }

    const adminOk =
      (req.headers['x-admin-password'] || '') ===
      (process.env.ADMIN_PASSWORD || 'helena2025');
    if (!adminOk) return res.status(401).end();

    if (req.method === 'PUT') {
      const cur = await redis.get('news:' + id);
      const next = { ...cur, ...req.body, id };
      await redis.set('news:' + id, next);
      return res.status(200).json({ item: next });
    }

    if (req.method === 'DELETE') {
      await redis.del('news:' + id);
      await redis.zrem('news:ids', id);
      return res.status(204).end();
    }

    res.status(405).end();
  } catch (e) {
    console.error('API /news/[id] error:', e);
    res.status(500).json({ error: 'internal' });
  }
}
