// Real Chromium: N looping <audio> layers must play at once with independent volumes.
// Run: node tests/audio-simultaneous.e2e.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const LAYERS = 6;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.goto('about:blank');

const result = await page.evaluate(async (n) => {
  // 1s sine WAV as a data URI, different pitch per layer
  const wav = (hz) => {
    const rate = 8000, len = rate;
    const b = new DataView(new ArrayBuffer(44 + len * 2));
    const s = (o, t) => [...t].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
    s(0, 'RIFF'); b.setUint32(4, 36 + len * 2, true); s(8, 'WAVEfmt ');
    b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
    b.setUint32(24, rate, true); b.setUint32(28, rate * 2, true); b.setUint16(32, 2, true);
    b.setUint16(34, 16, true); s(36, 'data'); b.setUint32(40, len * 2, true);
    for (let i = 0; i < len; i++) b.setInt16(44 + i * 2, Math.sin((2 * Math.PI * hz * i) / rate) * 8000, true);
    let bin = ''; new Uint8Array(b.buffer).forEach((x) => (bin += String.fromCharCode(x)));
    return 'data:audio/wav;base64,' + btoa(bin);
  };
  const els = Array.from({ length: n }, (_, i) => {
    const a = document.createElement('audio');
    a.src = wav(220 + i * 110); a.loop = true; a.volume = (i + 1) / n;
    return a;
  });
  await Promise.all(els.map((a) => a.play()));
  await new Promise((r) => setTimeout(r, 1000));
  return els.map((a) => ({ paused: a.paused, t: a.currentTime, vol: a.volume }));
}, LAYERS);

await browser.close();
assert.equal(result.length, LAYERS);
for (const [i, r] of result.entries()) {
  assert.equal(r.paused, false, `layer ${i} paused`);
  assert.ok(r.t > 0.3, `layer ${i} did not advance (t=${r.t})`);
  assert.ok(Math.abs(r.vol - (i + 1) / LAYERS) < 1e-6, `layer ${i} volume not independent`);
}
console.log(`ok: ${LAYERS} layers playing simultaneously`);
