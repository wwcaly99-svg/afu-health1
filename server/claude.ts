import { ProxyAgent, fetch as undiciFetch } from 'undici';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';
const PROXY_URL = process.env.https_proxy || process.env.http_proxy || '';
const MAX_RETRIES = 2;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment. Check your .env file.');
  process.exit(1);
}

const dispatcher = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;
console.log(`✅ Claude config loaded: model=${CLAUDE_MODEL}${PROXY_URL ? ` proxy=${PROXY_URL}` : ''}`);

interface ClaudeMessage {
  role: string;
  content: string;
}

async function fetchWithRetry(
  url: string,
  options: Parameters<typeof undiciFetch>[1],
  retries = MAX_RETRIES
): Promise<Awaited<ReturnType<typeof undiciFetch>>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await undiciFetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = 1000 * (attempt + 1);
      console.warn(`[claude] Retry ${attempt + 1}/${retries} after ${wait}ms:`, (err as Error).message);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error('Unreachable');
}

export async function callClaudeBlocking(
  systemPrompt: string,
  messages: ClaudeMessage[]
): Promise<string> {
  const res = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    ...(dispatcher ? { dispatcher } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { content: { type: string; text: string }[] };
  const textBlock = data.content.find((b) => b.type === 'text');
  return textBlock?.text || '';
}

export async function callClaudeStream(
  systemPrompt: string,
  messages: ClaudeMessage[]
): Promise<Response> {
  const res = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    ...(dispatcher ? { dispatcher } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude streaming error ${res.status}: ${text}`);
  }

  return res as unknown as Response;
}
