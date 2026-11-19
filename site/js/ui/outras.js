// Telas menores: Partir de uma garrafa, Combinação, Minhas Receitas e Ajustes.
import { receitasParaGarrafa } from '../engine/afinidade.js';
import { combinacao as combinar, normalizar } from '../engine/filtros.js';
import { quantidade } from '../formato.js';
import { esc, icone, topo, itemReceita, vazio, seg, chave, nomeTipo, badge, ilustracao } from './comum.js';

// ---------- Partir de uma garrafa (função 6) ----------
export const partir = {
  render(ctx) {
    const { est, params } = ctx, m = est.motor();
    if (!params.id) {
      const minhas = est.todasGarrafas().filter(g => est.inventario[g.id]?.status === 'tenho').sort((a, b) => a.rotulo.localeCompare(b.rotulo));
      return `${topo('Partir de uma garrafa', { sub: 'Escolha uma garrafa sua', voltar: '#/descobrir' })}
      <div class="lista">${minhas.map(g => `<a class="item" href="#/partir/${encodeURIComponent(g.id)}">${g.foto ? `<img class="foto" src="${esc(g.foto)}" alt="" loading="lazy">` : '<span class="foto"></span>'}
        <div class="txt"><div class="nome">${esc(g.rotulo)}</div><div class="meta">${esc(nomeTipo(est, g.tipo))}</div></div>${icone('direita')}</a>`).join('')}</div>`;
    }
    const g = est.garrafa(params.id);
    if (!g) return vazio('Garrafa não encontrada', '');
    const rs = receitasParaGarrafa(est.base, g, est.base.drinks);
    return `${topo(g.rotulo, { sub: `${rs.length} receitas onde ela entra, da que mais combina para a que menos`, voltar: '#/partir' })}
    <div class="lista">${rs.map(({ r, a }) => {
      const av = m.avaliar(r);
      const extra = a.melhorUso ? esc(a.melhorUso.frase) : a.encaixe.como === 'substituicao' ? `no lugar de ${esc(nomeTipo(est, a.encaixe.ing.tipo).toLowerCase())}` : `entra como ${esc(nomeTipo(est, a.encaixe.ing.tipo).toLowerCase())}`;
      return `<a class="item" href="#/receita/${esc(r.id)}">${ilustracao(r, 'mini-ilu')}
        <div class="txt"><div class="nome">${esc(r.nome)}</div><div class="meta" style="white-space:normal">${extra}</div></div>
        <div class="lado"><span class="pontos">${a.pontos}</span>${badge(av.status)}</div></a>`;
    }).join('') || vazio('Nenhuma receita da base usa esta garrafa', 'Quando entrarem mais receitas, elas aparecem aqui.')}</div>`;
  },
};

// ---------- Combinação (função 5) ----------
function sugestoesComb(est) {
  const termo = normalizar(est.ui.buscaComb);
  if (termo.length < 2) return '';
  const usados = new Set(est.base.drinks.flatMap(r => r.ingredientes.flatMap(i => est.base.ancestrais(i.tipo))));
  const ts = est.base.tipos.filter(t => usados.has(t.id) && !est.ui.combinacao.includes(t.id) && [t.nome, ...(t.sinonimos ?? [])].some(s => normalizar(s).includes(termo)))
    .sort((a, b) => (a.pai ? 1 : 0) - (b.pai ? 1 : 0) || a.nome.localeCompare(b.nome)).slice(0, 8);
  return ts.length ? `<div class="sugestoes">${ts.map(t => `<button data-acao="comb-add" data-valor="${esc(t.id)}"><span>${esc(t.nome)}</span><span class="s-tipo">${t.pai ? '' : 'qualquer'}</span></button>`).join('')}</div>` : '';
}
function resultadosComb(est) {
  const sel = est.ui.combinacao;
  if (!sel.length) return vazio('Escolha os ingredientes', 'Ex.: whisky + vermute. Aparecem os drinks que levam todos, com a receita completa.');
  const m = est.motor(), rs = combinar(est.base, est.base.drinks, sel).sort((a, b) => a.nome.localeCompare(b.nome));
  if (!rs.length) return vazio('Nenhum drink leva todos esses', 'Tire um ingrediente.');
  return rs.map(r => `<a class="item" href="#/receita/${esc(r.id)}" style="align-items:flex-start">${ilustracao(r, 'mini-ilu')}
    <div class="txt"><div class="nome">${esc(r.nome)}</div><div class="meta" style="white-space:normal">${r.ingredientes.map(i => `${esc(quantidade(i, 1, est.prefs.unidade))} ${esc(nomeTipo(est, i.tipo).toLowerCase())}`).join(' · ')}</div></div>
    <div class="lado">${badge(m.avaliar(r).status)}</div></a>`).join('');
}
export const combinacao = {
  render(ctx) {
    const { est } = ctx;
    return `${topo('Combinação', { sub: 'Drinks que levam todos os ingredientes escolhidos', voltar: '#/descobrir' })}
    <div class="chips quebra">${est.ui.combinacao.map(t => `<button class="chip" aria-pressed="true" data-acao="comb-tirar" data-valor="${esc(t)}">${esc(nomeTipo(est, t))}<span class="x">×</span></button>`).join('')}</div>
    <div class="lista">${resultadosComb(est)}</div>
    <div class="busca-baixo"><div data-parcial="sugestoes">${sugestoesComb(est)}</div>
      <label class="campo">${icone('mais')}<input type="search" data-input="buscaComb" placeholder="Adicionar ingrediente (whisky, vermute…)" value="${esc(est.ui.buscaComb)}" autocomplete="off"></label></div>`;
  },
  parciais: { sugestoes: ctx => sugestoesComb(ctx.est) },
  inputs: { buscaComb: (el, ctx) => { ctx.est.ui.buscaComb = el.value; ctx.parcial(); } },
  acoes: {
    'comb-add': (el, ctx) => { ctx.est.ui.combinacao.push(el.dataset.valor); ctx.est.ui.buscaComb = ''; ctx.est.avisar(); },
    'comb-tirar': (el, ctx) => { ctx.est.ui.combinacao = ctx.est.ui.combinacao.filter(t => t !== el.dataset.valor); ctx.est.avisar(); },
  },
};

// ---------- Minhas Receitas ----------
export const minhas = {
  render(ctx) {
    const { est } = ctx, m = est.motor(), aba = est.ui.abaMinhas;
    const regs = Object.values(est.registros);
    let corpo = '';
    if (aba === 'favoritos') {
      const favs = regs.filter(r => r.favorito).map(r => est.base.receitaPorId[r.id]).filter(Boolean).sort((a, b) => a.nome.localeCompare(b.nome));
      corpo = favs.map(r => itemReceita(est, r, m.avaliar(r))).join('') || vazio('Nenhum favorito ainda', 'Toque em "Favoritar" na ficha de um drink.');
    } else if (aba === 'historico') {
      const hist = regs.flatMap(r => (r.historico ?? []).map(h => ({ ...h, id: r.id }))).sort((a, b) => b.em.localeCompare(a.em)).slice(0, 60);
      corpo = hist.map(h => { const r = est.base.receitaPorId[h.id]; if (!r) return '';
        return itemReceita(est, r, null, `${new Date(h.em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}${h.porcoes > 1 ? ` · ${h.porcoes} porções` : ''}`); }).join('')
        || vazio('Nada no histórico', 'Na ficha de um drink, toque em "Já fiz".');
    } else corpo = vazio('Receitas autorais chegam na fase 5', 'Criar, editar e duplicar receitas (inclusive a partir de um clássico), com foto e notas.');
    return `${topo('Minhas Receitas')}
    ${seg([['favoritos', 'Favoritos'], ['historico', 'Já fiz'], ['autorais', 'Autorais']], aba, 'aba-minhas')}
    <div class="lista">${corpo}</div>`;
  },
  acoes: { 'aba-minhas': (el, ctx) => { ctx.est.ui.abaMinhas = el.dataset.valor; ctx.est.avisar(); } },
};

// ---------- Ajustes ----------
const CANDIDATOS_BASICOS = ['gelo', 'agua', 'acucar', 'sal', 'xarope_simples', 'tonica', 'agua_com_gas', 'refrigerante_cola', 'ginger_beer', 'ginger_ale', 'refrigerante_limao'];
export const ajustes = {
  render(ctx) {
    const { est } = ctx, b = new Set(est.prefs.basicosSempre);
    return `${topo('Ajustes', { voltar: '#/bar' })}
    <section class="secao" style="margin-top:0"><h2>Medidas</h2>${seg([['ml', 'Mililitros (ml)'], ['oz', 'Onças (oz)']], est.prefs.unidade, 'unidade')}</section>
    <section class="secao"><h2>Posso fazer</h2><div class="bloco">
      <div class="linha-opcao"><div class="t">Contar substituições<small>Ex.: rye no lugar de bourbon, com uma nota do que muda</small></div>${chave(est.prefs.contarSubstituicoes, 'contar-subs', '', 'Contar substituições')}</div>
      <div class="linha-opcao"><div class="t">Só com o que tenho exatamente<small>Também fica na folha de filtros</small></div>${chave(est.prefs.soExato, 'so-exato', '', 'Só exato')}</div></div></section>
    <section class="secao"><h2>Sempre tenho em casa</h2><div class="bloco">${CANDIDATOS_BASICOS.map(id =>
      `<div class="linha-opcao"><div class="t">${esc(nomeTipo(est, id))}</div>${chave(b.has(id), 'basico', id, nomeTipo(est, id))}</div>`).join('')}</div></section>
    <section class="secao"><h2>Sobre</h2><p class="texto">App ${esc(ctx.versaoApp)} · base ${esc(est.meta.baseVersion)} (${est.base.drinks.length} receitas, ${est.base.garrafas.length} garrafas)<br>
      Seus dados ficam só neste aparelho. Backup em arquivo chega na fase 5.</p>
      <button class="btn largo" data-acao="buscar-atualizacao">Procurar atualização</button></section>`;
  },
  acoes: {
    unidade: (el, ctx) => ctx.est.setPref('unidade', el.dataset.valor),
    'contar-subs': (el, ctx) => ctx.est.setPref('contarSubstituicoes', !ctx.est.prefs.contarSubstituicoes),
    'so-exato': (el, ctx) => ctx.est.setPref('soExato', !ctx.est.prefs.soExato),
    basico(el, ctx) {
      const b = new Set(ctx.est.prefs.basicosSempre), id = el.dataset.valor;
      b.has(id) ? b.delete(id) : b.add(id);
      ctx.est.setPref('basicosSempre', [...b]);
    },
    async 'buscar-atualizacao'(el, ctx) {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (!reg) return ctx.aviso('Sem service worker ativo (modo de desenvolvimento?).');
      await reg.update().catch(() => {});
      ctx.aviso(reg.waiting || reg.installing ? 'Nova versão baixando…' : 'Você já está na versão mais nova.');
    },
  },
};
