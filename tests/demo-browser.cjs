// Runs the actual demo app in headless Chrome, using disposable browser storage.
// CHROME_PATH may override the Windows default. No package installation is needed.
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const root = path.resolve(__dirname, '..');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'dnd-demo-smoke-'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const filename = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    let content = fs.readFileSync(filename);
    if (['index.html', 'dm.html'].includes(path.basename(filename))) {
      content = content.toString('utf8').replace('</head>', '<script src="/tests/demo-smoke.js" defer></script></head>');
    }
    response.setHeader('Content-Type', (types[path.extname(filename)] || 'application/octet-stream') + '; charset=utf-8');
    response.end(content);
  } catch { response.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    for (const [scenario, page, width] of [
      ['landing', 'index', 1440], ['player', 'index', 1440], ['dm', 'dm', 1440],
      ['reload', 'dm', 1440], ['player-after', 'index', 1440], ['reset', 'dm', 1440],
      ['player', 'index', 500]
    ]) {
      const search = scenario === 'landing' ? '' : 'demo=1&campaign=demo-lantern-coast&';
      const url = `http://127.0.0.1:${server.address().port}/${page}.html?${search}smoke=${scenario}`;
      const { stdout } = await promisify(execFile)(chrome, ['--headless', '--disable-gpu', '--no-first-run',
        '--no-default-browser-check', `--user-data-dir=${path.join(temporary, 'profile')}`,
        `--window-size=${width},1400`, '--virtual-time-budget=10000', '--dump-dom',
        `--screenshot=${path.join(temporary, scenario + '-' + width + '.png')}`, url],
      { timeout: 45000, maxBuffer: 6 * 1024 * 1024 });
      const match = stdout.match(/<output id="demo-smoke-result"[^>]*>(.*?)<\/output>/s);
      if (!match) throw new Error(`${scenario}: no browser result`);
      const result = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
      console.log(JSON.stringify(result));
      if (!result.ok) throw new Error(`${scenario}: ${result.error}`);
    }
  } finally {
    server.close();
    console.log('Screenshots and disposable browser profile:', temporary);
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
