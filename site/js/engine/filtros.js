// Filtros combináveis (CLAUDE.md §7): E entre grupos; OU dentro do grupo, exceto sabor, que é E
// (quem marca "amargo" e "herbal" quer as duas coisas). Puro, testável.

export const TEOR = [
  { id: 'leve', nome: 'leve', teste: abv => abv < 12 },
  { id: 'medio', nome: 'médio', teste: abv => abv >= 12 && abv <= 20 },
  { id: 'forte', nome: 'forte', teste: abv => abv > 20 },
];
const CATEG_FRESCOS = new Set(['erva', 'fruta', 'citrico_suco', 'especiaria', 'ovo_laticinio']);

export function filtrosVazios() {
  return { sabor: [], familia: [], base: [], fresco: [], tecnica: [], teor: [], ocasiao: [] };
}
export const contarFiltros = f => Object.values(f).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);

// Atributos derivados de cada receita, usados nos filtros e nas opções da folha de filtros.
export function atributos(base, r) {
  const bases = [...new Set(r.ingredientes.filter(i => i.papel === 'base').map(i => base.raiz(i.tipo))
    .filter(id => base.tipoPorId[id]?.categoria === 'destilado'))];
  const frescos = [...new Set([...r.ingredientes.map(i => i.tipo), ...(r.guarnicao ?? []).map(g => g.tipo).filter(Boolean)]
    .map(id => base.tipoPorId[id]?.derivadoDe ?? id)
    .filter(id => CATEG_FRESCOS.has(base.tipoPorId[id]?.categoria)))];
  return { bases, frescos };
}

export function aplicar(base, receitas, f) {
  return receitas.filter(r => {
    const a = atributos(base, r);
    if (f.sabor.length && !f.sabor.every(e => (r.perfil?.[e] ?? 0) >= 3)) return false;
    if (f.familia.length && !f.familia.includes(r.familia)) return false;
    if (f.base.length && !a.bases.some(b => f.base.includes(b))) return false;
    if (f.fresco.length && !a.frescos.some(x => f.fresco.includes(x))) return false;
    if (f.tecnica.length && !f.tecnica.includes(r.tecnica)) return false;
    if (f.teor.length && !TEOR.filter(t => f.teor.includes(t.id)).some(t => t.teste(r.abv ?? 0))) return false;
    if (f.ocasiao.length && !(r.ocasioes ?? []).some(o => f.ocasiao.includes(o))) return false;
    return true;
  });
}

// Opções disponíveis em cada grupo, a partir das receitas da base (só mostra o que existe).
export function opcoes(base, receitas) {
  const conta = (lista) => { const m = new Map(); for (const x of lista) m.set(x, (m.get(x) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1]).map(([id]) => id); };
  const attrs = receitas.map(r => atributos(base, r));
  return {
    familia: conta(receitas.map(r => r.familia)),
    base: conta(attrs.flatMap(a => a.bases)),
    fresco: conta(attrs.flatMap(a => a.frescos)),
    tecnica: conta(receitas.map(r => r.tecnica)),
    ocasiao: conta(receitas.flatMap(r => r.ocasioes ?? [])),
  };
}

// Combinação (função 5): receitas que levam TODOS os tipos escolhidos, com herança nos dois sentidos:
// escolher "whisky" acha a receita que pede rye; escolher "bourbon" acha a que pede "bourbon ou rye" (whiskey_americano).
export function combinacao(base, receitas, tiposEscolhidos) {
  if (!tiposEscolhidos.length) return [];
  const casa = (pedido, escolhido) => base.ancestrais(pedido).includes(escolhido) || base.ancestrais(escolhido).includes(pedido);
  return receitas.filter(r => tiposEscolhidos.every(t => r.ingredientes.some(i => casa(i.tipo, t))));
}

// Busca por nome (ignora acento e caixa), também em nomes alternativos.
export const normalizar = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export function buscar(receitas, termo) {
  const t = normalizar(termo);
  if (!t) return receitas;
  return receitas.filter(r => [r.nome, ...(r.nomesAlt ?? [])].some(n => normalizar(n).includes(t)));
}
