// Fumaça das telas: renderiza cada tela para cada receita e garrafa da base, sem navegador, e procura quebras
// (exceção, "undefined", "NaN", "[object"). Usa um IndexedDB falso em memória.
// Base padrão: site/data. Para testar a base paralela dos lotes: VB_DATA=research/lotes/_staging/data npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { criarEstado } from '../site/js/estado.js';
import { descobrir } from '../site/js/ui/descobrir.js';
import { receitas } from '../site/js/ui/receitas.js';
import { ficha } from '../site/js/ui/ficha.js';
import { preparo } from '../site/js/ui/preparo.js';
import { meubar } from '../site/js/ui/meubar.js';
import { garrafa } from '../site/js/ui/garrafa.js';
import { partir, combinacao, minhas, ajustes } from '../site/js/ui/outras.js';
import { renderFolhaFiltros } from '../site/js/ui/filtros-folha.js';

const DATA = process.env.VB_DATA ?? 'site/data';
const ler = a => JSON.parse(readFileSync(join(DATA, a), 'utf8'));

function idbFalso() {
  const stores = new Map();
  const loja = nome => { if (!stores.has(nome)) stores.set(nome, new Map()); return stores.get(nome); };
  const chaveDe = (nome, o) => nome === 'prefs' ? o.chave : o.id;
  return {
    transaction(nome) {
      const t = { oncomplete: null, onerror: null };
      const req = () => { const r = { onsuccess: null, result: undefined }; return r; };
      t.objectStore = () => ({
        getAll() { const r = req(); r.result = [...loja(nome).values()]; queueMicrotask(() => r.onsuccess?.()); return r; },
        put(o) { loja(nome).set(chaveDe(nome, o), structuredClone(o)); queueMicrotask(() => t.oncomplete?.()); return req(); },
        delete(id) { loja(nome).delete(id); queueMicrotask(() => t.oncomplete?.()); return req(); },
      });
      return t;
    },
  };
}

async function montar() {
  const meta = ler('meta.json');
  const bruta = { meta, eixos: ler('eixos.json'), categorias: ler('categorias.json'), tipos: ler('tipos.json'), substituicoes: ler('substituicoes.json'),
    familias: ler('familias.json'), garrafas: ler('garrafas.json'), receitas: meta.arquivos.receitas.flatMap(f => ler(join('receitas', f))), seed: ler('seed/meu-bar.json') };
  return criarEstado(bruta, idbFalso());
}
const ctxDe = (est, params = {}) => ({ est, params: { query: {}, ...params }, versaoApp: 'teste', nav() {}, folha: { abrir() {}, fechar() {} }, aviso() {}, parcial() {}, parcialFolha() {} });
const RUIM = /undefined|NaN|\[object /;
const conferir = (html, onde) => { assert.equal(typeof html, 'string', onde); const m = html.match(RUIM); assert.ok(!m, `${onde}: "${m?.[0]}" no HTML`); };

test('telas gerais renderizam limpas', async () => {
  const est = await montar();
  for (const [nome, tela] of Object.entries({ descobrir, receitas, meubar, partir, combinacao, minhas, ajustes })) conferir(tela.render(ctxDe(est)), nome);
  est.ui.modo = 'falta1'; conferir(descobrir.render(ctxDe(est)), 'descobrir falta1');
  for (const aba of ['frescos', 'quero']) { est.ui.abaBar = aba; conferir(meubar.render(ctxDe(est)), `meubar ${aba}`); }
  est.ui.buscaBar = 'gin'; conferir(meubar.parciais.sugestoes(ctxDe(est)), 'sugestões do bar');
  est.ui.combinacao = ['whisky', 'vermute']; conferir(combinacao.render(ctxDe(est)), 'combinação');
  est.ui.busca = 'mar'; conferir(receitas.parciais.lista(ctxDe(est)), 'busca de receitas');
  conferir(renderFolhaFiltros(ctxDe(est)), 'folha de filtros');
});

test('ficha e modo preparo de todas as receitas, em ml e oz, 1 e 3 porções', async () => {
  const est = await montar();
  for (const r of Object.values(est.base.receitaPorId)) {
    for (const un of ['ml', 'oz']) {
      est.prefs.unidade = un; est.ui.porcoes[r.id] = un === 'oz' ? 3 : 1;
      conferir(ficha.render(ctxDe(est, { id: r.id })), `ficha ${r.id} ${un}`);
      est.ui.prep = { id: r.id, passo: 0, feitos: [] };
      conferir(preparo.render(ctxDe(est, { id: r.id })), `preparo ${r.id}`);
    }
  }
});

test('ficha da garrafa e "partir de" para todas as garrafas', async () => {
  const est = await montar();
  for (const g of est.base.garrafas) {
    conferir(garrafa.render(ctxDe(est, { id: g.id })), `garrafa ${g.id}`);
    conferir(partir.render(ctxDe(est, { id: g.id })), `partir ${g.id}`);
  }
});

test('mudanças de inventário refletem no Posso fazer e persistem', async () => {
  const est = await montar();
  const antes = est.base.drinks.filter(r => est.motor().avaliar(r).possivel).length;
  await est.setInventario('limao_taiti', { status: 'tenho' });
  await est.setInventario('limao_siciliano', { status: 'tenho' });
  const depois = est.base.drinks.filter(r => est.motor().avaliar(r).possivel).length;
  assert.ok(depois >= antes);
  await est.setInventario('campari', { status: 'acabou' });
  assert.equal(est.inventario.campari.status, 'acabou');
  const g = await est.novaGarrafaUsuario('Tanqueray', 'gin_london_dry');
  assert.equal(est.inventario[g.id].status, 'tenho');
  assert.ok(est.motor().disponivel('gin_london_dry').garrafas.includes(g.id));
  conferir(garrafa.render(ctxDe(est, { id: g.id })), 'garrafa do usuário');
});
