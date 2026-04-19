import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { datum, gruppen, kulturen } = req.body;
    await redis.set('ernte:aktuell', { datum, gruppen, kulturen, gespeichertUm: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'GET') {
    const data = await redis.get('ernte:aktuell');
    return res.status(200).json(data || null);
  }
  res.status(405).end();
}
