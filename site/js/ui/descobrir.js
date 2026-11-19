// Descobrir: Posso fazer / Falta 1, filtros, sorteio, atalhos para Combinação e Partir de uma garrafa.
import { aplicar } from '../engine/filtros.js';
import { sortear } from '../engine/afinidade.js';
import { esc, icone, itemReceita, topo, vazio, seg, nomeTipo } from './comum.js';
import { botaoFiltros, chipsAtivos, acoesFiltros } from './filtros-folha.js';

const ordem = { pronto: 0, com_ajuste: 1 };
export function pools(est) {
  const m = est.motor();
  const filtrados = aplicar(est.base, est.base.drinks, est.prefs.filtros);
  const posso = filtrados.filter(r => { const a = m.avaliar(r); return est.prefs.soExato ? a.exato : a.possivel; })
    .sort((a, b) => (ordem[m.avaliar(a).status] - ordem[m.avaliar(b).status]) || a.nome.localeCompare(b.nome));
  const falta1 = filtrados.filter(r => m.avaliar(r).status === 'falta_1').sort((a, b) => a.nome.localeCompare(b.nome));
  const total = est.base.drinks.filter(r => m.avaliar(r).possivel).length;
  return { posso, falta1, total, m };
}

export const descobrir = {
  render(ctx) {
    const { est } = ctx, { posso, falta1, total, m } = pools(est);
    const vencidos = est.vencidos();
    const gruposFrescos = new Set(est.categorias.filter(c => c.grupo === 'frescos').map(c => c.id));
    const semFrescos = !Object.entries(est.inventario).some(([id, e]) => e.status === 'tenho' && gruposFrescos.has(est.base.tipoPorId[id]?.categoria));
    const lista = est.ui.modo === 'falta1' ? falta1 : posso;
    const itens = lista.map(r => {
      const a = m.avaliar(r);
      const extra = est.ui.modo === 'falta1' ? `falta: ${esc(a.faltam.map(t => nomeTipo(est, t)).join(', '))}` : '';
      return itemReceita(est, r, a, extra);
    }).join('');
    return `${topo('Descobrir', { sub: `${total} drinks possíveis com o seu bar agora` })}
    ${vencidos.length ? `<div class="alerta">Faz tempo que você marcou ${esc(vencidos.map(t => nomeTipo(est, t).toLowerCase()).join(', '))}. Ainda tem?
      <div class="acoes"><button class="btn pequeno" data-acao="renovar-frescos">Ainda tenho</button><a class="btn pequeno" href="#/bar?aba=frescos">Revisar</a></div></div>` : ''}
    ${semFrescos && !vencidos.length ? `<div class="alerta">A maioria dos clássicos leva limão, laranja ou ovo. Marque os frescos que você tem hoje para ver mais drinks.
      <div class="acoes"><a class="btn pequeno" href="#/bar?aba=frescos">Marcar frescos</a></div></div>` : ''}
    <div class="atalhos">
      <a class="atalho" href="#/combinacao"><span class="ic">${icone('combinar')}</span><div><b>Combinação</b><br><span class="d">2+ ingredientes</span></div></a>
      <a class="atalho" href="#/partir"><span class="ic">${icone('garrafa')}</span><div><b>Partir de uma garrafa</b><br><span class="d">o que combina com ela</span></div></a>
    </div>
    ${seg([['posso', `Posso fazer · ${posso.length}`], ['falta1', `Falta 1 · ${falta1.length}`]], est.ui.modo, 'modo')}
    <div class="chips">${botaoFiltros(est)}${chipsAtivos(est)}</div>
    <div class="lista">${itens || (est.ui.modo === 'falta1' ? vazio('Nada a um ingrediente', 'Com esses filtros, nenhuma receita fica a só um item de distância.') : vazio('Nada com esses filtros', 'Tire um filtro ou veja o que falta 1.'))}</div>
    ${est.ui.modo === 'posso' && posso.length ? `<button class="btn primario flutua sorteio" data-acao="sortear">${icone('sortear')} Sortear um drink</button>` : ''}`;
  },
  acoes: {
    ...acoesFiltros,
    modo: (el, ctx) => { ctx.est.ui.modo = el.dataset.valor; ctx.est.avisar(); },
    sortear(el, ctx) {
      const { est } = ctx, r = sortear(pools(est).posso, est.ui.recentes);
      if (!r) return;
      est.ui.recentes = [r.id, ...est.ui.recentes].slice(0, 5);
      ctx.nav(`#/receita/${r.id}?sorteio=1`);
    },
    'renovar-frescos': async (el, ctx) => { for (const id of ctx.est.vencidos()) await ctx.est.setInventario(id, { status: 'tenho', renovar: true }); },
  },
};
