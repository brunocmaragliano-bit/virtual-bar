// Service worker do Virtual Bar: precache de tudo (app + base + imagens) → 100% offline depois da 1ª abertura (D4).
// A versão e a lista de arquivos entre os marcadores são escritas por tools/precache.mjs. Não edite à mão.
// <precache>
const VERSAO = 'fa99fc551b';
const ARQUIVOS = [
  "./",
  "css/app.css",
  "data/categorias.json",
  "data/eixos.json",
  "data/familias.json",
  "data/garrafas.json",
  "data/meta.json",
  "data/receitas/canonicos-gin-vodka-vermute.json",
  "data/receitas/canonicos-rum-agave-cachaca.json",
  "data/receitas/canonicos-whiskey-conhaque-amaro.json",
  "data/receitas/classicos.json",
  "data/receitas/iba-contemporary.json",
  "data/receitas/iba-new-era.json",
  "data/receitas/iba-unforgettables.json",
  "data/receitas/preparos.json",
  "data/seed/meu-bar.json",
  "data/substituicoes.json",
  "data/tipos.json",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "img/garrafas/angostura_aromatic.webp",
  "img/garrafas/angostura_orange.webp",
  "img/garrafas/aperol.webp",
  "img/garrafas/apothek_scarlatti.webp",
  "img/garrafas/atagonomatsu_tokubetsu_junmai.webp",
  "img/garrafas/ataman_original.webp",
  "img/garrafas/belvedere.webp",
  "img/garrafas/bittermens_elemakule_tiki.webp",
  "img/garrafas/bittermens_hellfire_habanero.webp",
  "img/garrafas/bittermens_xocolatl_mole.webp",
  "img/garrafas/bizantina_artichoke_menta.webp",
  "img/garrafas/bizantino_licor_ervas.webp",
  "img/garrafas/bosque_craft_gin.webp",
  "img/garrafas/brennivin_aquavit_2023.webp",
  "img/garrafas/brigs_porto_rose.webp",
  "img/garrafas/cachaca_fernanda_raul.webp",
  "img/garrafas/campari.webp",
  "img/garrafas/cantieri_navali_rosso.webp",
  "img/garrafas/carpano_antica_formula.webp",
  "img/garrafas/chase_gb_extra_dry.webp",
  "img/garrafas/cinzano_1757_rosso.webp",
  "img/garrafas/cocchi_storico.webp",
  "img/garrafas/cynar.webp",
  "img/garrafas/dolores_rojo.webp",
  "img/garrafas/dom_tapparo_extra_premium.webp",
  "img/garrafas/dos_deus_origins.webp",
  "img/garrafas/empress_1908_indigo.webp",
  "img/garrafas/eshikoto_junmai_daiginjo.webp",
  "img/garrafas/federal_rosso.webp",
  "img/garrafas/fernet_branca.webp",
  "img/garrafas/ferreira_porto_ruby.webp",
  "img/garrafas/hendricks.webp",
  "img/garrafas/herradura_reposado.webp",
  "img/garrafas/jameson.webp",
  "img/garrafas/johnnie_walker_red_label.webp",
  "img/garrafas/kanosuke_single_malt.webp",
  "img/garrafas/karatsu_hikiyama_cup.webp",
  "img/garrafas/kinkyo_cup.webp",
  "img/garrafas/komagatake_peated_sherry.webp",
  "img/garrafas/la_fuerza_blanco.webp",
  "img/garrafas/la_fuerza_primavera.webp",
  "img/garrafas/la_fuerza_sideral.webp",
  "img/garrafas/la_fuerza_sideral_barrica_unica.webp",
  "img/garrafas/lena_jambu.webp",
  "img/garrafas/limoncino_bottega.webp",
  "img/garrafas/madre_mezcal_espadin.webp",
  "img/garrafas/mezcal_union_uno.webp",
  "img/garrafas/mulassano_bianco.webp",
  "img/garrafas/nielsen_massey_extrato_limao.webp",
  "img/garrafas/nikka_coffey_grain.webp",
  "img/garrafas/nikka_from_the_barrel.webp",
  "img/garrafas/noguchi_cup_azul.webp",
  "img/garrafas/noguchi_cup_laranja.webp",
  "img/garrafas/orlandoni_rosso.webp",
  "img/garrafas/pisco_1615_italia_mosto_verde.webp",
  "img/garrafas/pisco_tres_erres_especial.webp",
  "img/garrafas/redwood_empire_lost_monarch.webp",
  "img/garrafas/reykjavik_blueberry.webp",
  "img/garrafas/rittenhouse_rye_bib.webp",
  "img/garrafas/san_basile_artichoke.webp",
  "img/garrafas/san_basile_bitter.webp",
  "img/garrafas/schluck_rosso_amburana.webp",
  "img/garrafas/sipsmith_london_dry.webp",
  "img/garrafas/soberbo_vermouth.webp",
  "img/garrafas/sogen_seishu.webp",
  "img/garrafas/sotol_la_higuera.webp",
  "img/garrafas/tie_prata.webp",
  "img/garrafas/union_barrel_aged.webp",
  "img/garrafas/vecino_rosso_torino.webp",
  "img/garrafas/vermu_coffea_arabica.webp",
  "img/garrafas/vermute_fernanda_raul.webp",
  "img/garrafas/villa_massa_limoncello.webp",
  "img/garrafas/vincenzo_rosso.webp",
  "img/garrafas/waka_ebis_honjozo.webp",
  "img/garrafas/whisky_ye_monks.webp",
  "img/garrafas/yvy_gin_mar.webp",
  "img/garrafas/yvy_gin_terra.webp",
  "img/garrafas/yvy_rum.webp",
  "index.html",
  "js/app.js",
  "js/base.js",
  "js/db.js",
  "js/engine/afinidade.js",
  "js/engine/disponibilidade.js",
  "js/engine/eixos.js",
  "js/engine/filtros.js",
  "js/estado.js",
  "js/formato.js",
  "js/icones.js",
  "js/ui/comum.js",
  "js/ui/descobrir.js",
  "js/ui/ficha.js",
  "js/ui/filtros-folha.js",
  "js/ui/garrafa.js",
  "js/ui/ilustracao.js",
  "js/ui/meubar.js",
  "js/ui/outras.js",
  "js/ui/preparo.js",
  "js/ui/receitas.js",
  "manifest.webmanifest",
  "version.json"
];
// </precache>
const CACHE = `virtualbar-${VERSAO}`;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(a => new Request(a, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('virtualbar-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// A página pede para trocar de versão só quando o Bruno toca em "Atualizar" (D5).
self.addEventListener('message', e => { if (e.data?.tipo === 'pular') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const salvo = await cache.match(req, { ignoreSearch: true });
    if (salvo) return salvo;
    if (req.mode === 'navigate') {
      const pagina = (await cache.match('./')) ?? (await cache.match('./index.html'));
      if (pagina) return pagina;
    }
    try {
      return await fetch(req);
    } catch {
      return new Response('Sem conexão e fora do cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
