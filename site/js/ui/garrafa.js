// Ficha da garrafa: foto, status, nível, perfil, notas, melhor uso, fontes e atalho para "Partir desta garrafa".
import { esc, icone, barras, nomeTipo, seg } from './comum.js';

const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const CONF = { alta: 'confiança alta', media: 'confiança média', baixa: 'confiança baixa (pouca informação publicada)' };

export const garrafa = {
  render(ctx) {
    const { est, params } = ctx, g = est.garrafa(params.id);
    if (!g) return '<p class="vazio">Garrafa não encontrada.</p>';
    const e = est.inventario[g.id] ?? {};
    const alvo = a => { const [k, id] = a.split(':'); return k === 'familia' ? `família ${est.familias.find(f => f.id === id)?.nome ?? id}` : est.base.receitaPorId[id] ? `<a href="#/receita/${esc(id)}">${esc(est.base.receitaPorId[id].nome)}</a>` : esc(id.replace(/_/g, ' ')); };
    const info = [nomeTipo(est, g.tipo), g.abv != null ? `${String(g.abv).replace('.', ',')}%` : null, g.volumeMl ? `${g.volumeMl} ml` : null, g.pais].filter(Boolean);
    return `<a class="voltar" href="#/bar" data-acao="voltar">${icone('voltar')}Voltar</a>
    <div class="garrafa-heroi">${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.rotulo)}">` : ''}<div>
      <h1>${esc(g.rotulo)}</h1><div class="info">${info.map(i => `<span>${esc(i)}</span>`).join('')}</div></div></div>
    ${seg([['tenho', 'Tenho'], ['acabou', 'Acabou'], ['quero', 'Quero comprar']], e.status, 'status')}
    ${e.status === 'tenho' ? seg([['cheia', 'Cheia'], ['metade', 'Metade'], ['fim', 'Acabando']], e.nivel ?? 'cheia', 'nivel') : ''}
    <a class="btn primario largo" href="#/partir/${encodeURIComponent(g.id)}">${icone('copo')} Drinks com esta garrafa</a>
    <section class="secao"><h2>Perfil</h2>${barras(est, g.perfil)}
      <p class="texto">${g.perfilStatus === 'pendente' ? 'Perfil provisório, pendente de pesquisa. ' : ''}${esc(CONF[g.confiancaPerfil] ?? '')}</p></section>
    <section class="secao"><h2>Notas</h2><p>${esc(g.notas)}</p>${g.composicao ? `<p class="texto">${esc(g.composicao)}</p>` : ''}</section>
    ${g.melhorUso?.length ? `<section class="secao"><h2>Melhor uso</h2><div class="usos">${[...g.melhorUso].sort((a, b) => b.nota - a.nota).map(m =>
      `<div class="uso"><span class="estrelas">${'★'.repeat(m.nota)}</span><b>${alvo(m.alvo)}</b> — ${esc(m.frase)}</div>`).join('')}</div></section>` : ''}
    ${g.serveComo?.length ? `<section class="secao"><h2>Também serve como</h2><p class="texto">${g.serveComo.map(s => `${esc(nomeTipo(est, s.tipo))}: ${esc(s.nota)}`).join('<br>')}</p></section>` : ''}
    <section class="secao"><h2>Na coleção</h2><div class="bloco"><div class="linha-opcao"><div class="t">Só coleção<small>Aparece aqui, mas não conta no "Posso fazer"</small></div>
      <button class="chave" role="switch" aria-pressed="${!!e.colecao}" data-acao="colecao" aria-label="Só coleção"></button></div></div></section>
    ${g.fontes?.length ? `<section class="secao"><h2>Fontes</h2><p class="texto">${g.fontes.map(f => `<a href="${esc(f)}" target="_blank" rel="noopener">${esc(dominio(f))}</a>`).join(' · ')}</p></section>` : ''}`;
  },
  acoes: {
    status: (el, ctx) => ctx.est.setInventario(ctx.params.id, { status: el.dataset.valor }),
    nivel: (el, ctx) => ctx.est.setInventario(ctx.params.id, { nivel: el.dataset.valor }),
    colecao: (el, ctx) => ctx.est.setInventario(ctx.params.id, { colecao: !ctx.est.inventario[ctx.params.id]?.colecao }),
  },
};
