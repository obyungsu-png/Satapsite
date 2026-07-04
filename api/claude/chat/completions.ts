import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const targetUrl = 'https://apiclaude.cc/v1/chat/completions';

    // Forward the request body and headers
    const authHeader = req.headers['authorization'] || '';
    const contentType = req.headers['content-type'] || 'application/json';

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': authHeader as string,
      },
      body: JSON.stringify(req.body),
    });

    // Check if the response is a streaming response
    const isStreaming = req.body?.stream === true;

    if (isStreaming) {
      // For streaming responses, forward as SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (!response.ok) {
        const errorText = await response.text();
        res.status(response.status).json({ error: `API error (${response.status}): ${errorText}` });
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
        } catch (streamErr) {
          console.error('[Claude Proxy] Stream error:', streamErr);
        }
        res.end();
      } else {
        // No body, just forward the text
        const text = await response.text();
        res.write(text);
        res.end();
      }
    } else {
      // Non-streaming: forward JSON response
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('[Claude Proxy] Error:', error);
    res.status(500).json({ error: `Proxy error: ${error.message}` });
  }
}

// Handle CORS preflight
export const OPTIONS = async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
};
