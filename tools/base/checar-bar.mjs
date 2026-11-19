// Confere, para cada drink da base, se dá para fazer com o inventário do seed.
// uso: node tools/base/checar-bar.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { criarMotor } from './motor.mjs';

const ler = a => JSON.parse(readFileSync(join('site/data', a), 'utf8'));
const seed = ler('seed/meu-bar.json');
const motor = criarMotor({ tipos: ler('tipos.json'), garrafas: ler('garrafas.json'), substituicoes: ler('substituicoes.json'),
  inventario: seed.inventario, basicosSempre: seed.prefs.basicosSempre });
const drinks = readdirSync('site/data/receitas').filter(f => f.endsWith('.json')).flatMap(f => ler(join('receitas', f)))
  .filter(r => r.tipoReceita === 'drink');

let ok = 0;
for (const r of drinks) {
  const { status, linhas } = motor.avaliar(r);
  if (!status.startsWith('falta')) ok++;
  console.log(`${status.padEnd(10)} ${r.nome}`);
  for (const { i, d } of linhas) console.log(`    ${i.tipo.padEnd(26)} ${d.como}${d.garrafas?.length ? ` (${d.garrafas.length}: ${d.garrafas.slice(0, 4).join(', ')}${d.garrafas.length > 4 ? '…' : ''})` : ''}${d.por ? ` → ${d.por}` : ''}`);
}
console.log(`\n${ok}/${drinks.length} drinks possíveis com o seed`);
// só informativo: com a base grande, nem tudo é possível com o seed
