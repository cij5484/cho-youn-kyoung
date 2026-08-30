import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Run after `npm run build` and `npm run preview -- --host 127.0.0.1 --port 4173`.
// This measures a single HTTP asset transfer, NOT page load time, FCP, or LCP.
const run = promisify(execFile);
const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const basePath = '/assets/performances/haegeum-jeongak-2026-09-22/web/home-hero-desktop';
const samples = { png: [], webp: [] };

// Alternate formats to reduce ordering bias. curl has no browser cache.
for (let round = 0; round < 3; round += 1) {
  for (const extension of ['png', 'webp']) {
    const url = new URL(`${basePath}.${extension}`, origin);
    const { stdout } = await run('curl', [
      '--fail', '--silent', '--show-error', '--max-time', '30',
      '--limit-rate', '2M', '--output', '/dev/null',
      '--write-out', '%{http_code} %{size_download} %{time_total}', url.href,
    ]);
    const [status, bytes, seconds] = stdout.trim().split(/\s+/).map(Number);
    if (status !== 200 || bytes <= 0) throw new Error(`Invalid response for ${url}`);
    samples[extension].push({ bytes, milliseconds: Math.round(seconds * 1000) });
  }
}

console.log(JSON.stringify({
  method: 'Single background asset, curl, 2 MiB/s cap, 3 alternating samples per format; not page load time',
  origin,
  results: Object.fromEntries(Object.entries(samples).map(([format, runs]) => [format, {
    runs,
    medianMilliseconds: runs.map(run => run.milliseconds).sort((a, b) => a - b)[1],
  }])),
}, null, 2));
