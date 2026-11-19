// Gera research/revisao-fase1.html: amostra para o Bruno revisar no fim da fase 1
// (10 receitas + perfis das garrafas com recorte, melhor uso e fontes). Imagens embutidas: abre com duplo clique.
// uso: node tools/base/revisao-fase1.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { criarMotor } from './motor.mjs';

const ler = a => JSON.parse(readFileSync(join('site/data', a), 'utf8'));
const tipos = ler('tipos.json'), garrafas = ler('garrafas.json'), categorias = ler('categorias.json'), familias = ler('familias.json');
const seed = ler('seed/meu-bar.json'), eixos = ler('eixos.json');
const receitas = readdirSync('site/data/receitas').filter(f => f.endsWith('.json')).flatMap(f => ler(join('receitas', f)));
const motor = criarMotor({ tipos, garrafas, substituicoes: ler('substituicoes.json'), inventario: seed.inventario, basicosSempre: seed.prefs.basicosSempre });
const T = motor.tipoPorId, G = motor.garrafaPorId;
const famNome = Object.fromEntries(familias.map(f => [f.id, f.nome]));
const recNome = Object.fromEntries(receitas.map(r => [r.id, r.nome]));
const inv = Object.fromEntries(seed.inventario.map(i => [i.id, i]));
const conf = Object.fromEntries(JSON.parse(readFileSync('research/inventario/confirmado.json', 'utf8')).map(c => [c.id, c]));

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const img = id => { const p = `site/img/garrafas/${id}.webp`; return existsSync(p) ? `data:image/webp;base64,${readFileSync(p).toString('base64')}` : ''; };
const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const oz = ml => { const q = Math.round(ml / 30 * 4) / 4; return `${q.toString().replace('.', ',')} oz`; };
const barras = p => `<div class="perfil">${eixos.map(e => `<span class="eixo"><span class="rot">${esc(e.nome)}</span><span class="trilho"><span style="width:${p[e.id] * 20}%"></span></span><span class="v">${p[e.id]}</span></span>`).join('')}</div>`;
const alvoNome = a => { const [k, id] = a.split(':'); return k === 'familia' ? `família ${famNome[id] ?? id}` : (recNome[id] ?? id.replace(/_/g, ' ')); };
const qtd = i => i.ml !== undefined ? `${i.ml} ml <span class="sub">(${oz(i.ml)})</span>` : i.unidade === 'top' ? 'completar' : `${i.qtd} ${i.unidade}`;
const STATUS = { pronto: 'pronto', com_ajuste: 'com ajuste' };

const fichaReceita = r => {
  if (r.tipoReceita === 'preparo') return `<article class="rec"><h3>${esc(r.nome)} <span class="pill">preparo</span></h3>
    <ul>${r.ingredientes.map(i => `<li>${qtd(i)} ${esc(T[i.tipo]?.nome ?? i.tipo)}</li>`).join('')}</ul>
    <ol>${r.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
    <p class="sub">rende ${r.rendimentoMl} ml · ${r.tempoMin} min · dura ${r.validadeDias} dias na geladeira</p>
    <p class="fonte">${r.fontes.map(f => `<a href="${esc(f.url)}">${esc(dominio(f.url))}</a>`).join(' · ')} · ${esc(r.confianca.replace('_', ' '))}</p></article>`;
  const { status, linhas } = motor.avaliar(r);
  return `<article class="rec">
  <div class="cab"><span class="cor" style="background:${esc(r.cor)}"></span><div><h3>${esc(r.nome)}</h3>
  <p class="sub">${esc(famNome[r.familia] ?? r.familia)} · ${esc(r.tecnica)} · ${esc(r.copo.replace('_', ' '))} · gelo ${esc(r.gelo.replace('_', ' '))} · ~${r.abv}% · ~${r.volumeFinalMl} ml${r.iba ? ` · IBA ${esc(r.iba)}` : ''}</p></div>
  <span class="pill ${status}">${esc(STATUS[status] ?? status)}</span></div>
  <ul class="ings">${linhas.map(({ i, d }) => `<li><b>${qtd(i)}</b> ${esc(T[i.tipo]?.nome ?? i.tipo)}${i.opcional ? ' <span class="sub">(opcional)</span>' : ''}
    <span class="sub">${d.como === 'exato' ? `· você tem ${d.garrafas.length}: ${d.garrafas.slice(0, 5).map(g => esc(G[g].rotulo)).join(', ')}${d.garrafas.length > 5 ? '…' : ''}` : d.como === 'basico' ? '· básico' : d.como === 'serveComo' ? `· ${d.garrafas.map(g => esc(G[g].rotulo)).join(', ')} serve: ${esc(d.nota)}` : d.como === 'substituicao' ? `· troca por ${esc(T[d.por]?.nome)}: ${esc(d.nota)}` : d.como === 'falta' ? '· <span class="falta">falta</span>' : ''}</span></li>`).join('')}</ul>
  ${r.guarnicao?.length ? `<p class="sub">guarnição: ${r.guarnicao.map(g => esc(g.texto)).join(', ')}</p>` : ''}
  <ol>${r.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
  ${barras(r.perfil)}
  <p class="fonte">${[r.origem?.cidade, r.origem?.bar, r.origem?.bartender, r.origem?.ano].filter(Boolean).map(esc).join(' · ')}${r.origem?.cidade || r.origem?.ano ? '<br>' : ''}
  spec da fonte: <i>${esc(r.specFonte ?? '—')}</i><br>${r.fontes.map(f => `<a href="${esc(f.url)}">${esc(dominio(f.url))}</a>`).join(' · ')} · ${esc(r.confianca.replace('_', ' '))}</p>
  </article>`;
};

const fichaGarrafa = g => {
  const c = conf[g.id], i = inv[g.id] ?? {};
  const flags = [g.perfilStatus === 'pendente' && 'perfil pendente', g.confiancaPerfil === 'baixa' && 'confiança baixa',
    c && c.tipoSugerido !== g.tipo && `tipo ajustado`, i.colecao && 'coleção', i.nivel === 'fim' && 'quase acabando', g.abv == null && 'ABV desconhecido'].filter(Boolean);
  return `<article class="gar">
  <img src="${img(g.id)}" alt="${esc(g.rotulo)}">
  <div class="txt"><div class="num">#${c?.n ?? ''}</div><h3>${esc(g.rotulo)}</h3>
  <p class="sub">${esc(T[g.tipo]?.nome ?? g.tipo)}${g.abv != null ? ` · ${String(g.abv).replace('.', ',')}%` : ''}${g.volumeMl ? ` · ${g.volumeMl} ml` : ''}${g.pais ? ` · ${esc(g.pais)}` : ''}</p>
  ${flags.length ? `<p>${flags.map(f => `<span class="pill aviso">${esc(f)}</span>`).join('')}</p>` : ''}
  ${g.composicao ? `<p class="sub">${esc(g.composicao)}</p>` : ''}
  <p>${esc(g.notas)}</p>
  ${barras(g.perfil)}
  ${g.melhorUso.length ? `<ul class="usos">${[...g.melhorUso].sort((a, b) => b.nota - a.nota).map(m => `<li><b>${'★'.repeat(m.nota)}</b> ${esc(alvoNome(m.alvo))} — ${esc(m.frase)}</li>`).join('')}</ul>` : ''}
  ${(g.serveComo ?? []).length ? `<p class="sub">serve como: ${g.serveComo.map(s => `${esc(T[s.tipo]?.nome)} (${esc(s.nota)})`).join('; ')}</p>` : ''}
  <p class="fonte">${g.fontes.length ? g.fontes.map(f => `<a href="${esc(f)}">${esc(dominio(f))}</a>`).join(' · ') : 'sem fonte (pendente)'}</p>
  </div></article>`;
};

const ordemCat = categorias.map(c => c.id);
const porCat = ordemCat.map(c => [categorias.find(x => x.id === c), garrafas.filter(g => T[g.tipo].categoria === c)]).filter(([, l]) => l.length);
const drinks = receitas.filter(r => r.tipoReceita === 'drink'), preparos = receitas.filter(r => r.tipoReceita === 'preparo');
const pend = garrafas.filter(g => g.perfilStatus === 'pendente' || g.confiancaPerfil === 'baixa');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão da fase 1</title>
<style>
:root{--bg:#121212;--card:#1d1d1f;--txt:#f2f2f2;--sub:#a8a8ad;--line:#333;--acc:#e0a96d;--ok:#7cc48a;--okbg:#1f3324;--aj:#f0b44c;--ajbg:#3a2c12;--bad:#ef7d7d}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#f5f5f7;--card:#fff;--txt:#1a1a1a;--sub:#5f5f66;--line:#ddd;--acc:#9a5b1e;--ok:#1f6b33;--okbg:#e3f3e6;--aj:#8a5a00;--ajbg:#fdf0d5;--bad:#a32d2d}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 -apple-system,Segoe UI,system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:16px}h1{font-size:24px;margin:8px 0}h2{font-size:19px;margin:32px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--line)}
h3{font-size:16px;margin:0}.sub{color:var(--sub);font-size:13px}a{color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr));gap:12px}
.rec,.gar{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}
.cab{display:flex;gap:10px;align-items:flex-start}.cab>div{flex:1;min-width:0}.cor{width:14px;height:44px;border-radius:4px;flex:none}
.pill{display:inline-block;font-size:12px;border-radius:99px;padding:1px 9px;margin:0 4px 4px 0;background:var(--line);color:var(--txt);white-space:nowrap}
.pill.pronto{background:var(--okbg);color:var(--ok)}.pill.com_ajuste,.pill.aviso{background:var(--ajbg);color:var(--aj)}.falta{color:var(--bad)}
ul,ol{padding-left:20px;margin:8px 0}li{margin:2px 0}.ings{list-style:none;padding:0}.ings li{padding:3px 0;border-bottom:1px solid var(--line)}
.gar{display:flex;gap:12px}.gar img{width:96px;height:154px;object-fit:cover;border-radius:8px;flex:none}.txt{min-width:0;flex:1;overflow-wrap:anywhere}.num{font-size:12px;color:var(--sub)}
.perfil{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:2px 14px;margin:8px 0}.eixo{display:grid;grid-template-columns:72px 1fr 12px;gap:6px;align-items:center;font-size:12px;color:var(--sub)}
.trilho{height:6px;background:var(--line);border-radius:3px;overflow:hidden}.trilho span{display:block;height:100%;background:var(--acc)}
.usos{font-size:13px;padding-left:0;list-style:none}.usos b{color:var(--acc);font-weight:500;letter-spacing:-1px}.fonte{font-size:12px;color:var(--sub);margin:8px 0 0}
.resumo{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.met{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px}.met b{display:block;font-size:22px;font-weight:600}
</style></head><body><main>
<h1>Revisão da fase 1</h1>
<p class="sub">Base ${esc(ler('meta.json').baseVersion)} · gerada em ${esc(ler('meta.json').geradoEm)}. ABV e volume dos drinks são estimativas provisórias.</p>
<div class="resumo">
<div class="met"><b>${garrafas.length}</b>garrafas com perfil</div>
<div class="met"><b>${drinks.length}</b>receitas de exemplo</div>
<div class="met"><b>${drinks.filter(r => !motor.avaliar(r).status.startsWith('falta')).length}/${drinks.length}</b>possíveis no seu bar</div>
<div class="met"><b>${pend.length}</b>perfis pendentes ou de confiança baixa</div>
</div>
<h2>10 receitas que você já consegue fazer</h2>
<div class="grid">${drinks.map(fichaReceita).join('')}${preparos.map(fichaReceita).join('')}</div>
${porCat.map(([c, l]) => `<h2>${esc(c.nome)} (${l.length})</h2><div class="grid">${l.map(fichaGarrafa).join('')}</div>`).join('')}
</main></body></html>`;
writeFileSync('research/revisao-fase1.html', html);
console.log(`research/revisao-fase1.html (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
