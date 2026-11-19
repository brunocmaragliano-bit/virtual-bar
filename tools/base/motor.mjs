// Protótipo do motor de disponibilidade (regras do CLAUDE.md §7), usado pelas ferramentas da fase 1.
// Na fase 2 esta lógica vira site/js/engine/disponibilidade.js (mesmo comportamento, testado com node:test).
export function criarMotor({ tipos, garrafas, substituicoes, inventario, basicosSempre }) {
  const tipoPorId = Object.fromEntries(tipos.map(t => [t.id, t]));
  const garrafaPorId = Object.fromEntries(garrafas.map(g => [g.id, g]));
  const basicos = new Set(basicosSempre);
  const minhas = inventario.filter(i => i.status === 'tenho' && !i.colecao && garrafaPorId[i.id]).map(i => garrafaPorId[i.id]);
  const ancestrais = t => { const a = []; for (let p = t; p; p = tipoPorId[p]?.pai) a.push(p); return a; };
  const garrafasDoTipo = t => minhas.filter(g => ancestrais(g.tipo).includes(t));

  function disponivel(t, prof = 0) {
    const exatas = garrafasDoTipo(t);
    if (exatas.length) return { como: 'exato', garrafas: exatas.map(g => g.id) };
    if (basicos.has(t)) return { como: 'basico' };
    const tipo = tipoPorId[t];
    if (tipo?.derivadoDe && prof < 2 && disponivel(tipo.derivadoDe, prof + 1).como !== 'falta') return { como: 'derivado', de: tipo.derivadoDe };
    const porGarrafa = minhas.filter(g => (g.serveComo ?? []).some(s => s.tipo === t));
    if (porGarrafa.length) return { como: 'serveComo', garrafas: porGarrafa.map(g => g.id),
      nota: porGarrafa.map(g => g.serveComo.find(s => s.tipo === t).nota).join(' ') };
    if (prof < 1) {
      const regras = substituicoes.filter(s => s.de === t || (s.bidirecional && s.para === t))
        .map(s => ({ ...s, alvo: s.de === t ? s.para : s.de })).sort((a, b) => b.qualidade - a.qualidade);
      for (const s of regras) {
        const d = disponivel(s.alvo, prof + 1);
        if (d.como !== 'falta') return { como: 'substituicao', por: s.alvo, nota: s.nota, garrafas: d.garrafas ?? [] };
      }
    }
    return { como: 'falta' };
  }

  function avaliar(r) {
    const linhas = r.ingredientes.map(i => ({ i, d: i.opcional ? { como: 'opcional' } : disponivel(i.tipo) }));
    const falta = linhas.filter(l => l.d.como === 'falta');
    const ajuste = linhas.filter(l => ['substituicao', 'serveComo'].includes(l.d.como));
    return { status: falta.length ? `falta_${falta.length}` : ajuste.length ? 'com_ajuste' : 'pronto', linhas };
  }
  return { disponivel, avaliar, tipoPorId, garrafaPorId };
}
