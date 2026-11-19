// Modo preparo: tela cheia, fonte grande, ingredientes com check, um passo por vez, tela sempre ligada (D12).
import { quantidade, plural } from '../formato.js';
import { esc, icone, nomeTipo } from './comum.js';

let trava = null, avisoTela = '';
async function travarTela() {
  try {
    if (!('wakeLock' in navigator)) { avisoTela = 'Este aparelho não deixa o app manter a tela ligada. No iPhone, funciona com o app instalado na tela de início (iOS 18.4 ou mais novo).'; return; }
    trava = await navigator.wakeLock.request('screen');
    avisoTela = 'A tela fica ligada enquanto você prepara.';
    trava.addEventListener?.('release', () => { trava = null; });
  } catch { avisoTela = 'Não consegui manter a tela ligada agora (bateria fraca ou permissão do sistema).'; }
}
const aoVoltar = () => { if (document.visibilityState === 'visible' && document.body.classList.contains('preparo') && !trava) travarTela(); };

export const preparo = {
  entrar(ctx) {
    document.body.classList.add('preparo');
    ctx.est.ui.prep = { id: ctx.params.id, passo: 0, feitos: [] };
    document.addEventListener('visibilitychange', aoVoltar);
    travarTela().then(() => ctx.est.avisar());
  },
  sair() {
    document.body.classList.remove('preparo');
    document.removeEventListener('visibilitychange', aoVoltar);
    trava?.release?.(); trava = null;
  },
  cheia: true,
  render(ctx) {
    const { est, params } = ctx, r = est.base.receitaPorId[params.id];
    if (!r) return '<p class="vazio">Receita não encontrada.</p>';
    const p = est.ui.prep ?? { passo: 0, feitos: [] }, base = r.porcoesBase ?? 1, porcoes = est.ui.porcoes[r.id] ?? base;
    const passo = Math.min(p.passo, r.passos.length - 1), ultimo = passo === r.passos.length - 1;
    return `<div class="preparo-topo"><a class="btn-ic" href="#/receita/${esc(r.id)}" aria-label="Sair do modo preparo">${icone('x')}</a>
      <h1>${esc(r.nome)}</h1><span class="texto" style="min-width:44px;text-align:right">${plural(porcoes, 'porção', 'porções')}</span></div>
    <div class="checks">${r.ingredientes.map((ing, i) => `<button class="check" data-acao="check" data-valor="${i}" aria-pressed="${p.feitos.includes(i)}">
      <span class="caixa">${p.feitos.includes(i) ? icone('check', 18) : ''}</span><b>${esc(quantidade(ing, porcoes / base, est.prefs.unidade))}</b><span>${esc(nomeTipo(est, ing.tipo))}</span></button>`).join('')}</div>
    <div class="passo-grande"><div class="num">Passo ${passo + 1} de ${r.passos.length}</div><p>${esc(r.passos[passo])}</p></div>
    ${r.guarnicao?.length ? `<p class="texto" style="margin:12px 4px 0">Guarnição: ${esc(r.guarnicao.map(g => g.texto).join('; '))}</p>` : ''}
    <p class="nota-tela">${icone('tela', 14)} ${esc(avisoTela)}</p>
    <div class="navega"><button class="btn" data-acao="passo" data-valor="-1" ${passo === 0 ? 'aria-disabled="true"' : ''}>Anterior</button>
      ${ultimo ? `<a class="btn primario" href="#/receita/${esc(r.id)}" data-acao="terminar">Pronto ${icone('check')}</a>` : `<button class="btn primario" data-acao="passo" data-valor="1">Próximo</button>`}</div>`;
  },
  acoes: {
    check(el, ctx) {
      const p = ctx.est.ui.prep, i = Number(el.dataset.valor);
      p.feitos = p.feitos.includes(i) ? p.feitos.filter(x => x !== i) : [...p.feitos, i];
      ctx.est.avisar();
    },
    passo(el, ctx) {
      const p = ctx.est.ui.prep, r = ctx.est.base.receitaPorId[ctx.params.id];
      p.passo = Math.min(r.passos.length - 1, Math.max(0, p.passo + Number(el.dataset.valor)));
      ctx.est.avisar();
    },
  },
};
