#!/usr/bin/env node
// Simple Node script to POST to /api/chat and print SSE stream chunks
const url = process.argv[2] || 'http://localhost:5000/api/chat';
const message = process.argv[3] || 'bonjour';

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: [] })
    });

    console.log('HTTP STATUS:', res.status);
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      console.error('Non-OK response:', txt || res.status);
      process.exit(1);
    }

    if (!res.body) {
      console.error('No response body (streaming not supported)');
      process.exit(1);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });
      process.stdout.write(buffer);
      buffer = '';
    }

    console.log('\n--- stream ended ---');
  } catch (err) {
    console.error('Request error:', err);
    process.exit(1);
  }
})();
