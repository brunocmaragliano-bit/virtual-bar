// Calcula abv e volumeFinalMl estimados de cada drink em site/data/receitas/*.json (grava no próprio arquivo).
// Fatores de diluição PROVISÓRIOS (v0), a calibrar com referências publicadas na fase 2.
// uso: node tools/base/calcular.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const VERSAO = 'v0';
export const ML_POR_UNIDADE = { dash: 0.8, gota: 0.05, bsp: 4, pitada: 0, folha: 0, fatia: 0, splash: 30, um_pouco: 5 };
export const DILUICAO = { mexido: 0.25, batido: 0.30, batido_seco: 0.35, montado: 0.15, macerado: 0.20,
  swizzle: 0.35, blender: 0.5, throw: 0.25, whip: 0.20 };
const TOP_ML = { highball: 100, collins: 100, taca_vinho: 100, caneca_cobre: 100, rocks: 60, dof: 60, flauta: 60 };
const ML_UN = { acucar: 2, cafe_espresso: 30, ovo: 50, ovo_clara: 30, ovo_gema: 15 };

export function estimar(r, tipoPorId) {
  let vol = 0, alc = 0, temTop = false;
  for (const i of r.ingredientes) {
    let ml = i.ml;
    if (ml === undefined) {
      if (i.unidade === 'top') { ml = TOP_ML[r.copo] ?? 80; temTop = true; }
      else if (i.unidade === 'un') ml = (ML_UN[i.tipo] ?? 0) * i.qtd;
      else ml = (ML_POR_UNIDADE[i.unidade] ?? 0) * (i.qtd ?? 1);
    }
    vol += ml;
    alc += ml * (tipoPorId[i.tipo]?.abvTipico ?? 0) / 100;
  }
  const alongado = temTop || r.ingredientes.some(i => i.papel === 'diluidor' && ['tonica', 'agua_com_gas'].includes(i.tipo));
  const dil = alongado ? 0.10 : (DILUICAO[r.tecnica] ?? 0.2);
  const final = vol * (1 + dil);
  // receitas de lote (ex.: quentão para 6) guardam o volume por porção
  return { abv: Math.round((alc / final) * 100), volumeFinalMl: Math.round(final / (r.porcoesBase ?? 1) / 5) * 5 };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('calcular.mjs')) {
  const tipoPorId = Object.fromEntries(JSON.parse(readFileSync('site/data/tipos.json', 'utf8')).map(t => [t.id, t]));
  const dir = 'site/data/receitas';
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const rs = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const r of rs) if (r.tipoReceita === 'drink') Object.assign(r, estimar(r, tipoPorId), { estimativa: VERSAO });
    writeFileSync(join(dir, f), JSON.stringify(rs, null, 2) + '\n');
    console.log(`${f}: ${rs.filter(r => r.tipoReceita === 'drink').map(r => `${r.id} ${r.abv}% ${r.volumeFinalMl}ml`).join(' · ')}`);
  }
}
