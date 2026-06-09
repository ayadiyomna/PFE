#!/usr/bin/env node
// Simple Node script to test Ollama /api/generate (non-stream)
(async () => {
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', system: 'You are a test', prompt: 'Hello', stream: false, options: { num_predict: 64 } })
    });
    console.log('HTTP STATUS:', res.status);
    const txt = await res.text();
    console.log('BODY:', txt);
  } catch (e) {
    console.error('ERROR calling Ollama:', e);
    process.exit(1);
  }
})();
