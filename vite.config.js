import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Local dev plugin that handles /api/feed-proxy requests.
 * 
 * In production, Vercel runs the same logic from api/feed-proxy.js.
 * In dev, this plugin makes the same endpoint work via Vite's middleware.
 * 
 * Result: same code path in dev AND production — no public proxy fallback needed.
 */
function feedProxyPlugin() {
  return {
    name: 'feed-proxy-dev',
    configureServer(server) {
      server.middlewares.use('/api/feed-proxy', async (req, res) => {
        // Parse URL query
        const url = new URL(req.url, `http://${req.headers.host}`);
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing url parameter' }));
          return;
        }

        if (!/^https?:\/\//i.test(targetUrl)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Only http(s) URLs allowed' }));
          return;
        }

        try {
          const upstream = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept':
                'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });

          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: `Upstream returned ${upstream.status} ${upstream.statusText}`,
              })
            );
            return;
          }

          const text = await upstream.text();

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.statusCode = 200;
          res.end(text);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Unknown error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), feedProxyPlugin()],
  server: {
    port: 5173,
    open: true,
  },
});
