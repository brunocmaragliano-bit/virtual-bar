// Motor de disponibilidade (CLAUDE.md §7). Puro: sem DOM, sem IndexedDB — roda no app e nos testes (node:test).
//
// base:    { tipos, garrafas, substituicoes, receitas }  (como em site/data)
// usuario: { inventario: { [id]: { status, colecao?, desde? } }, garrafasUsuario: [], basicosSempre: [], contarSubstituicoes: bool }
//
// Ordem para um tipo T: exato (garrafa do tipo/descendente, ou o próprio tipo marcado "tenho") · básico · derivado
// (suco ← fruta) · preparo rápido · serveComo da garrafa · substituição. Status da receita: pronto · com_ajuste · falta_N.

export function indexarBase(base) {
  const tipoPorId = Object.fromEntries(base.tipos.map(t => [t.id, t]));
  const ancestraisCache = new Map();
  const ancestrais = id => {
    if (!ancestraisCache.has(id)) {
      const a = [];
      for (let p = id, n = 0; p && n < 20; p = tipoPorId[p]?.pai, n++) a.push(p);
      ancestraisCache.set(id, a);
    }
    return ancestraisCache.get(id);
  };
  const receitas = base.receitas ?? [];
  return {
    ...base,
    tipoPorId, ancestrais,
    garrafaPorId: Object.fromEntries(base.garrafas.map(g => [g.id, g])),
    receitaPorId: Object.fromEntries(receitas.map(r => [r.id, r])),
    drinks: receitas.filter(r => r.tipoReceita === 'drink'),
    preparoPorId: Object.fromEntries(receitas.filter(r => r.tipoReceita === 'preparo').map(r => [r.id, r])),
    raiz: id => { const a = ancestrais(id); return a[a.length - 1]; },
  };
}

export const COMO_AJUSTE = new Set(['preparo', 'substituicao', 'serveComo']);

export function criarMotor(base, usuario) {
  const B = base.tipoPorId ? base : indexarBase(base);
  const inv = usuario.inventario ?? {};
  const todasGarrafas = [...B.garrafas, ...(usuario.garrafasUsuario ?? [])];
  const minhas = todasGarrafas.filter(g => inv[g.id]?.status === 'tenho' && !inv[g.id]?.colecao);
  const tiposMarcados = Object.entries(inv).filter(([id, e]) => e.status === 'tenho' && B.tipoPorId[id]).map(([id]) => id);
  const basicos = new Set(usuario.basicosSempre ?? []);
  const contarSubs = usuario.contarSubstituicoes !== false;
  const memo = new Map();

  function direto(t) {
    const garrafas = minhas.filter(g => B.ancestrais(g.tipo).includes(t)).map(g => g.id);
    const tipos = tiposMarcados.filter(id => B.ancestrais(id).includes(t));
    if (garrafas.length || tipos.length) return { como: 'exato', garrafas, tipos };
    if (basicos.has(t)) return { como: 'basico', garrafas: [], tipos: [t] };
    const tipo = B.tipoPorId[t];
    if (tipo?.derivadoDe) {
      const d = direto(tipo.derivadoDe);
      if (d) return { como: 'exato', garrafas: d.garrafas, tipos: d.tipos, derivadoDe: tipo.derivadoDe };
    }
    return null;
  }

  function disponivel(t) {
    if (memo.has(t)) return memo.get(t);
    let r = direto(t);
    const tipo = B.tipoPorId[t];
    if (!r && tipo?.preparo) {
      const p = B.preparoPorId[tipo.preparo];
      if (p?.rapido && p.ingredientes.every(i => i.opcional || direto(i.tipo))) r = { como: 'preparo', preparo: p.id, garrafas: [] };
    }
    if (!r && contarSubs) {
      const porGarrafa = minhas.filter(g => (g.serveComo ?? []).some(s => B.ancestrais(s.tipo).includes(t)));
      if (porGarrafa.length) {
        const s = porGarrafa[0].serveComo.find(s => B.ancestrais(s.tipo).includes(t));
        r = { como: 'serveComo', garrafas: porGarrafa.map(g => g.id), nota: s.nota, qualidade: s.qualidade };
      }
    }
    if (!r && contarSubs) {
      const regras = B.substituicoes
        .filter(s => s.de === t || (s.bidirecional && s.para === t))
        .map(s => ({ ...s, alvo: s.de === t ? s.para : s.de }))
        .sort((a, b) => b.qualidade - a.qualidade);
      for (const s of regras) {
        const d = direto(s.alvo);
        if (d) { r = { como: 'substituicao', por: s.alvo, nota: s.nota, qualidade: s.qualidade, ajuste: s.ajuste ?? [], garrafas: d.garrafas }; break; }
      }
    }
    r ??= { como: 'falta', garrafas: [] };
    memo.set(t, r);
    return r;
  }

  const avaliacoes = new Map();
  function avaliar(receita) {
    if (avaliacoes.has(receita.id)) return avaliacoes.get(receita.id);
    const linhas = receita.ingredientes.map(i => ({ ing: i, d: i.opcional ? { como: 'opcional', garrafas: [] } : disponivel(i.tipo) }));
    for (const g of receita.guarnicao ?? []) if (g.essencial && g.tipo) linhas.push({ ing: { tipo: g.tipo, guarnicao: true }, d: disponivel(g.tipo) });
    const faltam = linhas.filter(l => l.d.como === 'falta');
    const ajustes = linhas.filter(l => COMO_AJUSTE.has(l.d.como));
    const status = faltam.length ? `falta_${faltam.length}` : ajustes.length ? 'com_ajuste' : 'pronto';
    const res = { status, linhas, faltam: faltam.map(l => l.ing.tipo), possivel: !faltam.length, exato: !faltam.length && !ajustes.length };
    avaliacoes.set(receita.id, res);
    return res;
  }

  return { disponivel, avaliar, minhas, base: B };
}

// Frescos marcados "tenho hoje" que passaram da validade do tipo (D19): continuam contando, mas pedem reconfirmação.
export function frescosVencidos(base, inventario, hoje = new Date()) {
  const B = base.tipoPorId ? base : indexarBase(base);
  return Object.entries(inventario)
    .filter(([id, e]) => e.status === 'tenho' && e.desde && B.tipoPorId[id]?.perecivel)
    .filter(([id, e]) => (hoje - new Date(e.desde)) / 86400000 > B.tipoPorId[id].perecivel.validadeDias)
    .map(([id]) => id);
}
