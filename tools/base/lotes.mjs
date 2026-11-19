// Lotes de pesquisa de receitas (D14): validar numa base paralela, gerar amostra para o Bruno e só então consolidar.
//
//   node tools/base/lotes.mjs preparar 01 02 …   → research/lotes/_staging/data = site/data + lotes; roda calcular, validar e checagens
//   node tools/base/lotes.mjs amostra 01 02 …    → research/lotes/amostra.html (lista completa + fichas sorteadas por lote)
//   node tools/base/lotes.mjs consolidar 01 02 … → copia o resultado para site/data (só depois do ok do Bruno)
//
// Cada lote: research/lotes/NN/{lote.json, receitas.json, tipos-propostos.json, notas.md, correcoes.json?}
//   lote.json: { "descricao": "...", "destino": "iba-unforgettables.json" }   (destino em site/data/receitas/)
//   correcoes.json (opcional, feitas por mim na revisão): { "trocarTipo": { "proposto": "existente" },
//                                                          "tipos": [{ "id", "set": {...}, "tirarSinonimos": [...] }],
//                                                          "receitas": [{ "id", "set": {...} }], "excluir": ["id"] }
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { estimar, VERSAO } from './calcular.mjs';
import { escreverMeta } from './meta.mjs';
import { criarMotor } from './motor.mjs';

const [, , cmd, ...lotes] = process.argv;
const STG = 'research/lotes/_staging', STG_DATA = join(STG, 'data');
const ler = p => JSON.parse(readFileSync(p, 'utf8'));
const lerLote = nn => {
  const d = `research/lotes/${nn}`;
  return { nn, d, lote: ler(join(d, 'lote.json')), receitas: ler(join(d, 'receitas.json')),
    tipos: existsSync(join(d, 'tipos-propostos.json')) ? ler(join(d, 'tipos-propostos.json')) : [],
    correcoes: existsSync(join(d, 'correcoes.json')) ? ler(join(d, 'correcoes.json')) : {} };
};
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
if (!lotes.length) { console.error('informe os lotes, ex.: preparar 01 02'); process.exit(1); }

function preparar() {
  rmSync(STG, { recursive: true, force: true });
  mkdirSync(STG, { recursive: true });
  cpSync('site/data', STG_DATA, { recursive: true });
  const tipos = ler(join(STG_DATA, 'tipos.json'));
  const relatorio = [];
  const existentes = readdirSync(join(STG_DATA, 'receitas')).flatMap(f => ler(join(STG_DATA, 'receitas', f)).map(r => ({ ...r, _arq: f })));
  for (const L of lotes.map(lerLote)) {
    // tipos propostos (trocarTipo unifica um tipo proposto com outro já existente, em todas as receitas do lote)
    const troca = L.correcoes.trocarTipo ?? {};
    L.tipos = L.tipos.filter(t => !troca[t.id]);
    for (const r of L.receitas) {
      for (const i of r.ingredientes) if (troca[i.tipo]) i.tipo = troca[i.tipo];
      for (const g of r.guarnicao ?? []) if (troca[g.tipo]) g.tipo = troca[g.tipo];
    }
    for (const [de, para] of Object.entries(troca)) relatorio.push(`lote ${L.nn}: tipo ${de} → ${para}`);
    for (const t of L.tipos) {
      const ja = tipos.find(x => x.id === t.id);
      if (ja) relatorio.push(`lote ${L.nn}: tipo ${t.id} já existe — mantido o da base`);
      else { tipos.push(t); relatorio.push(`lote ${L.nn}: tipo novo ${t.id}`); }
    }
    for (const c of L.correcoes.tipos ?? []) {
      const t = tipos.find(x => x.id === c.id);
      if (!t) { relatorio.push(`lote ${L.nn}: correção para tipo inexistente ${c.id}`); continue; }
      Object.assign(t, c.set ?? {});
      if (c.tirarSinonimos) t.sinonimos = t.sinonimos.filter(s => !c.tirarSinonimos.includes(s));
      relatorio.push(`lote ${L.nn}: correção em ${c.id} ${JSON.stringify(c.set ?? {})}${c.tirarSinonimos ? ` −sinônimos ${c.tirarSinonimos.join(', ')}` : ''}`);
    }
    // receitas
    let rs = L.receitas.filter(r => !(L.correcoes.excluir ?? []).includes(r.id));
    for (const c of L.correcoes.receitas ?? []) { const r = rs.find(x => x.id === c.id); if (r) Object.assign(r, c.set); }
    const dup = [];
    rs = rs.filter(r => {
      const igual = existentes.find(e => e.id === r.id || norm(e.nome) === norm(r.nome));
      if (igual) { dup.push(`${r.id} (já em ${igual._arq})`); return false; }
      existentes.push({ ...r, _arq: L.lote.destino });
      return true;
    });
    if (dup.length) relatorio.push(`lote ${L.nn}: duplicadas descartadas: ${dup.join(', ')}`);
    const destino = join(STG_DATA, 'receitas', L.lote.destino);
    const atual = existsSync(destino) ? ler(destino) : [];
    writeFileSync(destino, JSON.stringify([...atual, ...rs], null, 2) + '\n');
    relatorio.push(`lote ${L.nn}: ${rs.length} receitas → receitas/${L.lote.destino}`);
  }
  writeFileSync(join(STG_DATA, 'tipos.json'), '[\n' + tipos.map(t => '  ' + JSON.stringify(t)).join(',\n') + '\n]\n');
  // ABV/volume estimados
  const tipoPorId = Object.fromEntries(tipos.map(t => [t.id, t]));
  for (const f of readdirSync(join(STG_DATA, 'receitas'))) {
    const rs = ler(join(STG_DATA, 'receitas', f));
    for (const r of rs) if (r.tipoReceita === 'drink') Object.assign(r, estimar(r, tipoPorId), { estimativa: VERSAO });
    writeFileSync(join(STG_DATA, 'receitas', f), JSON.stringify(rs, null, 2) + '\n');
  }
  escreverMeta(STG_DATA);
  // quase-duplicadas: mesmo conjunto de ingredientes e quantidades
  const todas = readdirSync(join(STG_DATA, 'receitas')).flatMap(f => ler(join(STG_DATA, 'receitas', f)));
  const assin = new Map();
  for (const r of todas) {
    const a = r.ingredientes.map(i => `${i.tipo}:${i.ml ?? i.qtd ?? i.unidade}`).sort().join('|');
    if (assin.has(a)) relatorio.push(`⚠ mesma spec: ${assin.get(a)} e ${r.id}`); else assin.set(a, r.id);
  }
  console.log(relatorio.join('\n'));
  console.log('\n--- validador ---');
  try { console.log(execFileSync('node', ['tools/validar.mjs', STG_DATA, 'site'], { encoding: 'utf8' }).split('\n').filter(l => !l.startsWith('⚠ melhorUso') || true).slice(-12).join('\n')); }
  catch (e) { console.log(e.stdout); console.log('VALIDAÇÃO FALHOU'); process.exit(1); }
  const seed = ler(join(STG_DATA, 'seed/meu-bar.json'));
  const m = criarMotor({ tipos, garrafas: ler(join(STG_DATA, 'garrafas.json')), substituicoes: ler(join(STG_DATA, 'substituicoes.json')),
    inventario: seed.inventario, basicosSempre: seed.prefs.basicosSempre });
  const drinks = todas.filter(r => r.tipoReceita === 'drink');
  const st = drinks.map(r => m.avaliar(r).status);
  console.log(`\ncom o seed: ${st.filter(s => s === 'pronto').length} prontos, ${st.filter(s => s === 'com_ajuste').length} com ajuste, ${st.filter(s => s === 'falta_1').length} falta 1, de ${drinks.length} drinks`);
}

function consolidar() {
  if (!existsSync(STG_DATA)) { console.error('rode "preparar" antes'); process.exit(1); }
  cpSync(join(STG_DATA, 'tipos.json'), 'site/data/tipos.json');
  for (const f of readdirSync(join(STG_DATA, 'receitas'))) cpSync(join(STG_DATA, 'receitas', f), join('site/data/receitas', f));
  const meta = escreverMeta('site/data');
  writeFileSync('research/lotes/consolidados.md', (existsSync('research/lotes/consolidados.md') ? readFileSync('research/lotes/consolidados.md', 'utf8') : '# Lotes consolidados\n\n')
    + `- ${new Date().toISOString().slice(0, 10)}: lotes ${lotes.join(', ')} → base com ${meta.contagens.receitas} drinks e ${meta.contagens.preparos} preparos\n`);
  console.log(`consolidado: ${JSON.stringify(meta.contagens)}`);
}

if (cmd === 'preparar') preparar();
else if (cmd === 'consolidar') consolidar();
else if (cmd === 'amostra') (await import('./amostra-lotes.mjs')).gerar(lotes);
else { console.error('comando: preparar | amostra | consolidar'); process.exit(1); }
