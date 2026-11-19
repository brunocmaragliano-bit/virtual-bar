// Página de amostra dos lotes preparados (research/lotes/amostra.html), para o Bruno revisar antes de consolidar (D14).
// Usa a base paralela de research/lotes/_staging/data. Fichas sorteadas com semente fixa (a amostra não muda entre execuções).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { criarMotor } from './motor.mjs';

const STG = 'research/lotes/_staging/data';
const ler = p => JSON.parse(readFileSync(p, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const oz = ml => { const q = Math.round(ml / 30 * 4) / 4; return `${q} oz`.replace('.25', '¼').replace('.5', '½').replace('.75', '¾').replace(/^0/, ''); };
const SEM = { top: 'completar', splash: 'um splash', um_pouco: 'um pouco' };
const qtd = i => i.ml !== undefined ? `${String(i.ml).replace('.', ',')} ml <span class="s">(${oz(i.ml)})</span>` : SEM[i.unidade] ?? `${i.qtd} ${i.unidade}`;
function sortear(lista, n, semente = 7) {
  const a = [...lista]; let s = semente;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

export function gerar(lotes) {
  if (!existsSync(STG)) { console.error('rode "preparar" antes'); process.exit(1); }
  const tipos = ler(join(STG, 'tipos.json')), T = Object.fromEntries(tipos.map(t => [t.id, t]));
  const familias = Object.fromEntries(ler(join(STG, 'familias.json')).map(f => [f.id, f.nome]));
  const eixos = ler(join(STG, 'eixos.json'));
  const seed = ler(join(STG, 'seed/meu-bar.json'));
  const motor = criarMotor({ tipos, garrafas: ler(join(STG, 'garrafas.json')), substituicoes: ler(join(STG, 'substituicoes.json')), inventario: seed.inventario, basicosSempre: seed.prefs.basicosSempre });
  const STATUS = { pronto: ['ok', 'pronto'], com_ajuste: ['aj', 'com ajuste'] };
  const ficha = r => {
    const st = r.tipoReceita === 'drink' ? motor.avaliar(r).status : null;
    const [cl, txt] = STATUS[st] ?? ['fa', st ? st.replace('_', ' ') : 'preparo'];
    return `<article class="rec"><div class="cab"><span class="cor" style="background:${esc(r.cor ?? '#555')}"></span><div><h3>${esc(r.nome)}</h3>
      <p class="s">${esc(r.tipoReceita === 'preparo' ? `produz ${T[r.produz]?.nome ?? r.produz} · rende ~${r.rendimentoMl} ml${r.rendimentoEstimado ? ' (estimado)' : ''} · ${r.tempoMin} min · ${r.validadeDias} dias${r.rapido ? ' · rápido' : ''}`
        : [familias[r.familia], r.tecnica, r.copo, r.gelo, r.abv != null ? `~${r.abv}%` : null, r.iba ? `IBA ${r.iba}` : null].filter(Boolean).join(' · '))}</p></div>
      <span class="pill ${cl}">${esc(txt)}</span></div>
      <ul class="ings">${r.ingredientes.map(i => `<li><b>${qtd(i)}</b> ${esc(T[i.tipo]?.nome ?? `⚠ ${i.tipo}`)}${i.opcional ? ' <span class="s">(opcional)</span>' : ''}${i.nota ? `<br><span class="s">${esc(i.nota)}</span>` : ''}</li>`).join('')}</ul>
      ${r.guarnicao?.length ? `<p class="s">guarnição: ${esc(r.guarnicao.map(g => g.texto).join('; '))}</p>` : ''}
      <ol>${r.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      ${r.perfil ? `<p class="s">${eixos.filter(e => r.perfil[e.id] >= 3).map(e => `${e.nome} ${r.perfil[e.id]}`).join(' · ')}</p>` : ''}
      <p class="fonte">${[r.origem?.bar, r.origem?.bartender, r.origem?.cidade, r.origem?.ano].filter(Boolean).map(esc).join(' · ')}<br>
      spec da fonte: <i>${esc(r.specFonte ?? '—')}</i><br>${r.fontes.map(f => `<a href="${esc(f.url)}">${esc(dominio(f.url))}</a>`).join(' · ')} · ${esc(r.confianca.replace('_', ' '))}</p></article>`;
  };

  const secoes = lotes.map(nn => {
    const d = `research/lotes/${nn}`, L = ler(join(d, 'lote.json'));
    const ids = new Set(ler(join(d, 'receitas.json')).map(r => r.id));
    const rs = readdirSync(join(STG, 'receitas')).flatMap(f => ler(join(STG, 'receitas', f))).filter(r => ids.has(r.id));
    const props = existsSync(join(d, 'tipos-propostos.json')) ? ler(join(d, 'tipos-propostos.json')) : [];
    const notas = existsSync(join(d, 'notas.md')) ? readFileSync(join(d, 'notas.md'), 'utf8') : '';
    const conf = rs.reduce((m, r) => (m[r.confianca] = (m[r.confianca] ?? 0) + 1, m), {});
    const dom = [...new Set(rs.flatMap(r => r.fontes.map(f => dominio(f.url))))];
    const atencao = rs.filter(r => r.ingredientes.some(i => ['splash', 'um_pouco', 'top'].includes(i.unidade) || /faixa|range|–|a \d/.test(i.nota ?? '')));
    const amostra = rs.length <= 14 ? rs : sortear(rs, 10, Number(nn) * 31 + 7);
    const possiveis = rs.filter(r => r.tipoReceita === 'drink' && motor.avaliar(r).possivel);
    return `<h2>Lote ${esc(nn)} — ${esc(L.descricao)} (${rs.length})</h2>
    <p class="s">fontes: ${esc(dom.join(', '))} · ${Object.entries(conf).map(([k, v]) => `${esc(k.replace('_', ' '))} ${v}`).join(' · ')} · possíveis com o seu bar: ${possiveis.length}</p>
    <div class="chips">${rs.map(r => `<span class="chip${possiveis.includes(r) ? ' ok' : ''}">${esc(r.nome)}</span>`).join('')}</div>
    ${props.length ? `<p class="s">tipos novos: ${props.map(t => esc(t.nome)).join(', ')}</p>` : ''}
    <h3>${rs.length <= 14 ? 'Todas as receitas' : `Amostra de ${amostra.length} receitas (sorteadas)`}</h3><div class="grid">${amostra.map(ficha).join('')}</div>
    ${atencao.length && rs.length > 14 ? `<h3>Para conferir: quantidades sem número ou com faixa (${atencao.length})</h3><div class="grid">${atencao.filter(r => !amostra.includes(r)).map(ficha).join('')}</div>` : ''}
    <details><summary>Notas da pesquisa do lote</summary><pre>${esc(notas)}</pre></details>`;
  }).join('');

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Amostra dos lotes</title>
<style>:root{--bg:#121212;--card:#1d1d1f;--txt:#f2f2f2;--sub:#a8a8ad;--line:#333;--acc:#e0a96d;--ok:#7cc48a;--okbg:#1f3324;--aj:#f0b44c;--ajbg:#3a2c12;--fa:#ef8a7d;--fabg:#3a1f1c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 -apple-system,Segoe UI,system-ui,sans-serif}main{max-width:1100px;margin:0 auto;padding:16px}
h1{font-size:24px}h2{font-size:19px;margin:34px 0 6px;padding-bottom:6px;border-bottom:1px solid var(--line)}h3{font-size:15px;margin:18px 0 8px}.s{color:var(--sub);font-size:13px}a{color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(330px,100%),1fr));gap:12px}.rec{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0;overflow-wrap:anywhere}
.cab{display:flex;gap:10px}.cab>div{flex:1;min-width:0}.cab h3{margin:0}.cor{width:12px;height:40px;border-radius:4px;flex:none}
.pill{font-size:12px;border-radius:99px;padding:1px 9px;height:fit-content;white-space:nowrap}.pill.ok{background:var(--okbg);color:var(--ok)}.pill.aj{background:var(--ajbg);color:var(--aj)}.pill.fa{background:var(--fabg);color:var(--fa)}
.ings{list-style:none;padding:0;margin:8px 0}.ings li{padding:3px 0;border-bottom:1px solid var(--line)}ol{padding-left:20px}.fonte{font-size:12px;color:var(--sub)}
.chips{display:flex;flex-wrap:wrap;gap:5px}.chip{font-size:12px;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:2px 9px}.chip.ok{border-color:var(--ok);color:var(--ok)}
pre{white-space:pre-wrap;font-size:12px;color:var(--sub);background:var(--card);padding:12px;border-radius:10px}summary{cursor:pointer;color:var(--acc);margin:12px 0}</style></head><body><main>
<h1>Amostra dos lotes de receitas</h1><p class="s">Antes de entrar na base (D14). Verde = dá para fazer com o seu bar. Teor estimado (v0).</p>${secoes}</main></body></html>`;
  writeFileSync('research/lotes/amostra.html', html);
  console.log(`research/lotes/amostra.html (${(html.length / 1024).toFixed(0)} KB)`);
}
