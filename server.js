import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Proxy middleware FIRST (before express.json) so raw body streams are forwarded correctly
app.use('/api/claude', createProxyMiddleware({
  target: 'https://apiclaude.cc',
  changeOrigin: true,
  pathRewrite: { '^/api/claude': '/v1' },
  on: {
    proxyReq: (proxyReq, req) => {
      console.log('[Proxy] Claude ->', req.method, req.url);
    }
  }
}));

// JSON body parser after proxies (for any non-proxy routes)
app.use(express.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SAT server running at http://localhost:${PORT}`);
});
