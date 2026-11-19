// Meu Bar: garrafas por categoria, frescos e despensa ("tenho hoje"), lista de compras e cadastro por autocomplete.
import { normalizar } from '../engine/filtros.js';
import { esc, icone, topo, seg, chave, nomeTipo, vazio } from './comum.js';

const GRUPO_DE = est => Object.fromEntries(est.categorias.map(c => [c.id, c.grupo]));
const nivelTxt = { cheia: '', metade: 'metade', fim: 'quase acabando' };
const diasDesde = iso => Math.floor((Date.now() - new Date(iso)) / 86400000);

function linhaGarrafa(est, g) {
  const e = est.inventario[g.id] ?? {}, t = est.base.tipoPorId[g.tipo];
  const meta = [t?.nome, g.abv != null ? `${String(g.abv).replace('.', ',')}%` : null, nivelTxt[e.nivel], e.colecao ? 'coleção' : null, g.perfilStatus === 'pendente' ? 'perfil pendente' : null].filter(Boolean).join(' · ');
  const tem = e.status === 'tenho';
  return `<div class="item ${tem ? '' : 'apagado'}" data-acao="ir" data-valor="#/bar/garrafa/${encodeURIComponent(g.id)}" role="link" tabindex="0">
    ${g.foto ? `<img class="foto" src="${esc(g.foto)}" alt="" loading="lazy">` : `<span class="foto"></span>`}
    <div class="txt"><div class="nome">${esc(g.rotulo)}</div><div class="meta">${esc(meta)}</div></div>
    <div class="lado"><button class="badge ${tem ? 'pronto' : e.status === 'quero' ? 'acc' : ''}" data-acao="alternar" data-valor="${esc(g.id)}">${tem ? 'tenho' : e.status === 'quero' ? 'quero' : 'acabou'}</button></div></div>`;
}

function abaGarrafas(est) {
  const grupo = GRUPO_DE(est);
  const minhas = est.todasGarrafas().filter(g => est.inventario[g.id] && est.inventario[g.id].status !== 'quero');
  const comGarrafa = new Set(minhas.map(g => est.base.tipoPorId[g.tipo]?.categoria));
  return est.categorias.filter(c => grupo[c.id] === 'garrafas' || comGarrafa.has(c.id)).map(c => {
    const gs = minhas.filter(g => est.base.tipoPorId[g.tipo]?.categoria === c.id)
      .sort((a, b) => (est.inventario[a.id].status === 'tenho' ? 0 : 1) - (est.inventario[b.id].status === 'tenho' ? 0 : 1) || a.rotulo.localeCompare(b.rotulo));
    return gs.length ? `<h3 class="grupo-titulo">${esc(c.nome)} · ${gs.filter(g => est.inventario[g.id].status === 'tenho').length}</h3><div class="lista">${gs.map(g => linhaGarrafa(est, g)).join('')}</div>` : '';
  }).join('');
}

function abaFrescos(est) {
  const grupo = GRUPO_DE(est), vencidos = new Set(est.vencidos()), basicos = new Set(est.prefs.basicosSempre);
  return est.categorias.filter(c => ['frescos', 'despensa', 'basicos'].includes(grupo[c.id])).map(c => {
    const ts = est.base.tipos.filter(t => t.categoria === c.id && !t.derivadoDe).sort((a, b) => a.nome.localeCompare(b.nome));
    if (!ts.length) return '';
    return `<h3 class="grupo-titulo">${esc(c.nome)}</h3><div class="bloco">${ts.map(t => {
      const e = est.inventario[t.id], tem = e?.status === 'tenho';
      const sub = basicos.has(t.id) ? 'sempre tenho (Ajustes)' : tem && e.desde && t.perecivel ? (vencidos.has(t.id) ? `marcado há ${diasDesde(e.desde)} dias · ainda tem?` : `desde ${diasDesde(e.desde) === 0 ? 'hoje' : `há ${diasDesde(e.desde)} dia(s)`}`) : t.preparo ? 'caseiro' : '';
      return `<div class="linha-opcao"><div class="t">${esc(t.nome)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>
        ${basicos.has(t.id) ? '<span class="badge pronto">sempre</span>' : chave(tem, 'fresco', t.id, `Tenho ${t.nome}`)}</div>`;
    }).join('')}</div>`;
  }).join('');
}

function abaQuero(est) {
  const itens = Object.values(est.inventario).filter(e => e.status === 'quero');
  if (!itens.length) return vazio('Lista de compras vazia', 'Na ficha de uma garrafa, marque "quero comprar" para ela aparecer aqui.');
  return `<div class="lista">${itens.map(e => {
    const g = est.garrafa(e.id), nome = g?.rotulo ?? nomeTipo(est, e.id);
    return `<div class="item"><div class="txt"><div class="nome">${esc(nome)}</div><div class="meta">${esc(g ? nomeTipo(est, g.tipo) : 'ingrediente')}</div></div>
      <div class="lado"><button class="btn pequeno" data-acao="comprei" data-valor="${esc(e.id)}">Comprei</button></div></div>`;
  }).join('')}</div>`;
}

function sugestoes(est) {
  const termo = normalizar(est.ui.buscaBar);
  if (termo.length < 2) return '';
  const casa = (...ss) => ss.some(s => normalizar(s).includes(termo));
  const gs = est.todasGarrafas().filter(g => casa(g.rotulo, g.marca)).slice(0, 5);
  const ts = est.base.tipos.filter(t => casa(t.nome, ...(t.sinonimos ?? []))).slice(0, 6);
  const grupo = GRUPO_DE(est);
  const linhas = [
    ...gs.map(g => `<button data-acao="sug-garrafa" data-valor="${esc(g.id)}"><span>${esc(g.rotulo)}</span><span class="s-tipo">${est.inventario[g.id]?.status === 'tenho' ? 'já tem' : 'marcar tenho'}</span></button>`),
    ...ts.map(t => grupo[t.categoria] === 'garrafas'
      ? `<button data-acao="nova-garrafa" data-valor="${esc(t.id)}"><span>Garrafa de ${esc(t.nome.toLowerCase())}: “${esc(est.ui.buscaBar.trim())}”</span><span class="s-tipo">cadastrar</span></button>`
      : `<button data-acao="fresco" data-valor="${esc(t.id)}"><span>${esc(t.nome)}</span><span class="s-tipo">${est.inventario[t.id]?.status === 'tenho' ? 'tirar' : 'tenho hoje'}</span></button>`),
  ];
  if (!gs.length) linhas.push(`<button data-acao="escolher-tipo"><span>Cadastrar “${esc(est.ui.buscaBar.trim())}” como nova garrafa…</span><span class="s-tipo">escolher tipo</span></button>`);
  return `<div class="sugestoes">${linhas.join('')}</div>`;
}

function listaTipos(est) {
  const grupo = GRUPO_DE(est), termo = normalizar(est.ui.buscaTipo ?? '');
  return est.base.tipos.filter(t => grupo[t.categoria] === 'garrafas' && (!termo || [t.nome, ...(t.sinonimos ?? [])].some(s => normalizar(s).includes(termo))))
    .sort((a, b) => a.nome.localeCompare(b.nome)).slice(0, 40)
    .map(t => `<button data-acao="nova-garrafa" data-valor="${esc(t.id)}"><span>${esc(t.nome)}</span><span class="s-tipo">${esc(est.categorias.find(c => c.id === t.categoria)?.nome ?? '')}</span></button>`).join('');
}
function folhaTipo(ctx) {
  const { est } = ctx;
  return `<h2>Que tipo é “${esc(est.ui.buscaBar.trim())}”?</h2>
    <label class="campo">${icone('busca')}<input data-input="buscaTipo" placeholder="gin, bourbon, vermute rosso…" value="${esc(est.ui.buscaTipo ?? '')}" autocomplete="off"></label>
    <div class="sugestoes" style="margin-top:10px" data-parcial-folha="tipos">${listaTipos(est)}</div>
    <p class="texto">O perfil de sabor fica provisório (o do tipo) até a garrafa ser pesquisada.</p>`;
}

export const meubar = {
  render(ctx) {
    const { est, params } = ctx;
    if (params.query.aba) { est.ui.abaBar = params.query.aba; }
    const tem = est.todasGarrafas().filter(g => est.inventario[g.id]?.status === 'tenho').length;
    const quero = Object.values(est.inventario).filter(e => e.status === 'quero').length;
    const aba = est.ui.abaBar;
    return `${topo('Meu Bar', { sub: `${tem} garrafas`, acoes: `<a class="btn-ic" href="#/bar/ajustes" aria-label="Ajustes">${icone('engrenagem')}</a>` })}
    ${seg([['garrafas', 'Garrafas'], ['frescos', 'Frescos e despensa'], ['quero', `Comprar${quero ? ` · ${quero}` : ''}`]], aba, 'aba-bar')}
    ${aba === 'garrafas' ? abaGarrafas(est) : aba === 'frescos' ? abaFrescos(est) : abaQuero(est)}
    <div class="busca-baixo"><div data-parcial="sugestoes">${sugestoes(est)}</div>
      <label class="campo">${icone('mais')}<input type="search" data-input="buscaBar" placeholder="Adicionar garrafa ou ingrediente" value="${esc(est.ui.buscaBar)}" autocomplete="off"></label></div>`;
  },
  parciais: { sugestoes: ctx => sugestoes(ctx.est) },
  inputs: {
    buscaBar: (el, ctx) => { ctx.est.ui.buscaBar = el.value; ctx.parcial(); },
    buscaTipo: (el, ctx) => { ctx.est.ui.buscaTipo = el.value; ctx.parcialFolha({ tipos: c => listaTipos(c.est) }); },
  },
  acoes: {
    'aba-bar': (el, ctx) => { ctx.est.ui.abaBar = el.dataset.valor; if (ctx.params.query.aba) ctx.nav('#/bar'); else ctx.est.avisar(); },
    ir: (el, ctx) => ctx.nav(el.dataset.valor),
    alternar(el, ctx) {
      const e = ctx.est.inventario[el.dataset.valor];
      ctx.est.setInventario(el.dataset.valor, { status: e?.status === 'tenho' ? 'acabou' : 'tenho' });
    },
    fresco(el, ctx) {
      const id = el.dataset.valor, tem = ctx.est.inventario[id]?.status === 'tenho';
      ctx.est.setInventario(id, { status: tem ? 'acabou' : 'tenho', renovar: !tem });
      if (ctx.est.ui.buscaBar) { ctx.est.ui.buscaBar = ''; }
    },
    comprei: (el, ctx) => ctx.est.setInventario(el.dataset.valor, { status: 'tenho', renovar: true }),
    'sug-garrafa'(el, ctx) {
      ctx.est.ui.buscaBar = '';
      ctx.est.setInventario(el.dataset.valor, { status: 'tenho' });
      ctx.aviso(`${ctx.est.garrafa(el.dataset.valor).rotulo}: marcada como "tenho".`);
    },
    'escolher-tipo': (el, ctx) => { ctx.est.ui.buscaTipo = ''; ctx.folha.abrir(folhaTipo); },
    async 'nova-garrafa'(el, ctx) {
      const rotulo = ctx.est.ui.buscaBar.trim() || ctx.est.base.tipoPorId[el.dataset.valor].nome;
      const g = await ctx.est.novaGarrafaUsuario(rotulo, el.dataset.valor);
      ctx.est.ui.buscaBar = '';
      ctx.folha.fechar();
      ctx.nav(`#/bar/garrafa/${encodeURIComponent(g.id)}`);
    },
  },
};
