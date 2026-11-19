// Gera os ícones do app (PNG) a partir de um SVG: taça coupe âmbar sobre fundo escuro.
// uso: node tools/icones.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = (pad = 0) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f0f10"/>
  <g transform="translate(256 256) scale(${1 - pad}) translate(-256 -256)">
    <path d="M118 176h276q-4 128-138 136-134-8-138-136z" fill="#e3a857"/>
    <path d="M118 176h276" stroke="#f6dcae" stroke-width="10" stroke-linecap="round"/>
    <path d="M150 206q30 74 106 80" fill="none" stroke="#f6dcae" stroke-opacity=".45" stroke-width="10" stroke-linecap="round"/>
    <rect x="248" y="312" width="16" height="92" rx="6" fill="#e3a857"/>
    <ellipse cx="256" cy="410" rx="74" ry="14" fill="#e3a857"/>
    <circle cx="352" cy="150" r="26" fill="#b5242f"/><path d="M352 124q10-34 44-40" fill="none" stroke="#7a9a3a" stroke-width="8" stroke-linecap="round"/>
  </g></svg>`);

mkdirSync('site/icons', { recursive: true });
const saidas = [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['apple-touch-icon.png', 180, 0], ['icon-maskable-512.png', 512, 0.22]];
for (const [nome, tam, pad] of saidas) await sharp(svg(pad)).resize(tam, tam).png().toFile(`site/icons/${nome}`);
console.log(saidas.map(s => s[0]).join(', '));
