#!/usr/bin/env node
// Stream /api/generate with stream:true and print raw chunks
(async () => {
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', system: 'You are a test', prompt: 'Hello streaming', stream: true, options: { num_predict: 128, temperature: 0.2 } })
    });

    console.log('HTTP STATUS:', res.status);
    if (!res.body) { console.error('No body'); process.exit(1); }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      process.stdout.write('\n--- CHUNK ---\n');
      process.stdout.write(chunk);
    }
    console.log('\n--- END ---');
  } catch (e) {
    console.error('ERROR:', e);
    process.exit(1);
  }
})();
