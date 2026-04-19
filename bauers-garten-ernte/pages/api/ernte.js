import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { datum, gruppen, kulturen } = req.body;
    await kv.set('ernte:aktuell', { datum, gruppen, kulturen, gespeichertUm: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'GET') {
    const data = await kv.get('ernte:aktuell');
    return res.status(200).json(data || null);
  }
  res.status(405).end();
}
