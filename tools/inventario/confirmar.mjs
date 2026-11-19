// Aplica a confirmação do Bruno (2026-11-18) sobre identificacao.json → confirmado.json
// Define o id definitivo, o tipo da base e as marcas de inventário (coleção, nível, perfil pendente).
// uso: node tools/inventario/confirmar.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const ident = JSON.parse(readFileSync('research/inventario/identificacao.json', 'utf8'));
const tipos = new Set(JSON.parse(readFileSync('site/data/tipos.json', 'utf8')).map(t => t.id));

// número da revisão → [id definitivo, tipo sugerido, extras]
const M = {
  1: ['brennivin_aquavit_2023', 'aquavit'], 2: ['redwood_empire_lost_monarch', 'whiskey_americano'],
  3: ['johnnie_walker_red_label', 'scotch_blended', { nivel: 'fim' }], 4: ['union_barrel_aged', 'whisky_brasileiro', { nivel: 'fim' }],
  5: ['cachaca_fernanda_raul', 'cachaca', { perfilPendente: true, obsBruno: 'lembrança de casamento, fabricante desconhecido' }],
  6: ['lena_jambu', 'cachaca_jambu'], 7: ['dom_tapparo_extra_premium', 'cachaca_envelhecida'], 8: ['tie_prata', 'cachaca_prata'],
  9: ['hendricks', 'gin_contemporaneo'], 10: ['empress_1908_indigo', 'gin_contemporaneo'], 11: ['bosque_craft_gin', 'gin_contemporaneo'],
  12: ['chase_gb_extra_dry', 'gin_london_dry'], 13: ['sipsmith_london_dry', 'gin_london_dry'], 14: ['yvy_gin_terra', 'gin_contemporaneo'],
  15: ['yvy_gin_mar', 'gin_contemporaneo'], 16: ['jameson', 'irish_whiskey'], 17: ['mezcal_union_uno', 'mezcal'],
  18: ['madre_mezcal_espadin', 'mezcal'], 19: ['pisco_tres_erres_especial', 'pisco_chileno'], 20: ['pisco_1615_italia_mosto_verde', 'pisco_peruano'],
  21: ['yvy_rum', 'rum'], 22: ['rittenhouse_rye_bib', 'rye_whiskey'], 23: ['sotol_la_higuera', 'sotol'], 24: ['herradura_reposado', 'tequila_reposado'],
  25: ['belvedere', 'vodka'], 26: ['whisky_ye_monks', 'scotch_blended', { colecao: true }],
  27: ['nikka_from_the_barrel', 'whisky_japones'], 28: ['nikka_coffey_grain', 'whisky_japones'], 29: ['kanosuke_single_malt', 'whisky_japones'],
  30: ['komagatake_peated_sherry', 'whisky_japones'], 31: ['bizantino_licor_ervas', 'licor_ervas'], 32: ['reykjavik_blueberry', 'licor_frutas_vermelhas'],
  33: ['limoncino_bottega', 'limoncello'], 34: ['villa_massa_limoncello', 'limoncello'], 35: ['soberbo_vermouth', 'vermute'],
  36: ['vermute_fernanda_raul', 'vermute', { perfilPendente: true, obsBruno: 'lembrança de casamento, fabricante desconhecido' }],
  37: ['ataman_original', 'vermute'], 38: ['mulassano_bianco', 'vermute_bianco'], 39: ['la_fuerza_blanco', 'vermute_bianco'],
  40: ['la_fuerza_primavera', 'vermute'], 41: ['la_fuerza_sideral', 'vermute'], 42: ['dolores_rojo', 'vermute_rosso'],
  43: ['orlandoni_rosso', 'vermute_rosso'], 44: ['vincenzo_rosso', 'vermute_rosso'], 45: ['cantieri_navali_rosso', 'vermute_rosso'],
  46: ['vecino_rosso_torino', 'vermute_rosso'], 47: ['dos_deus_origins', 'vermute_rosso'], 48: ['federal_rosso', 'vermute_rosso'],
  49: ['cinzano_1757_rosso', 'vermute_rosso'], 50: ['carpano_antica_formula', 'vermute_rosso'], 51: ['cocchi_storico', 'vermute_rosso'],
  52: ['schluck_rosso_amburana', 'vermute_rosso'], 53: ['vermu_coffea_arabica', 'vermute_rosso'], 54: ['la_fuerza_sideral_barrica_unica', 'vermute'],
  55: ['brigs_porto_rose', 'porto_rose'], 56: ['ferreira_porto_ruby', 'porto_ruby'], 57: ['san_basile_artichoke', 'amaro_alcachofra'],
  58: ['cynar', 'amaro_alcachofra'], 59: ['apothek_scarlatti', 'amaro_medio', { nivel: 'fim' }], 60: ['bizantina_artichoke_menta', 'amaro_alcachofra'],
  61: ['aperol', 'aperitivo_laranja', { nivel: 'fim' }], 62: ['campari', 'bitter_aperitivo_vermelho'], 63: ['san_basile_bitter', 'bitter_aperitivo_vermelho'],
  64: ['fernet_branca', 'fernet'], 65: ['angostura_aromatic', 'bitters_aromatico'], 66: ['bittermens_elemakule_tiki', 'bitters_especiado'],
  67: ['bittermens_xocolatl_mole', 'bitters_cacau'], 68: ['angostura_orange', 'bitters_laranja'], 69: ['bittermens_hellfire_habanero', 'bitters_picante'],
  70: ['nielsen_massey_extrato_limao', 'extrato_limao'], 71: ['noguchi_cup_laranja', 'saque'], 72: ['karatsu_hikiyama_cup', 'saque'],
  73: ['kinkyo_cup', 'saque'], 74: ['sogen_seishu', 'saque'], 75: ['noguchi_cup_azul', 'saque'], 76: ['waka_ebis_honjozo', 'saque_honjozo'],
  77: ['eshikoto_junmai_daiginjo', 'saque_daiginjo'], 78: ['atagonomatsu_tokubetsu_junmai', 'saque_junmai'],
};

const nivelDe = n => ({ cheia: 'cheia', lacrada: 'cheia', '3/4': 'cheia', metade: 'metade', '1/4': 'fim', quase_vazia: 'fim' }[n] ?? null);
const ids = new Set();
const out = ident.map((g, i) => {
  const [id, tipo, x = {}] = M[i + 1];
  if (!tipos.has(tipo)) throw new Error(`tipo desconhecido ${tipo} (#${i + 1})`);
  if (ids.has(id)) throw new Error(`id repetido ${id}`);
  ids.add(id);
  return {
    n: i + 1, id, tipoSugerido: tipo,
    rotulo: g.rotulo, marca: g.marca, expressao: g.expressao, categoriaLida: g.categoria, tipoLido: g.tipo,
    abvLido: g.abv, volumeMl: g.volume_ml, paisLido: g.pais, duvidas: g.duvidas, obs: g.obs,
    fotoPrincipal: g.fotoPrincipal, bbox: g.bbox, fotos: g.fotos.map(f => f.arquivo),
    inventario: { status: 'tenho', nivel: x.nivel ?? nivelDe(g.nivel), lacrada: g.nivel === 'lacrada', ...(x.colecao && { colecao: true }) },
    perfilPendente: !!x.perfilPendente, ...(x.obsBruno && { obsBruno: x.obsBruno }),
  };
});
if (out.length !== Object.keys(M).length) throw new Error('contagem diferente');
writeFileSync('research/inventario/confirmado.json', JSON.stringify(out, null, 2));
console.log(`${out.length} garrafas confirmadas`);
