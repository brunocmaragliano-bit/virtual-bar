// Escreve a lista de precache e a versão no site/sw.js, e atualiza site/version.json.
// A versão do cache é um hash do conteúdo: qualquer mudança no app, na base ou nas imagens gera uma versão nova (D4, D5).
// uso: node tools/precache.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const SITE = 'site';
const FORA = new Set(['sw.js', 'version.json']);
const arquivos = [];
(function andar(dir) {
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) andar(p);
    else { const r = relative(SITE, p).replace(/\\/g, '/'); if (!FORA.has(r) && !n.startsWith('.')) arquivos.push(r); }
  }
})(SITE);

const h = createHash('sha256');
for (const a of arquivos) { h.update(a); h.update(readFileSync(join(SITE, a))); }
const versao = h.digest('hex').slice(0, 10);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
writeFileSync(join(SITE, 'version.json'), JSON.stringify({ app: pkg.version, build: versao }, null, 2) + '\n');

const lista = ['./', ...arquivos, 'version.json'];
const sw = readFileSync(join(SITE, 'sw.js'), 'utf8').replace(/\/\/ <precache>[\s\S]*?\/\/ <\/precache>/,
  `// <precache>\nconst VERSAO = '${versao}';\nconst ARQUIVOS = ${JSON.stringify(lista, null, 0).replace(/","/g, '",\n  "').replace('["', '[\n  "').replace('"]', '"\n]')};\n// </precache>`);
writeFileSync(join(SITE, 'sw.js'), sw);
const kb = arquivos.reduce((s, a) => s + statSync(join(SITE, a)).size, 0) / 1024;
console.log(`precache ${versao}: ${lista.length} arquivos, ${(kb / 1024).toFixed(1)} MB`);
