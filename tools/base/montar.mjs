// Consolida a pesquisa de GARRAFAS na base:
//   research/pesquisa/saida/garrafas-*.json + research/inventario/confirmado.json → site/data/garrafas.json + seed/meu-bar.json
//   e atualiza site/data/meta.json. Divergências vão para research/pesquisa/log-montagem.md.
//   (As 10 receitas da fase 1 já estão em site/data/receitas/classicos.json; receitas novas entram por tools/base/lotes.mjs.)
// uso: node tools/base/montar.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { escreverMeta } from './meta.mjs';

const HOJE = '2026-11-18';
const ler = a => JSON.parse(readFileSync(a, 'utf8'));
const conf = ler('research/inventario/confirmado.json');
const confPorId = Object.fromEntries(conf.map(c => [c.id, c]));
const SAIDA = 'research/pesquisa/saida';
const log = [];

// ---------- garrafas ----------
const pesquisa = readdirSync(SAIDA).filter(f => /^garrafas-.*\.json$/.test(f)).sort().flatMap(f => ler(join(SAIDA, f)));
const pesqPorId = Object.fromEntries(pesquisa.map(p => [p.id, p]));
for (const c of conf) if (!pesqPorId[c.id]) log.push(`- FALTA pesquisa de \`${c.id}\``);
for (const p of pesquisa) if (!confPorId[p.id]) log.push(`- pesquisa com id desconhecido \`${p.id}\``);

const garrafas = conf.filter(c => pesqPorId[c.id]).map(c => {
  const p = pesqPorId[c.id];
  let abv = p.abv ?? null;
  if (c.abvLido != null && !Array.isArray(c.abvLido)) {
    if (abv != null && Math.abs(abv - c.abvLido) > 0.05) log.push(`- \`${c.id}\`: ABV do rótulo ${c.abvLido}% ≠ fonte ${abv}% → fica o do rótulo`);
    abv = c.abvLido;
  }
  if (p.tipo !== c.tipoSugerido) log.push(`- \`${c.id}\`: tipo ${c.tipoSugerido} → ${p.tipo}`);
  if (p.observacoes) log.push(`- \`${c.id}\` (obs. da pesquisa): ${p.observacoes}`);
  return {
    id: c.id, rotulo: p.rotulo, marca: p.marca ?? c.marca, produtor: p.produtor ?? null, tipo: p.tipo,
    abv, volumeMl: p.volumeMl ?? c.volumeMl ?? null, pais: p.pais ?? c.paisLido ?? null, regiao: p.regiao ?? null,
    composicao: p.composicao ?? null, perfil: p.perfil, notas: p.notas,
    melhorUso: p.melhorUso ?? [], ...((p.serveComo ?? []).length && { serveComo: p.serveComo }),
    foto: `img/garrafas/${c.id}.webp`, fotoOrigem: c.fotoPrincipal.replace(/\.jpg$/, '.dng'),
    fontes: p.fontes ?? [], perfilStatus: c.perfilPendente ? 'pendente' : (p.perfilStatus ?? 'pesquisado'),
    confiancaPerfil: p.confiancaPerfil ?? null, revisadoEm: HOJE,
  };
});
writeFileSync('site/data/garrafas.json', JSON.stringify(garrafas, null, 2) + '\n');

// ---------- seed ----------
mkdirSync('site/data/seed', { recursive: true });
const seed = {
  descricao: 'Inventário inicial do Bruno (fotos de 2026-11-08). Aplicado só quando o inventário do aparelho está vazio.',
  inventario: conf.map(c => ({ id: c.id, status: 'tenho', ...(c.inventario.nivel && { nivel: c.inventario.nivel }),
    ...(c.inventario.colecao && { colecao: true }), ...(c.inventario.lacrada && { notas: 'lacrada' }) })),
  prefs: { basicosSempre: ['gelo', 'agua', 'acucar', 'sal', 'xarope_simples', 'tonica', 'agua_com_gas'], unidade: 'ml', porcoes: 1 },
};
writeFileSync('site/data/seed/meu-bar.json', JSON.stringify(seed, null, 2) + '\n');

// ---------- receitas ----------
// Desde a fase 2 as receitas entram SÓ pelos lotes (tools/base/lotes.mjs). Este script não toca mais em site/data/receitas:
// reescrever classicos.json/preparos.json a partir da pesquisa da fase 1 apagaria os preparos dos lotes.
const recs = [];

// ---------- meta (mantém a baseVersion atual) ----------
escreverMeta('site/data');

writeFileSync('research/pesquisa/log-montagem.md', `# Log da montagem da base (${HOJE})\n\n${log.join('\n') || 'sem divergências'}\n`);
console.log(`${garrafas.length} garrafas · ${seed.inventario.length} itens no seed · ${recs.length} receitas · ${log.length} linhas no log`);
