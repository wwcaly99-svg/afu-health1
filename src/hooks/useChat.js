import { useState, useCallback, useRef } from 'react';

const API_URL = '/api/chat';

/**
 * useChat — streaming version.
 * sendMessage returns immediately after starting the stream.
 * Calls onDelta(text) for each text chunk, onDone(finalResult) when complete.
 */
export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const conversationIdRef = useRef(null);
  const sessionId = useRef(() => {
    const saved = sessionStorage.getItem('afu_session_id');
    if (saved) return saved;
    const newId = `session-${Date.now()}`;
    sessionStorage.setItem('afu_session_id', newId);
    return newId;
  });
  // Unwrap the lazy initializer
  if (typeof sessionId.current === 'function') {
    sessionId.current = sessionId.current();
  }

  const sendMessage = useCallback(async (message, { onDelta, onDone, onError, onThinking } = {}) => {
    const trimmed = (message || '').trim();
    if (!trimmed) return null;

    setLoading(true);
    setError(null);
    const t0 = performance.now();

    try {
      const body = {
        session_id: sessionId.current,
        message: trimmed,
      };
      if (conversationIdRef.current) {
        body.conversation_id = conversationIdRef.current;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      // Read NDJSON stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          let parsed;
          try { parsed = JSON.parse(line); } catch { continue; }

          if (parsed.type === 'delta' && parsed.text) {
            onDelta?.(parsed.text);
          } else if (parsed.type === 'thinking') {
            onThinking?.(parsed);
          } else if (parsed.type === 'status') {
            onDelta?.(null, parsed.text);
          } else if (parsed.type === 'final' || parsed.type === 'done') {
            finalResult = parsed.type === 'done' ? parsed.payload : parsed;
            if (finalResult?.conversation_id) {
              conversationIdRef.current = finalResult.conversation_id;
            }
          } else if (parsed.type === 'error') {
            throw new Error(parsed.error || 'Stream error');
          }
        }
      }

      setLoading(false);
      const t1 = performance.now();
      console.log(`[useChat] ⏱ stream ${(t1 - t0).toFixed(0)}ms | action: ${finalResult?.action_type || '?'} | source: api`);
      onDone?.(finalResult);
      return { ...finalResult, __source: 'api' };

    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.log(`[useChat] ❌ Stream failed: ${err.message} → fallback mock`);
      onError?.(err);
      return null;
    }
  }, []);

  const resetSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    sessionId.current = newId;
    sessionStorage.setItem('afu_session_id', newId);
    conversationIdRef.current = null;
    setLoading(false);
    setError(null);
  }, []);

  return { sendMessage, loading, error, resetSession, getSessionId: () => sessionId.current };
}
