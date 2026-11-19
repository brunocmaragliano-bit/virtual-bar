// Virtual Bar — entrada do app: rotas por hash, renderização, eventos delegados, folhas, avisos e atualização do SW.
import { carregarBase } from './base.js';
import * as db from './db.js';
import { criarEstado } from './estado.js';
import { preencherIcones } from './icones.js';
import { descobrir } from './ui/descobrir.js';
import { receitas } from './ui/receitas.js';
import { ficha } from './ui/ficha.js';
import { preparo } from './ui/preparo.js';
import { meubar } from './ui/meubar.js';
import { garrafa } from './ui/garrafa.js';
import { partir, combinacao, minhas, ajustes } from './ui/outras.js';

const TELAS = { descobrir, receitas, ficha, preparo, meubar, garrafa, partir, combinacao, minhas, ajustes };
const ROTAS = [
  [/^$|^descobrir$/, 'descobrir', 'descobrir'], [/^receitas$/, 'receitas', 'receitas'], [/^receita\/(.+)$/, 'ficha', 'receitas'],
  [/^preparo\/(.+)$/, 'preparo', null], [/^bar$/, 'meubar', 'bar'], [/^bar\/garrafa\/(.+)$/, 'garrafa', 'bar'], [/^bar\/ajustes$/, 'ajustes', 'bar'],
  [/^partir(?:\/(.+))?$/, 'partir', 'descobrir'], [/^combinacao$/, 'combinacao', 'descobrir'], [/^minhas$/, 'minhas', 'minhas'],
];
const $app = document.getElementById('app'), $folha = document.getElementById('folha'), $veu = document.getElementById('veu'), $aviso = document.getElementById('aviso');
let est, versaoApp = '?', rotaAtual = null, telaAtual = null, folhaRender = null, avisoTimer = 0, passosNoApp = 0;
const scrolls = new Map();

function rotear(hash) {
  const [caminho, qs = ''] = decodeURIComponent(hash.replace(/^#\/?/, '')).split('?');
  for (const [re, tela, aba] of ROTAS) {
    const m = caminho.match(re);
    if (m) return { tela, aba, params: { id: m[1], query: Object.fromEntries(new URLSearchParams(qs)) }, hash };
  }
  return { tela: 'descobrir', aba: 'descobrir', params: { query: {} }, hash };
}

const ctx = () => ({
  est, params: rotaAtual.params, versaoApp,
  nav: h => { location.hash = h; },
  folha: { abrir: abrirFolha, fechar: fecharFolha },
  aviso: mostrarAviso,
  parcial: () => atualizarParciais($app, telaAtual.parciais),
  parcialFolha: mapa => atualizarParciais($folha, mapa, 'data-parcial-folha'),
  acaoGlobal: (nome, el) => descobrir.acoes[nome]?.(el, ctx()),
});

function atualizarParciais(raiz, mapa = {}, attr = 'data-parcial') {
  const c = ctx();
  for (const el of raiz.querySelectorAll(`[${attr}]`)) { const fn = mapa[el.getAttribute(attr)]; if (fn) el.innerHTML = fn(c); }
}

function render(navegou = false) {
  const nova = rotear(location.hash);
  const mudouTela = !rotaAtual || nova.hash !== rotaAtual.hash;
  if (mudouTela && rotaAtual) { scrolls.set(rotaAtual.hash, scrollY); if (telaAtual?.sair && nova.tela !== rotaAtual.tela) telaAtual.sair(ctx()); }
  const entrando = mudouTela && (!rotaAtual || nova.tela !== rotaAtual.tela || nova.params.id !== rotaAtual.params.id);
  rotaAtual = nova; telaAtual = TELAS[nova.tela];
  if (entrando && telaAtual.entrar) telaAtual.entrar(ctx());
  $app.classList.toggle('cheia', !!telaAtual.cheia);
  $app.innerHTML = telaAtual.render(ctx());
  for (const a of document.querySelectorAll('[data-aba]')) a.classList.toggle('ativa', a.dataset.aba === nova.aba);
  if (folhaRender) $folha.innerHTML = folhaRender(ctx());
  if (mudouTela) scrollTo(0, navegou ? (scrolls.get(nova.hash) ?? 0) : 0);
}

function abrirFolha(fn) { folhaRender = fn; $folha.innerHTML = fn(ctx()); $folha.hidden = $veu.hidden = false; }
function fecharFolha() { folhaRender = null; $folha.hidden = $veu.hidden = true; $folha.innerHTML = ''; }

function mostrarAviso(texto, botao = null, fixo = false) {
  clearTimeout(avisoTimer);
  $aviso.innerHTML = `<span>${texto}</span>${botao ? `<button class="btn primario pequeno" data-aviso="1">${botao.rotulo}</button>` : ''}`;
  $aviso.hidden = false;
  if (botao) $aviso.querySelector('[data-aviso]').onclick = botao.acao;
  if (!fixo) avisoTimer = setTimeout(() => { $aviso.hidden = true; }, 2600);
}

// ---------- eventos delegados ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-acao]');
  if (!el || !est) return;
  const nome = el.dataset.acao;
  if (nome === 'voltar') { if (passosNoApp > 0) { e.preventDefault(); history.back(); } return; }
  if (nome === 'fechar-folha') { fecharFolha(); return; }
  const fn = telaAtual?.acoes?.[nome];
  if (!fn) return;
  if (el.tagName === 'A' && nome !== 'terminar') e.preventDefault();
  if (el.getAttribute('aria-disabled') === 'true') return;
  fn(el, ctx(), e);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (el && est) telaAtual?.inputs?.[el.dataset.input]?.(el, ctx());
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[role="link"][data-acao]')) e.target.click();
  if (e.key === 'Escape' && folhaRender) fecharFolha();
});
$veu.addEventListener('click', fecharFolha);
addEventListener('hashchange', () => { passosNoApp++; if (folhaRender) fecharFolha(); render(true); });

// ---------- service worker e atualização (D4, D5) ----------
function avisarAtualizacao(reg) {
  const mostrar = () => mostrarAviso('Nova versão do app pronta.', { rotulo: 'Atualizar', acao: () => reg.waiting?.postMessage({ tipo: 'pular' }) }, true);
  if (document.body.classList.contains('preparo')) addEventListener('hashchange', function uma() { if (!document.body.classList.contains('preparo')) { removeEventListener('hashchange', uma); mostrar(); } });
  else mostrar();
}
async function registrarSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try {
    const reg = await navigator.serviceWorker.register('sw.js');
    if (reg.waiting && navigator.serviceWorker.controller) avisarAtualizacao(reg);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) avisarAtualizacao(reg); });
    });
    // Na 1ª instalação o SW assume a página sem precisar recarregar; só recarrega quando é troca de versão.
    let tinhaControlador = !!navigator.serviceWorker.controller, recarregou = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!tinhaControlador) { tinhaControlador = true; return; }
      if (!recarregou) { recarregou = true; location.reload(); }
    });
  } catch (err) { console.warn('SW não registrado', err); }
}

async function iniciar() {
  preencherIcones();
  try {
    const [bruta, conn, ver] = await Promise.all([carregarBase(), db.abrir(), fetch('version.json').then(r => r.json()).catch(() => ({}))]);
    versaoApp = ver.app ?? '?';
    est = await criarEstado(bruta, conn);
    est.on(() => render());
    db.pedirPersistencia();
    render();
  } catch (err) {
    console.error(err);
    $app.innerHTML = `<div class="vazio"><strong>Não consegui abrir o bar</strong>${String(err.message ?? err)}</div>`;
  }
  registrarSW();
}
iniciar();
