// Ficha da receita: ilustração, chips, disponibilidade por ingrediente, ml/oz e porções, passos, perfil, origem e fonte.
import { quantidade, pct, plural } from '../formato.js';
import { esc, icone, ilustracao, topo, barras, nomeFamilia, nomeTipo, TECNICA, COPO, GELO, CONFIANCA, OCASIAO, badge } from './comum.js';

const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

function linhaDisponivel(est, d) {
  const nomes = ids => ids.map(id => est.garrafa(id)?.rotulo ?? nomeTipo(est, id));
  switch (d.como) {
    case 'exato': {
      const n = [...nomes(d.garrafas), ...(d.garrafas.length ? [] : nomes(d.tipos ?? []))];
      return `<div class="tem">${d.derivadoDe ? `de ${esc(nomeTipo(est, d.derivadoDe).toLowerCase())} · ` : ''}você tem${n.length > 1 ? ` ${n.length}` : ''}: ${esc(n.slice(0, 3).join(', '))}${n.length > 3 ? '…' : ''}</div>`;
    }
    case 'basico': return '<div class="tem">básico, sempre tem</div>';
    case 'preparo': return `<div class="tem ajuste">prepare antes: <a href="#/receita/${esc(d.preparo)}">${esc(est.base.preparoPorId[d.preparo]?.nome ?? d.preparo)}</a></div>`;
    case 'serveComo': return `<div class="tem ajuste">use ${esc(nomes(d.garrafas).join(', '))}: ${esc(d.nota ?? '')}</div>`;
    case 'substituicao': return `<div class="tem ajuste">troque por ${esc(nomeTipo(est, d.por).toLowerCase())}${d.ajuste?.length ? ` (+ ${d.ajuste.map(a => `${a.ml} ml de ${nomeTipo(est, a.tipo).toLowerCase()}`).join(', ')})` : ''}: ${esc(d.nota)}</div>`;
    case 'falta': return '<div class="tem falta">você não tem</div>';
    default: return '';
  }
}

function resumoEstado(est, aval) {
  if (!aval) return '';
  if (aval.status === 'pronto') return '<div class="estado pronto">Dá para fazer agora, com o que você tem.</div>';
  if (aval.status === 'com_ajuste') return '<div class="estado ajuste">Dá para fazer, com um ajuste (veja nos ingredientes).</div>';
  return `<div class="estado falta">Falta: ${esc(aval.faltam.map(t => nomeTipo(est, t).toLowerCase()).join(', '))}.</div>`;
}

export const ficha = {
  render(ctx) {
    const { est, params } = ctx;
    const r = est.base.receitaPorId[params.id];
    if (!r) return `${topo('Receita não encontrada', { voltar: '#/receitas' })}`;
    const m = est.motor(), aval = m.avaliar(r);
    const base = r.porcoesBase ?? 1, porcoes = est.ui.porcoes[r.id] ?? base, un = est.prefs.unidade;
    const reg = est.registros[r.id] ?? {};
    const filhas = est.base.drinks.filter(x => x.variacaoDe === r.id);
    const mae = r.variacaoDe && est.base.receitaPorId[r.variacaoDe];
    const ings = aval.linhas.filter(l => !l.ing.guarnicao).map(({ ing, d }) => `<div class="ing">
        <div class="linha1"><span class="q">${esc(quantidade(ing, porcoes / base, un))}</span><span class="n">${esc(nomeTipo(est, ing.tipo))}${ing.opcional ? ' <small class="texto">(opcional)</small>' : ''}</span></div>
        ${linhaDisponivel(est, d)}${ing.nota ? `<div class="nota">${esc(ing.nota)}</div>` : ''}</div>`).join('');
    const info = [r.tipoReceita === 'preparo' ? 'preparo caseiro' : nomeFamilia(est, r.familia), r.tecnica && TECNICA[r.tecnica], r.copo && COPO[r.copo],
      r.gelo && r.tipoReceita === 'drink' && GELO[r.gelo], r.abv != null && pct(r.abv), r.volumeFinalMl && `~${r.volumeFinalMl} ml`].filter(Boolean);
    const origem = r.origem ? [r.origem.bar, r.origem.bartender, r.origem.cidade, r.origem.ano].filter(Boolean).join(' · ') : '';
    return `<a class="voltar" href="#/receitas" data-acao="voltar">${icone('voltar')}Voltar</a>
    <div class="heroi">${ilustracao(r)}<div>
      <h1>${esc(r.nome)}</h1>${r.nomesAlt?.length ? `<p class="alt">${esc(r.nomesAlt.join(' · '))}</p>` : ''}
      <div class="info">${info.map(i => `<span>${esc(i)}</span>`).join('')}${r.iba ? `<span>IBA</span>` : ''}</div></div></div>
    ${r.tipoReceita === 'drink' ? resumoEstado(est, aval) : `<div class="estado ajuste">Rende ~${r.rendimentoMl} ml · ${r.tempoMin} min · dura ${r.validadeDias} dias na geladeira.</div>`}
    ${params.query.sorteio ? `<button class="btn largo" data-acao="sortear-outro" style="margin-bottom:14px">${icone('sortear')} Sortear outro</button>` : ''}
    <section class="secao"><h2>Ingredientes<span class="controles">
      <span class="seg mini"><button data-acao="unidade" data-valor="ml" aria-pressed="${un === 'ml'}">ml</button><button data-acao="unidade" data-valor="oz" aria-pressed="${un === 'oz'}">oz</button></span>
      <span class="passador"><button data-acao="porcoes" data-valor="-1" aria-label="Menos porções">−</button><span>${plural(porcoes, 'porção', 'porções')}</span><button data-acao="porcoes" data-valor="1" aria-label="Mais porções">+</button></span>
    </span></h2><div class="ings">${ings}</div>
    ${base > 1 ? `<p class="texto" style="margin:10px 4px 0">A receita da fonte rende ${base} porções.</p>` : ''}
    ${r.guarnicao?.length ? `<p class="texto" style="margin:10px 4px 0">Guarnição: ${esc(r.guarnicao.map(g => g.texto).join('; '))}</p>` : ''}</section>
    <section class="secao"><h2>Modo de preparo</h2><ol class="passos">${r.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></section>
    ${r.perfil ? `<section class="secao"><h2>Perfil</h2>${barras(est, r.perfil)}${r.ocasioes?.length ? `<p class="texto">Bom para: ${esc(r.ocasioes.map(o => OCASIAO[o] ?? o).join(', '))}</p>` : ''}</section>` : ''}
    ${mae || filhas.length ? `<section class="secao"><h2>Variações</h2><div class="links-var">
      ${mae ? `<a class="chip" href="#/receita/${esc(mae.id)}">variação de ${esc(mae.nome)}</a>` : ''}
      ${filhas.map(f => `<a class="chip" href="#/receita/${esc(f.id)}">${esc(f.nome)} ${badge(m.avaliar(f).status)}</a>`).join('')}</div></section>` : ''}
    <section class="secao"><h2>Origem e fonte</h2><p class="texto">
      ${origem ? `${esc(origem)}<br>` : ''}${r.iba ? `Lista oficial IBA: ${esc(r.iba)}<br>` : ''}
      ${r.fontes.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(dominio(f.url))}</a>`).join(' · ')} · ${esc(CONFIANCA[r.confianca] ?? r.confianca)}
      ${r.specFonte ? `<br><small>Spec da fonte: ${esc(r.specFonte)}</small>` : ''}${r.estimativa ? `<br><small>Teor e volume estimados (${esc(r.estimativa)}).</small>` : ''}</p></section>
    <div class="rodape-acoes">
      <button class="btn" data-acao="favorito" aria-label="Favorito">${icone(reg.favorito ? 'coracao-cheio' : 'coracao')}${reg.favorito ? 'Favorito' : 'Favoritar'}</button>
      <button class="btn" data-acao="ja-fiz">${icone('check')}Já fiz${reg.historico?.length ? ` · ${reg.historico.length}` : ''}</button>
    </div>
    <a class="btn primario largo" href="#/preparo/${esc(r.id)}" style="margin-top:10px">${icone('play')} Modo preparo</a>`;
  },
  acoes: {
    unidade: (el, ctx) => ctx.est.setPref('unidade', el.dataset.valor),
    porcoes(el, ctx) {
      const id = ctx.params.id, atual = ctx.est.ui.porcoes[id] ?? ctx.est.base.receitaPorId[id]?.porcoesBase ?? 1;
      ctx.est.ui.porcoes[id] = Math.min(40, Math.max(1, atual + Number(el.dataset.valor)));
      ctx.est.avisar();
    },
    favorito: (el, ctx) => ctx.est.setRegistro(ctx.params.id, { favorito: !ctx.est.registros[ctx.params.id]?.favorito }),
    'ja-fiz'(el, ctx) {
      const id = ctx.params.id, reg = ctx.est.registros[id] ?? { historico: [] };
      ctx.est.setRegistro(id, { historico: [{ em: new Date().toISOString(), porcoes: ctx.est.ui.porcoes[id] ?? 1 }, ...(reg.historico ?? [])] });
      ctx.aviso('Anotado no histórico.');
    },
    'sortear-outro': (el, ctx) => ctx.acaoGlobal('sortear', el),
  },
};
