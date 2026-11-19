// Escreve site/data/meta.json (ou de outra pasta data) com contagens e a lista de arquivos de receitas.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function escreverMeta(dir = 'site/data', { baseVersion, geradoEm } = {}) {
  const ler = a => JSON.parse(readFileSync(join(dir, a), 'utf8'));
  const anterior = existsSync(join(dir, 'meta.json')) ? ler('meta.json') : {};
  const arquivos = readdirSync(join(dir, 'receitas')).filter(f => f.endsWith('.json')).sort();
  const todas = arquivos.flatMap(f => ler(join('receitas', f)));
  const meta = {
    schemaVersion: 1, baseVersion: baseVersion ?? anterior.baseVersion ?? '2026.11.0', geradoEm: geradoEm ?? new Date().toISOString().slice(0, 10),
    arquivos: { receitas: arquivos },
    contagens: { tipos: ler('tipos.json').length, garrafas: ler('garrafas.json').length,
      receitas: todas.filter(r => r.tipoReceita === 'drink').length, preparos: todas.filter(r => r.tipoReceita === 'preparo').length },
  };
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  return meta;
}
