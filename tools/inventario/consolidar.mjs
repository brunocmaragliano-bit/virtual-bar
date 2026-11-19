// Junta os lotes de identificação visual numa lista de garrafas distintas e gera a página de revisão.
// uso: node tools/inventario/consolidar.mjs <pasta_lotes_json> <pasta_saida>   (saída: identificacao.json + revisao.html)
// Agrupa fotos da mesma garrafa por `mesma_garrafa_que` e por nome normalizado; quando agrupa só pelo nome,
// sinaliza para o Bruno confirmar (pode ser foto repetida ou uma segunda garrafa igual).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , dirIn, dirOut] = process.argv;
const entradas = readdirSync(dirIn).filter(f => /^lote-.*\.json$/.test(f)).sort()
  .flatMap(f => JSON.parse(readFileSync(join(dirIn, f), 'utf8')));

const norm = s => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const chave = e => norm(`${e.marca} ${e.rotulo} ${e.expressao ?? ''}`).split(' ').filter((w, i, a) => a.indexOf(w) === i).sort().join(' ');
const slug = s => norm(s).replace(/ /g, '_');

// union-find
const pai = entradas.map((_, i) => i);
const raiz = i => (pai[i] === i ? i : (pai[i] = raiz(pai[i])));
const unir = (a, b) => { pai[raiz(a)] = raiz(b); };
const ligadoPorFoto = new Set();
entradas.forEach((e, i) => {
  if (!e.mesma_garrafa_que) return;
  const alvos = entradas.map((x, j) => [x, j]).filter(([x]) => x.arquivo === e.mesma_garrafa_que);
  const alvo = alvos.find(([x]) => norm(x.marca) === norm(e.marca)) ?? alvos[0];
  if (alvo) { unir(i, alvo[1]); ligadoPorFoto.add(i); ligadoPorFoto.add(alvo[1]); }
});
const porChave = new Map();
entradas.forEach((e, i) => {
  const k = chave(e);
  if (!k) return;
  if (porChave.has(k)) unir(i, porChave.get(k)); else porChave.set(k, i);
});

const grupos = new Map();
entradas.forEach((e, i) => { const r = raiz(i); if (!grupos.has(r)) grupos.set(r, []); grupos.get(r).push([e, i]); });

const ordemConf = { baixa: 0, media: 1, alta: 2 };
const ordemLeg = { ilegivel: 0, parcial: 1, clara: 2 };
const primeiro = (arr, campo) => arr.map(e => e[campo]).find(v => v !== null && v !== undefined && v !== '') ?? null;
const usados = new Set();

const garrafas = [...grupos.values()].map(g => {
  const es = g.map(([e]) => e);
  const frentes = es.filter(e => e.lado === 'frente');
  const ref = [...(frentes.length ? frentes : es)].sort((a, b) => (b.foto_para_app ?? 0) - (a.foto_para_app ?? 0))[0];
  const conf = es.reduce((m, e) => Math.max(m, ordemConf[e.confianca] ?? 0), 0);
  const leg = es.reduce((m, e) => Math.max(m, ordemLeg[e.legibilidade] ?? 0), 0);
  const flags = [];
  if (conf < 2) flags.push(conf === 0 ? 'baixa_confianca' : 'media_confianca');
  if (leg < 2) flags.push(leg === 0 ? 'ilegivel' : 'leitura_parcial');
  const soPorNome = frentes.length > 1 && g.some(([, i]) => !ligadoPorFoto.has(i));
  if (soPorNome) flags.push('foto_repetida_ou_segunda_garrafa');
  const abvs = [...new Set(es.map(e => e.abv_rotulo).filter(v => v != null))];
  if (abvs.length > 1) flags.push('abv_divergente');
  let id = slug(`${ref.marca ?? ''} ${ref.expressao ?? ''}`) || slug(ref.rotulo) || 'desconhecida';
  while (usados.has(id)) id += '_2';
  usados.add(id);
  return {
    id, rotulo: ref.rotulo, marca: ref.marca, expressao: ref.expressao ?? null,
    categoria: ref.categoria, tipo: ref.tipo,
    abv: abvs.length === 1 ? abvs[0] : (abvs.length ? abvs : null),
    volume_ml: primeiro(es, 'volume_ml'), pais: primeiro(es, 'pais'),
    nivel: (es.find(e => e.nivel && e.nivel !== 'nao_visivel') ?? {}).nivel ?? 'nao_visivel',
    confianca: Object.keys(ordemConf)[conf], legibilidade: Object.keys(ordemLeg)[leg],
    duvidas: [...new Set(es.map(e => e.duvida).filter(Boolean))],
    obs: [...new Set(es.map(e => e.obs).filter(Boolean))],
    flags,
    fotoPrincipal: ref.arquivo, bbox: ref.bbox ?? null,
    fotos: es.map(e => ({ arquivo: e.arquivo, lado: e.lado, foto_para_app: e.foto_para_app })),
  };
});

const ordemCat = ['destilado', 'licor', 'vermute_fortificado', 'amaro', 'bitters', 'vinho_espumante', 'cerveja_sidra', 'xarope', 'mixer', 'outros'];
garrafas.sort((a, b) => (ordemCat.indexOf(a.categoria) - ordemCat.indexOf(b.categoria)) || a.tipo.localeCompare(b.tipo) || a.rotulo.localeCompare(b.rotulo));
writeFileSync(join(dirOut, 'identificacao.json'), JSON.stringify(garrafas, null, 2));

// ---------- página de revisão ----------
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nomeCat = { destilado: 'Destilados', licor: 'Licores', vermute_fortificado: 'Vermutes e fortificados', amaro: 'Amaros e bitters aperitivos', bitters: 'Bitters', vinho_espumante: 'Vinhos e espumantes', cerveja_sidra: 'Cervejas e sidras', xarope: 'Xaropes', mixer: 'Mixers', outros: 'Outros' };
const nomeFlag = { baixa_confianca: 'confiança baixa', media_confianca: 'confiança média', ilegivel: 'ilegível', leitura_parcial: 'leitura parcial', foto_repetida_ou_segunda_garrafa: 'foto repetida ou 2ª garrafa?', abv_divergente: 'ABV divergente' };
// miniaturas embutidas (data URI) para a página abrir sozinha em qualquer lugar
const thumbsDir = join(dirOut, 'thumbs');
const src = arq => { try { return `data:image/jpeg;base64,${readFileSync(join(thumbsDir, arq)).toString('base64')}`; } catch { return ''; } };
const card = (g, n) => `
<article class="card${g.flags.length ? ' flag' : ''}">
  <div class="fotos">${g.fotos.map(f => `<img src="${src(f.arquivo)}" alt="${esc(g.rotulo)} — ${esc(f.lado)}">`).join('')}</div>
  <div class="txt">
    <div class="num">#${n}</div>
    <h3>${esc(g.rotulo)}</h3>
    <p class="tipo">${esc(g.tipo)}${g.abv ? ` · ${esc(Array.isArray(g.abv) ? g.abv.join(' / ') : g.abv)}%` : ''}${g.volume_ml ? ` · ${esc(g.volume_ml)} ml` : ''}${g.pais ? ` · ${esc(g.pais)}` : ''}</p>
    <p class="meta">nível: ${esc(g.nivel.replace('_', ' '))} · ${g.fotos.length} foto${g.fotos.length > 1 ? 's' : ''}</p>
    ${g.flags.length ? `<p class="pills">${g.flags.map(f => `<span>${esc(nomeFlag[f] ?? f)}</span>`).join('')}</p>` : ''}
    ${g.duvidas.length ? `<p class="duv">${g.duvidas.map(esc).join('<br>')}</p>` : ''}
    <p class="arq">${g.fotos.map(f => esc(f.arquivo.replace('_iOS.jpg', ''))).join(' · ')}</p>
  </div>
</article>`;
let n = 0;
const numerada = garrafas.map(g => ({ g, n: ++n }));
const duvidosas = numerada.filter(x => x.g.flags.length);
const secoes = ordemCat.map(c => [c, numerada.filter(x => x.g.categoria === c)]).filter(([, l]) => l.length);
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão do inventário</title>
<style>
:root{--bg:#121212;--card:#1d1d1f;--txt:#f2f2f2;--sub:#a8a8ad;--line:#333;--warn:#f0b44c;--warnbg:#3a2c12}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#f5f5f7;--card:#fff;--txt:#1a1a1a;--sub:#5f5f66;--line:#ddd;--warn:#8a5a00;--warnbg:#fdf0d5}}
body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.45 -apple-system,Segoe UI,system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:16px}
h1{font-size:22px;margin:8px 0 4px}h2{font-size:18px;margin:28px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
.lead{color:var(--sub);margin:0 0 8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:12px}
.card{display:flex;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px}
.card.flag{border-color:var(--warn)}
.fotos{display:flex;gap:4px;flex-wrap:wrap;max-width:150px}.fotos img{height:120px;border-radius:6px;display:block}
.txt{min-width:0;flex:1;overflow-wrap:anywhere}.num{color:var(--sub);font-size:12px}h3{font-size:16px;margin:0 0 2px}
.tipo{margin:0;color:var(--sub)}.meta,.arq{margin:4px 0 0;font-size:12px;color:var(--sub)}.arq{word-break:break-all}
.pills{margin:6px 0 0}.pills span{display:inline-block;font-size:12px;background:var(--warnbg);color:var(--warn);border-radius:99px;padding:1px 8px;margin:0 4px 4px 0}
.duv{margin:4px 0 0;font-size:13px;color:var(--warn)}
.fotos img{cursor:zoom-in}#zoom{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;cursor:zoom-out}
#zoom.on{display:flex}#zoom img{max-width:94vw;max-height:94vh;border-radius:8px}
</style></head><body><div id="zoom"><img alt=""></div><main>
<h1>Revisão do inventário</h1>
<p class="lead">${garrafas.length} garrafas distintas em ${new Set(entradas.map(e => e.arquivo)).size} fotos · ${duvidosas.length} precisam de confirmação. Toque numa foto para ampliar.</p>
${duvidosas.length ? `<h2>Precisam de confirmação (${duvidosas.length})</h2><div class="grid">${duvidosas.map(x => card(x.g, x.n)).join('')}</div>` : ''}
${secoes.map(([c, l]) => `<h2>${esc(nomeCat[c] ?? c)} (${l.length})</h2><div class="grid">${l.map(x => card(x.g, x.n)).join('')}</div>`).join('')}
</main><script>
const z=document.getElementById('zoom');
document.addEventListener('click',e=>{if(e.target.matches('.fotos img')){z.querySelector('img').src=e.target.src;z.classList.add('on')}else if(z.contains(e.target))z.classList.remove('on')});
</script></body></html>`;
writeFileSync(join(dirOut, 'revisao.html'), html);
console.log(`${entradas.length} entradas → ${garrafas.length} garrafas (${duvidosas.length} com sinalização)`);
