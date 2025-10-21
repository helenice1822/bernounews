export default function handler(req, res) {
  res.status(200).json({
    hasAdmin: !!process.env.ADMIN_PASSWORD,
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    env: process.env.VERCEL_ENV || 'unknown',
  });
}
