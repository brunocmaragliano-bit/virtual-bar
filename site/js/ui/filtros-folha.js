// Folha de filtros combináveis (função 7), usada em Descobrir e Receitas.
import { opcoes, aplicar, contarFiltros, filtrosVazios, TEOR } from '../engine/filtros.js';
import { esc, nomeFamilia, nomeTipo, TECNICA, OCASIAO, chave } from './comum.js';

export function chipsAtivos(est) {
  const f = est.prefs.filtros, out = [];
  const nome = (g, v) => g === 'sabor' ? est.eixos.find(e => e.id === v)?.nome : g === 'familia' ? nomeFamilia(est, v)
    : g === 'tecnica' ? TECNICA[v] : g === 'ocasiao' ? OCASIAO[v] : g === 'teor' ? `teor ${TEOR.find(t => t.id === v)?.nome}` : nomeTipo(est, v);
  for (const [g, vs] of Object.entries(f)) for (const v of vs)
    out.push(`<button class="chip" aria-pressed="true" data-acao="filtro" data-grupo="${g}" data-valor="${esc(v)}">${esc(nome(g, v))}<span class="x">×</span></button>`);
  return out.join('');
}

export function botaoFiltros(est) {
  const n = contarFiltros(est.prefs.filtros) + (est.prefs.soExato ? 1 : 0);
  return `<button class="chip" data-acao="abrir-filtros" aria-pressed="${n > 0}">Filtros${n ? ` · ${n}` : ''}</button>`;
}

export function renderFolhaFiltros(ctx) {
  const { est } = ctx, f = est.prefs.filtros;
  const drinks = est.base.drinks;
  const op = opcoes(est.base, drinks);
  const grupo = (titulo, g, ids, nome) => ids.length ? `<h3>${titulo}</h3><div class="chips quebra">${ids.map(id =>
    `<button class="chip" data-acao="filtro" data-grupo="${g}" data-valor="${esc(id)}" aria-pressed="${f[g].includes(id)}">${esc(nome(id))}</button>`).join('')}</div>` : '';
  const n = aplicar(est.base, drinks, f).length;
  return `<h2>Filtros</h2>
    ${grupo('Sabor (tem que ter todos)', 'sabor', est.eixos.map(e => e.id), id => est.eixos.find(e => e.id === id).nome)}
    ${grupo('Família', 'familia', op.familia, id => nomeFamilia(est, id))}
    ${grupo('Destilado base', 'base', op.base, id => nomeTipo(est, id))}
    ${grupo('Fresco, erva ou especiaria', 'fresco', op.fresco, id => nomeTipo(est, id))}
    ${grupo('Técnica', 'tecnica', op.tecnica, id => TECNICA[id] ?? id)}
    ${grupo('Teor alcoólico', 'teor', TEOR.map(t => t.id), id => `${TEOR.find(t => t.id === id).nome} ${id === 'leve' ? '(< 12%)' : id === 'medio' ? '(12–20%)' : '(> 20%)'}`)}
    ${grupo('Ocasião', 'ocasiao', op.ocasiao, id => OCASIAO[id] ?? id)}
    <h3>Posso fazer</h3>
    <div class="bloco"><div class="linha-opcao"><div class="t">Só com o que tenho exatamente<small>Esconde o que precisa de substituição ou de preparo antes</small></div>${chave(est.prefs.soExato, 'so-exato', '', 'Só exato')}</div></div>
    <div class="rodape"><button class="btn" data-acao="limpar-filtros">Limpar</button><button class="btn primario" data-acao="fechar-folha">Ver ${n} receitas</button></div>`;
}

export const acoesFiltros = {
  'abrir-filtros': (el, ctx) => ctx.folha.abrir(renderFolhaFiltros),
  filtro(el, ctx) {
    const f = structuredClone(ctx.est.prefs.filtros), { grupo, valor } = el.dataset;
    f[grupo] = f[grupo].includes(valor) ? f[grupo].filter(v => v !== valor) : [...f[grupo], valor];
    ctx.est.setPref('filtros', f);
  },
  'limpar-filtros': (el, ctx) => { ctx.est.setPref('filtros', filtrosVazios()); ctx.est.setPref('soExato', false); },
  'so-exato': (el, ctx) => ctx.est.setPref('soExato', !ctx.est.prefs.soExato),
};
