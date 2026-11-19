// Receitas: base inteira, busca por nome (campo colado acima das abas) e filtros.
import { aplicar, buscar } from '../engine/filtros.js';
import { esc, icone, itemReceita, topo, vazio } from './comum.js';
import { botaoFiltros, chipsAtivos, acoesFiltros } from './filtros-folha.js';

function lista(ctx) {
  const { est } = ctx, m = est.motor();
  const rs = buscar(aplicar(est.base, est.base.drinks, est.prefs.filtros), est.ui.busca).sort((a, b) => a.nome.localeCompare(b.nome));
  const preparos = est.ui.busca ? buscar(Object.values(est.base.preparoPorId), est.ui.busca) : [];
  return { rs, html: [...rs, ...preparos].map(r => itemReceita(est, r, r.tipoReceita === 'drink' ? m.avaliar(r) : null,
    r.tipoReceita === 'preparo' ? 'preparo caseiro' : '')).join('') || vazio('Nenhuma receita', 'Tente outro nome ou tire um filtro.') };
}

export const receitas = {
  render(ctx) {
    const { est } = ctx, { rs, html } = lista(ctx);
    return `${topo('Receitas', { sub: `<span data-parcial="contagem">${rs.length} de ${est.base.drinks.length}</span>` })}
    <div class="chips">${botaoFiltros(est)}${chipsAtivos(est)}</div>
    <div class="lista" data-parcial="lista">${html}</div>
    <div class="busca-baixo"><label class="campo">${icone('busca')}<input type="search" data-input="busca" placeholder="Buscar drink pelo nome" value="${esc(est.ui.busca)}" autocomplete="off" enterkeyhint="search">
      ${est.ui.busca ? `<button class="btn-ic" data-acao="limpar-busca" aria-label="Limpar busca">${icone('x', 18)}</button>` : ''}</label></div>`;
  },
  parciais: {
    lista: ctx => lista(ctx).html,
    contagem: ctx => `${lista(ctx).rs.length} de ${ctx.est.base.drinks.length}`,
  },
  inputs: { busca: (el, ctx) => { ctx.est.ui.busca = el.value; ctx.parcial(); } },
  acoes: { ...acoesFiltros, 'limpar-busca': (el, ctx) => { ctx.est.ui.busca = ''; ctx.est.avisar(); } },
};
