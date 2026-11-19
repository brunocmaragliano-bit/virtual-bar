// Afinidade garrafa × receita (função 6, CLAUDE.md §7) e sorteio (função 4). Puro, testável.
import { EIXOS } from './eixos.js';

export function cosseno(a, b) {
  let ab = 0, aa = 0, bb = 0;
  for (const e of EIXOS) { ab += (a[e] ?? 0) * (b[e] ?? 0); aa += (a[e] ?? 0) ** 2; bb += (b[e] ?? 0) ** 2; }
  return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
}

// Em que ingrediente da receita esta garrafa entra, e como (exato, serveComo, substituição).
export function encaixe(base, garrafa, receita) {
  const anc = base.ancestrais(garrafa.tipo);
  for (const ing of receita.ingredientes) {
    if (anc.includes(ing.tipo)) return { ing, como: 'exato' };
  }
  for (const ing of receita.ingredientes) {
    if ((garrafa.serveComo ?? []).some(s => base.ancestrais(s.tipo).includes(ing.tipo))) return { ing, como: 'serveComo' };
  }
  for (const ing of receita.ingredientes) {
    const s = base.substituicoes.find(s => (s.de === ing.tipo && anc.includes(s.para)) || (s.bidirecional && s.para === ing.tipo && anc.includes(s.de)));
    if (s) return { ing, como: 'substituicao', nota: s.nota };
  }
  return null;
}

export function melhorUsoPara(garrafa, receita) {
  const lista = garrafa.melhorUso ?? [];
  return lista.find(m => m.alvo === `receita:${receita.id}`) ?? lista.find(m => m.alvo === `familia:${receita.familia}`) ?? null;
}

export function afinidade(base, garrafa, receita) {
  const enc = encaixe(base, garrafa, receita);
  if (!enc) return null;
  const mu = melhorUsoPara(garrafa, receita);
  const nota = mu ? mu.nota / 5 : 0.5;
  const cos = garrafa.perfil && receita.perfil ? cosseno(garrafa.perfil, receita.perfil) : 0.5;
  const pena = enc.como === 'exato' ? 1 : enc.como === 'serveComo' ? 0.9 : 0.8;
  return { pontos: Math.round((0.5 * nota + 0.5 * cos) * pena * 100), encaixe: enc, melhorUso: mu };
}

export function receitasParaGarrafa(base, garrafa, receitas) {
  return receitas.map(r => ({ r, a: afinidade(base, garrafa, r) })).filter(x => x.a)
    .sort((x, y) => y.a.pontos - x.a.pontos || x.r.nome.localeCompare(y.r.nome));
}

// Sorteio uniforme no pool, evitando os últimos sorteados (se ainda sobrar alguma opção).
export function sortear(pool, recentes = [], rnd = Math.random) {
  if (!pool.length) return null;
  const livres = pool.filter(r => !recentes.includes(r.id));
  const de = livres.length ? livres : pool;
  return de[Math.floor(rnd() * de.length)];
}
