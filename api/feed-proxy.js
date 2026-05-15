/**
 * VERCEL SERVERLESS FUNCTION — RSS Feed Proxy
 * 
 * Why this exists:
 * - Browsers block cross-origin RSS fetches (CORS policy)
 * - Public CORS proxies (corsproxy.io, allorigins.win) block production use
 * - This function runs on Vercel's edge, fetches feeds server-side (no CORS),
 *   and returns the XML to the browser with proper CORS headers.
 * 
 * Usage from frontend:
 *   /api/feed-proxy?url=https://lngprime.com/feed/
 * 
 * Free tier limits (Vercel Hobby plan):
 *   - 100 GB-hours/month execution time
 *   - 100,000 invocations/day
 *   - Plenty for typical RSS aggregator usage
 */

export default async function handler(req, res) {
  // CORS headers — allow any origin (locked to your domain in production if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Basic SSRF guard — only allow http(s) URLs
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Only http(s) URLs allowed' });
  }

  try {
    const upstreamResponse = await fetch(url, {
      method: 'GET',
      headers: {
        // Pretend to be a real browser to avoid bot blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Vercel's default timeout is 10s on Hobby plan
    });

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        error: `Upstream returned ${upstreamResponse.status} ${upstreamResponse.statusText}`,
      });
    }

    const text = await upstreamResponse.text();

    // Cache for 10 minutes — reduces redundant fetches & speeds up repeat visits
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');

    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Unknown error fetching upstream',
    });
  }
}
