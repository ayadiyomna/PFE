#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'backend', 'routes', 'chatRoutes.js');
const content = fs.readFileSync(filePath, 'utf8');

// Extract SYSTEM_PROMPT between the first pair of backticks after SYSTEM_PROMPT
const match = content.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
if (!match) {
  console.error('SYSTEM_PROMPT not found in chatRoutes.js');
  process.exit(1);
}
const systemPrompt = match[1];

(async () => {
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', system: systemPrompt, prompt: 'User: bonjour\nAssistant:', stream: true, options: { num_predict: 256, temperature: 0.7 } })
    });

    console.log('HTTP STATUS:', res.status);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        console.log('CHUNK LINE:', line);
      }
    }
    console.log('--- stream ended');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
