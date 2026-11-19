// Peças de interface compartilhadas entre as telas.
import { esc, pct } from '../formato.js';
import { icone } from '../icones.js';
import { ilustracao } from './ilustracao.js';

export const TECNICA = { batido: 'batido', mexido: 'mexido', montado: 'montado no copo', batido_seco: 'dry shake', macerado: 'macerado',
  blender: 'liquidificador', swizzle: 'swizzle', throw: 'throw', whip: 'whip shake' };
export const COPO = { coupe: 'coupe', nick_nora: 'Nick & Nora', martini: 'taça martini', rocks: 'copo baixo', dof: 'copo baixo duplo',
  highball: 'highball', collins: 'collins', julep_cup: 'copo de julep', tiki_mug: 'caneca tiki', taca_vinho: 'taça de vinho',
  flauta: 'flûte', caneca_cobre: 'caneca de cobre', caneca_quente: 'caneca', shot: 'shot' };
export const GELO = { nenhum: 'sem gelo', cubos: 'gelo em cubos', cubo_grande: 'cubo grande', picado: 'gelo picado', bloco: 'bloco de gelo' };
export const OCASIAO = { aperitivo: 'aperitivo', digestivo: 'digestivo', verao: 'verão', festa: 'festa', brunch: 'brunch', noite: 'noite', sobremesa: 'sobremesa', inverno: 'inverno' };
export const CONFIANCA = { spec_publicada: 'spec publicada', adaptacao_publicada: 'adaptação publicada', reconstrucao: 'reconstrução publicada' };

export const nomeFamilia = (est, id) => est.familias.find(f => f.id === id)?.nome ?? id;
export const nomeTipo = (est, id) => est.base.tipoPorId[id]?.nome ?? id;

export function badge(status) {
  if (status === 'pronto') return '<span class="badge pronto">pronto</span>';
  if (status === 'com_ajuste') return '<span class="badge ajuste">com ajuste</span>';
  if (status?.startsWith('falta_')) return `<span class="badge falta">falta ${status.split('_')[1]}</span>`;
  return '';
}

export function itemReceita(est, r, aval, extra = '') {
  const meta = extra || [nomeFamilia(est, r.familia), r.abv != null ? pct(r.abv) : null].filter(Boolean).join(' · ');
  return `<a class="item" href="#/receita/${esc(r.id)}">
    ${ilustracao(r, 'mini-ilu')}
    <div class="txt"><div class="nome">${esc(r.nome)}</div><div class="meta">${meta}</div></div>
    <div class="lado">${aval ? badge(aval.status) : ''}</div>
  </a>`;
}

export function barras(est, perfil) {
  return `<div class="perfil">${est.eixos.map(e => `<div class="eixo"><span>${esc(e.nome)}</span><span class="trilho"><i style="width:${(perfil?.[e.id] ?? 0) * 20}%"></i></span></div>`).join('')}</div>`;
}

export function topo(titulo, { sub = '', acoes = '', voltar = null } = {}) {
  return `${voltar ? `<a class="voltar" href="${esc(voltar)}" data-acao="voltar">${icone('voltar')}Voltar</a>` : ''}
  <header class="topo"><div><h1>${esc(titulo)}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${acoes ? `<div class="topo-acoes">${acoes}</div>` : ''}</header>`;
}

export const vazio = (titulo, texto) => `<div class="vazio"><strong>${esc(titulo)}</strong>${esc(texto)}</div>`;
export const seg = (opcoes, atual, acao) => `<div class="seg" role="group">${opcoes.map(([id, rotulo]) =>
  `<button data-acao="${acao}" data-valor="${esc(id)}" aria-pressed="${id === atual}">${rotulo}</button>`).join('')}</div>`;
export const chave = (ligada, acao, valor = '', rotulo = '') => `<button class="chave" role="switch" aria-label="${esc(rotulo)}" aria-pressed="${!!ligada}" data-acao="${acao}" data-valor="${esc(valor)}"></button>`;
export { esc, icone, ilustracao };
