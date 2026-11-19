// Servidor estático mínimo para desenvolvimento (sem dependências). Só escuta em localhost.
// uso: node tools/servir.mjs [raiz=.] [porta=8080]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, resolve } from 'node:path';

const raiz = resolve(process.argv[2] ?? '.');
const porta = Number(process.argv[3] ?? 8080);
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let arq = normalize(join(raiz, url));
    if (!arq.startsWith(raiz)) { res.writeHead(403).end(); return; }
    if ((await stat(arq)).isDirectory()) arq = join(arq, 'index.html');
    const corpo = await readFile(arq);
    res.writeHead(200, { 'Content-Type': tipos[extname(arq).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(corpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
}).listen(porta, '127.0.0.1', () => console.log(`servindo ${raiz} em http://localhost:${porta}`));
