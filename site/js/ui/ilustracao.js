// Ilustração SVG do drink gerada em runtime (D11): copo + cor + gelo + guarnição. Sem arquivo de imagem.
const VIDRO = 'rgba(255,255,255,.55)', VIDRO_FUNDO = 'rgba(255,255,255,.05)';
const HASTE = '<path d="M48.6 0h2.8v38h-2.8z"/><ellipse cx="50" cy="40" rx="17" ry="3.2"/>';

// corpo: contorno do copo; liq: área do líquido; topoLiq: y aproximado da superfície; haste: y onde começa o pé
const COPOS = {
  rocks:   { corpo: 'M22 58h56l-3.5 58q-.4 6-6.5 6H32q-6.1 0-6.5-6z', topoLiq: 72, base: 122 },
  dof:     { corpo: 'M20 54h60l-3.5 62q-.4 6-6.5 6H30q-6.1 0-6.5-6z', topoLiq: 68, base: 122 },
  highball:{ corpo: 'M30 20h40l-2.2 96q-.2 6-6 6H38.2q-5.8 0-6-6z', topoLiq: 36, base: 122 },
  collins: { corpo: 'M33 14h34l-1.8 102q-.2 6-6 6H40.8q-5.8 0-6-6z', topoLiq: 30, base: 122 },
  coupe:   { corpo: 'M16 40h68q-1 32-34 34Q17 72 16 40z', topoLiq: 46, haste: 74 },
  nick_nora:{ corpo: 'M27 30h46q0 40-23 44-23-4-23-44z', topoLiq: 38, haste: 74 },
  martini: { corpo: 'M12 30h76L50 76z', topoLiq: 36, haste: 76 },
  taca_vinho:{ corpo: 'M28 22h44q2 50-22 54-24-4-22-54z', topoLiq: 46, haste: 76 },
  flauta:  { corpo: 'M39 10h22q2 58-11 66-13-8-11-66z', topoLiq: 22, haste: 76 },
  julep_cup:{ corpo: 'M26 44h48l-4 72q-.3 6-6 6H36q-5.7 0-6-6z', topoLiq: 48, base: 122, metal: true },
  tiki_mug:{ corpo: 'M30 30q-6 46 2 92h36q8-46 2-92z', topoLiq: 40, base: 122, opaco: true },
  caneca_cobre:{ corpo: 'M26 48h46l-2 74H28z', topoLiq: 54, base: 122, metal: true, alca: 'M72 62q16 2 14 20t-14 18' },
  caneca_quente:{ corpo: 'M28 40h44l-3 64q-.3 6-6 6H37q-5.7 0-6-6z', topoLiq: 48, base: 110, alca: 'M72 52q15 2 13 18t-14 16' },
  shot:    { corpo: 'M36 80h28l-2.4 38q-.2 4-4 4H42.4q-3.8 0-4-4z', topoLiq: 86, base: 122 },
};
const CORES_GUARNICAO = { laranja: '#f39a2b', limao_siciliano: '#f2d649', limao_taiti: '#7cc243', toranja: '#f07a5a' };
let seq = 0;

function guarnicao(receita, c) {
  const g = (receita.guarnicao ?? []).find(x => x.tipo) ?? (receita.guarnicao ?? [])[0];
  if (!g) return '';
  const t = g.tipo ?? '', txt = (g.texto ?? '').toLowerCase();
  const xRim = c.haste ? 78 : 70, yRim = COPO_TOPO(c) - 4;
  if (CORES_GUARNICAO[t] && /casca|twist|peel|zest/.test(txt))
    return `<path d="M${xRim - 6} ${yRim - 2}q8-10 14-2t-6 10" fill="none" stroke="${CORES_GUARNICAO[t]}" stroke-width="3.2" stroke-linecap="round"/>`;
  if (CORES_GUARNICAO[t])
    return `<g transform="translate(${xRim} ${yRim})"><circle r="10" fill="${CORES_GUARNICAO[t]}"/><circle r="7.6" fill="#fbe6b4" opacity=".55"/>` +
      `<path d="M0-7.6V7.6M-7.6 0H7.6M-5.4-5.4L5.4 5.4M5.4-5.4L-5.4 5.4" stroke="${CORES_GUARNICAO[t]}" stroke-width="1"/></g>`;
  if (t === 'cereja_marasquino') return `<path d="M50 ${c.topoLiq + 4}L62 ${c.topoLiq - 16}" stroke="#c9a46a" stroke-width="1.5"/><circle cx="50" cy="${c.topoLiq + 6}" r="5" fill="#8f1424"/>`;
  if (t === 'azeitona' || t === 'cebola_conserva') return `<path d="M44 ${c.topoLiq + 10}L64 ${c.topoLiq - 14}" stroke="#c9a46a" stroke-width="1.5"/><ellipse cx="48" cy="${c.topoLiq + 6}" rx="5" ry="4" fill="${t === 'azeitona' ? '#8aa43a' : '#efe9dc'}"/>`;
  if (['hortela', 'manjericao', 'alecrim'].includes(t))
    return `<g fill="#4fa34a"><path d="M44 ${c.topoLiq - 2}q-10-14 2-22 6 12-2 22z"/><path d="M52 ${c.topoLiq - 2}q2-16 14-16-2 14-14 16z"/><path d="M48 ${c.topoLiq}q-14-4-16-14 12 0 16 14z"/></g>`;
  if (t === 'noz_moscada' || t === 'canela') return `<g fill="#8a5a2b"><circle cx="44" cy="${c.topoLiq + 2}" r="1.2"/><circle cx="52" cy="${c.topoLiq + 3}" r="1"/><circle cx="57" cy="${c.topoLiq + 1}" r="1.1"/></g>`;
  if (t === 'pepino') return `<g transform="translate(${xRim} ${yRim})"><circle r="9" fill="#5d9b3c"/><circle r="7" fill="#d6ecb0"/></g>`;
  return '';
}
function COPO_TOPO(c) { const m = c.corpo.match(/M[\d.]+ ([\d.]+)/); return Number(m?.[1] ?? 40) + 4; }

function gelo(receita, c, id) {
  const g = receita.gelo;
  if (!g || g === 'nenhum') return '';
  const y0 = c.topoLiq, y1 = (c.base ?? c.haste) - 6;
  const cubo = (x, y, s, rot) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * .18}" transform="rotate(${rot} ${x + s / 2} ${y + s / 2})" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>`;
  let s = '';
  if (g === 'cubo_grande' || g === 'bloco') { const t = Math.min(34, (y1 - y0) * .8); s = cubo(50 - t / 2, y0 + (y1 - y0 - t) / 2 + 2, t, 4); }
  else if (g === 'picado') { for (let i = 0; i < 26; i++) s += `<circle cx="${30 + (i * 37) % 40}" cy="${y0 + 3 + (i * 53) % Math.max(8, y1 - y0 - 4)}" r="${2 + (i % 3)}" fill="rgba(255,255,255,.28)"/>`; }
  else { const t = c.haste ? 12 : 16; const n = Math.max(2, Math.min(5, Math.floor((y1 - y0) / (t + 2)))); for (let i = 0; i < n; i++) s += cubo(i % 2 ? 46 : 36, y0 + 2 + i * (t + 2), t, i % 2 ? 12 : -8); }
  return `<g clip-path="url(#${id})">${s}</g>`;
}

export function ilustracao(receita, classe = 'ilu') {
  const c = COPOS[receita.copo] ?? COPOS.rocks;
  const id = `liq${++seq}`;
  const cor = receita.cor ?? '#c98b3a';
  const pe = c.haste ? `<g fill="${VIDRO}" transform="translate(0 ${c.haste})">${HASTE}</g>` : '';
  const alca = c.alca ? `<path d="${c.alca}" fill="none" stroke="${c.metal ? '#c8794a' : VIDRO}" stroke-width="4"/>` : '';
  const fundoCopo = c.metal ? '#b8693f' : c.opaco ? '#6b4a2b' : VIDRO_FUNDO;
  const liquido = c.metal || c.opaco ? '' : `<rect x="0" y="${c.topoLiq}" width="100" height="130" fill="${cor}" opacity=".92" clip-path="url(#${id})"/>`;
  const brilho = c.metal || c.opaco ? '' : `<path d="${c.corpo}" fill="none" stroke="${VIDRO}" stroke-width="1.6"/>`;
  return `<svg class="${classe}" viewBox="0 0 100 130" role="img" aria-label="${receita.nome}">
    <defs><clipPath id="${id}"><path d="${c.corpo}"/></clipPath></defs>
    ${alca}<path d="${c.corpo}" fill="${fundoCopo}"/>${liquido}${c.metal ? '' : gelo(receita, c, id)}${brilho}${pe}${guarnicao(receita, c)}
  </svg>`;
}
