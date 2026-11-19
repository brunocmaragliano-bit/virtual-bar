// Formatação de quantidades (ml/oz, porções) e textos curtos. Puro, testável.

const FRACOES = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
export function oz(ml) {
  const q = Math.round((ml / 30) * 4) / 4;
  const inteiro = Math.floor(q), resto = q - inteiro;
  if (q === 0) return '¼ oz';
  return `${inteiro || ''}${FRACOES[resto] ?? ''} oz`.replace(/^ /, '');
}
export function ml(v) {
  const r = Math.round(v * 2) / 2;
  return `${String(r).replace('.', ',')} ml`;
}

const NOMES_UNIDADE = {
  dash: ['dash', 'dashes'], gota: ['gota', 'gotas'], bsp: ['colher de bar', 'colheres de bar'],
  un: ['', ''], folha: ['folha', 'folhas'], fatia: ['fatia', 'fatias'], pitada: ['pitada', 'pitadas'],
};
const SEM_QTD = { top: 'completar com', splash: 'um splash de', um_pouco: 'um pouco de' };

// Quantidade de um ingrediente já escalada para N porções, na unidade escolhida.
export function quantidade(ing, porcoes = 1, unidade = 'ml') {
  if (ing.ml !== undefined) {
    const v = ing.ml * porcoes;
    return unidade === 'oz' ? oz(v) : ml(v);
  }
  if (SEM_QTD[ing.unidade]) return SEM_QTD[ing.unidade];
  const q = (ing.qtd ?? 1) * porcoes;
  const n = Number.isInteger(q) ? String(q) : String(Math.round(q * 2) / 2).replace('.', ',');
  const [um, varios] = NOMES_UNIDADE[ing.unidade] ?? [ing.unidade, ing.unidade];
  return `${n}${um ? ' ' + (q > 1 ? varios : um) : ''}`;
}

export const pct = abv => `~${Math.round(abv)}%`;
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
