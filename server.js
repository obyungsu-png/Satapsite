import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/claude', createProxyMiddleware({
  target: 'https://apiclaude.cc',
  changeOrigin: true,
  pathRewrite: { '^/api/claude': '/v1' },
  onProxyReq: (proxyReq, req) => {
    console.log('[Proxy] Claude ->', req.method, req.url);
  }
}));

app.use('/api/deepseek', createProxyMiddleware({
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  pathRewrite: { '^/api/deepseek': '/v1' },
  onProxyReq: (proxyReq, req) => {
    console.log('[Proxy] DeepSeek ->', req.method, req.url);
  }
}));

app.use('/api/aihubmix', createProxyMiddleware({
  target: 'https://aihubmix.com',
  changeOrigin: true,
  pathRewrite: { '^/api/aihubmix': '/v1' },
  onProxyReq: (proxyReq, req) => {
    console.log('[Proxy] AIHubMix ->', req.method, req.url);
  }
}));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SAT server running at http://localhost:${PORT}`);
});
