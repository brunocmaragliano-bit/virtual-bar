// Testes do motor local (node --test tests/). Usam a base real de site/data e o seed do Bruno.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { indexarBase, criarMotor, frescosVencidos } from '../site/js/engine/disponibilidade.js';
import { aplicar, filtrosVazios, combinacao, buscar, atributos } from '../site/js/engine/filtros.js';
import { afinidade, receitasParaGarrafa, sortear, cosseno } from '../site/js/engine/afinidade.js';
import { quantidade, oz } from '../site/js/formato.js';

const ler = a => JSON.parse(readFileSync(join('site/data', a), 'utf8'));
const receitas = readdirSync('site/data/receitas').filter(f => f.endsWith('.json')).flatMap(f => ler(join('receitas', f)));
const base = indexarBase({ tipos: ler('tipos.json'), garrafas: ler('garrafas.json'), substituicoes: ler('substituicoes.json'), receitas });
const seed = ler('seed/meu-bar.json');
const invSeed = Object.fromEntries(seed.inventario.map(i => [i.id, i]));
const usuarioSeed = { inventario: invSeed, basicosSempre: seed.prefs.basicosSempre };
const R = id => base.receitaPorId[id];

test('as 10 receitas da fase 1 continuam possíveis com o seed', () => {
  const m = criarMotor(base, usuarioSeed);
  for (const id of ['negroni', 'americano', 'manhattan', 'old_fashioned', 'hanky_panky', 'boulevardier', 'toronto', 'rabo_de_galo', 'gin_tonica', 'highball_whisky'])
    assert.equal(m.avaliar(R(id)).status, 'pronto', id);
});

test('herança de tipo: receita que pede "gin" aceita gin contemporâneo', () => {
  const inv = { hendricks: { status: 'tenho' } };
  const m = criarMotor(base, { inventario: inv, basicosSempre: [] });
  const d = m.disponivel('gin');
  assert.equal(d.como, 'exato');
  assert.deepEqual(d.garrafas, ['hendricks']);
  assert.equal(m.disponivel('gin_london_dry').como, 'substituicao'); // London Dry ← contemporâneo (qualidade 2)
});

test('coleção não conta e garrafa "acabou" não conta', () => {
  const m = criarMotor(base, { inventario: { whisky_ye_monks: { status: 'tenho', colecao: true }, johnnie_walker_red_label: { status: 'acabou' } }, basicosSempre: [] });
  assert.equal(m.disponivel('scotch_blended').como, 'falta');
});

test('básico, derivado e substituição desligada', () => {
  const m = criarMotor(base, { inventario: { limao_taiti: { status: 'tenho' }, rittenhouse_rye_bib: { status: 'tenho' } }, basicosSempre: ['acucar'], contarSubstituicoes: false });
  assert.equal(m.disponivel('acucar').como, 'basico');
  assert.equal(m.disponivel('suco_limao_taiti').como, 'exato'); // derivado da fruta
  assert.equal(m.disponivel('bourbon').como, 'falta');           // rye→bourbon só com substituições ligadas
  const m2 = criarMotor(base, { inventario: { rittenhouse_rye_bib: { status: 'tenho' } }, basicosSempre: [] });
  assert.equal(m2.disponivel('bourbon').como, 'serveComo');      // o próprio Rittenhouse declara serveComo bourbon
});

test('preparo rápido conta como ajuste', () => {
  const m = criarMotor(base, { inventario: {}, basicosSempre: ['acucar', 'agua'] });
  assert.equal(m.disponivel('xarope_simples').como, 'preparo');
  const toronto = criarMotor(base, { inventario: { rittenhouse_rye_bib: { status: 'tenho' }, fernet_branca: { status: 'tenho' } }, basicosSempre: ['acucar', 'agua'] }).avaliar(R('toronto'));
  assert.equal(toronto.status, 'com_ajuste');
});

test('falta 1 aponta o ingrediente que falta', () => {
  const m = criarMotor(base, { inventario: { campari: { status: 'tenho' }, cocchi_storico: { status: 'tenho' } }, basicosSempre: [] });
  const a = m.avaliar(R('negroni'));
  assert.equal(a.status, 'falta_1');
  assert.deepEqual(a.faltam, ['gin']);
});

test('frescos vencidos pedem reconfirmação', () => {
  const inv = { hortela: { status: 'tenho', desde: '2026-11-01' }, laranja: { status: 'tenho', desde: '2026-11-15' } };
  assert.deepEqual(frescosVencidos(base, inv, new Date('2026-11-19')), ['hortela']);
});

test('filtros: E entre grupos, sabor é E, família é OU', () => {
  const d = base.drinks;
  const f = { ...filtrosVazios(), familia: ['negroni', 'highball'] };
  const r = aplicar(base, d, f).map(r => r.id);
  assert.ok(r.includes('negroni') && r.includes('gin_tonica') && !r.includes('manhattan'));
  const f2 = { ...filtrosVazios(), sabor: ['amargo', 'doce'] };
  for (const x of aplicar(base, d, f2)) assert.ok(x.perfil.amargo >= 3 && x.perfil.doce >= 3);
  assert.deepEqual(atributos(base, R('manhattan')).bases, ['whisky']);
});

test('combinação com herança nos dois sentidos', () => {
  const ids = combinacao(base, base.drinks, ['whisky', 'vermute']).map(r => r.id);
  assert.ok(ids.includes('manhattan') && ids.includes('boulevardier') && !ids.includes('negroni'));
  assert.ok(combinacao(base, base.drinks, ['bourbon']).some(r => r.id === 'old_fashioned'));
});

test('busca ignora acento e caixa', () => {
  assert.ok(buscar(base.drinks, 'HANKY').some(r => r.id === 'hanky_panky'));
  assert.ok(buscar(base.drinks, 'rabo de galo').some(r => r.id === 'rabo_de_galo'));
});

test('afinidade: Carpano é o melhor rosso do Manhattan pela pesquisa', () => {
  const rossos = base.garrafas.filter(g => g.tipo === 'vermute_rosso');
  const melhor = rossos.map(g => ({ g, p: afinidade(base, g, R('manhattan')).pontos })).sort((a, b) => b.p - a.p)[0].g.id;
  assert.equal(melhor, 'carpano_antica_formula');
  assert.ok(receitasParaGarrafa(base, base.garrafaPorId.fernet_branca, base.drinks).some(x => x.r.id === 'hanky_panky'));
  assert.ok(Math.abs(cosseno({ doce: 1 }, { doce: 3 }) - 1) < 1e-9);
});

test('sorteio evita os recentes quando dá', () => {
  const pool = [{ id: 'a' }, { id: 'b' }];
  for (let i = 0; i < 20; i++) assert.equal(sortear(pool, ['a']).id, 'b');
  assert.equal(sortear(pool, ['a', 'b'], () => 0).id, 'a');
  assert.equal(sortear([], []), null);
});

test('formatação de quantidades', () => {
  assert.equal(oz(30), '1 oz'); assert.equal(oz(22.5), '¾ oz'); assert.equal(oz(45), '1½ oz'); assert.equal(oz(7.5), '¼ oz');
  assert.equal(quantidade({ ml: 30 }, 2), '60 ml');
  assert.equal(quantidade({ ml: 7.5 }, 1), '7,5 ml');
  assert.equal(quantidade({ qtd: 2, unidade: 'dash' }, 2), '4 dashes');
  assert.equal(quantidade({ unidade: 'top' }), 'completar com');
  assert.equal(quantidade({ qtd: 1, unidade: 'bsp' }), '1 colher de bar');
});
