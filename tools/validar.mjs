// Valida a base de conhecimento (site/data) contra o schema do CLAUDE.md §5 e confere integridade referencial.
// uso: node tools/validar.mjs [pasta_data=site/data]   → sai com código 1 se houver erro.
// Avisos (⚠) não bloqueiam: ex.: melhorUso apontando para receita que ainda não está na base.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA = process.argv[2] ?? 'site/data';
const SITE = process.argv[3] ?? join(DATA, '..');   // raiz do site, para conferir fotos (base paralela usa "site")
const erros = [], avisos = [];
const erro = (onde, msg) => erros.push(`${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`${onde}: ${msg}`);
const ler = arq => JSON.parse(readFileSync(join(DATA, arq), 'utf8'));

const EIXOS = ['doce', 'acido', 'amargo', 'seco', 'herbal', 'frutado', 'defumado', 'picante', 'cremoso', 'umami'];
const GRUPOS_CAT = ['garrafas', 'frescos', 'despensa', 'basicos'];
const UNIDADES = ['ml', 'dash', 'gota', 'bsp', 'un', 'folha', 'fatia', 'pitada', 'top', 'splash', 'um_pouco'];
const SEM_QTD = ['top', 'splash', 'um_pouco'];
const PAPEIS = ['base', 'modificador', 'adocante', 'acido', 'amargo', 'tempero', 'diluidor', 'espuma', 'lavagem'];
const TECNICAS = ['batido', 'mexido', 'montado', 'batido_seco', 'macerado', 'blender', 'swizzle', 'throw', 'whip'];
const COPOS = ['coupe', 'nick_nora', 'martini', 'rocks', 'dof', 'highball', 'collins', 'julep_cup', 'tiki_mug', 'taca_vinho', 'flauta', 'caneca_cobre', 'caneca_quente', 'shot'];
const GELOS = ['nenhum', 'cubos', 'cubo_grande', 'picado', 'bloco'];
const OCASIOES = ['aperitivo', 'digestivo', 'verao', 'festa', 'brunch', 'noite', 'sobremesa', 'inverno'];
const CONFIANCAS = ['spec_publicada', 'adaptacao_publicada', 'reconstrucao'];
const REGRAS = ['trocar_mesmo_grupo', 'split_base', 'trocar_por_docura'];
const ID = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/\S+$/;

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isStr = v => typeof v === 'string' && v.trim().length > 0;
function perfil(onde, p) {
  if (!p || typeof p !== 'object') return erro(onde, 'perfil ausente');
  const ks = Object.keys(p);
  if (ks.length !== 10 || EIXOS.some(e => !(e in p))) erro(onde, `perfil precisa dos 10 eixos (tem: ${ks.join(',')})`);
  for (const e of EIXOS) if (!Number.isInteger(p[e]) || p[e] < 0 || p[e] > 5) erro(onde, `perfil.${e} deve ser inteiro 0–5 (é ${p[e]})`);
}
function unicos(onde, lista) {
  const vistos = new Set();
  for (const x of lista) {
    if (!isStr(x.id) || !ID.test(x.id)) erro(onde, `id inválido "${x.id}"`);
    if (vistos.has(x.id)) erro(onde, `id repetido "${x.id}"`);
    vistos.add(x.id);
  }
  return vistos;
}

// ---------- eixos, categorias, famílias ----------
const eixos = ler('eixos.json');
if (eixos.map(e => e.id).join() !== EIXOS.join()) erro('eixos.json', 'eixos fora da ordem/conjunto fixo');

const categorias = ler('categorias.json');
const idsCat = unicos('categorias.json', categorias);
for (const c of categorias) if (!GRUPOS_CAT.includes(c.grupo)) erro(`categorias.json#${c.id}`, `grupo inválido ${c.grupo}`);

const familias = ler('familias.json');
const idsFam = unicos('familias.json', familias);
for (const f of familias) for (const s of f.slots ?? []) {
  if (!PAPEIS.includes(s.papel)) erro(`familias.json#${f.id}`, `papel inválido ${s.papel}`);
  for (const r of s.regras ?? []) if (!REGRAS.includes(r)) erro(`familias.json#${f.id}`, `regra inválida ${r}`);
}

// ---------- tipos ----------
const tipos = ler('tipos.json');
const idsTipo = unicos('tipos.json', tipos);
const tipoPorId = Object.fromEntries(tipos.map(t => [t.id, t]));
for (const t of tipos) {
  const o = `tipos.json#${t.id}`;
  if (!isStr(t.nome)) erro(o, 'nome ausente');
  if (!idsCat.has(t.categoria)) erro(o, `categoria inexistente ${t.categoria}`);
  if (t.pai !== null && !idsTipo.has(t.pai)) erro(o, `pai inexistente ${t.pai}`);
  if (!isNum(t.abvTipico) || t.abvTipico < 0 || t.abvTipico > 100) erro(o, 'abvTipico inválido');
  perfil(o, t.perfilTipico);
  if (!UNIDADES.includes(t.unidade)) erro(o, `unidade inválida ${t.unidade}`);
  if (!Array.isArray(t.gruposTroca)) erro(o, 'gruposTroca deve ser lista');
  if (t.derivadoDe && !idsTipo.has(t.derivadoDe)) erro(o, `derivadoDe inexistente ${t.derivadoDe}`);
  if (t.docura !== undefined && (!isNum(t.docura) || t.docura < 0)) erro(o, 'docura inválida');
  // ciclo na árvore
  let p = t.pai, passos = 0;
  while (p && passos++ < 20) p = tipoPorId[p]?.pai;
  if (passos >= 20) erro(o, 'ciclo na árvore de tipos');
}

// ---------- substituições ----------
for (const [i, s] of ler('substituicoes.json').entries()) {
  const o = `substituicoes.json[${i}] ${s.de}→${s.para}`;
  if (!idsTipo.has(s.de)) erro(o, `de inexistente`);
  if (!idsTipo.has(s.para)) erro(o, `para inexistente`);
  if (![1, 2, 3].includes(s.qualidade)) erro(o, 'qualidade deve ser 1, 2 ou 3');
  if (typeof s.bidirecional !== 'boolean') erro(o, 'bidirecional deve ser booleano');
  if (!isStr(s.nota)) erro(o, 'nota ausente');
  for (const a of s.ajuste ?? []) if (!idsTipo.has(a.tipo)) erro(o, `ajuste com tipo inexistente ${a.tipo}`);
  for (const f of s.somenteFamilias ?? []) if (!idsFam.has(f)) erro(o, `família inexistente ${f}`);
}

// ---------- receitas (drinks e preparos) ----------
const dirRec = join(DATA, 'receitas');
const receitas = existsSync(dirRec)
  ? readdirSync(dirRec).filter(f => f.endsWith('.json')).flatMap(f => ler(join('receitas', f)).map(r => ({ ...r, _arq: f }))) : [];
const idsRec = unicos('receitas/*.json', receitas);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const nomes = new Map();
for (const r of receitas) {
  const o = `receitas/${r._arq}#${r.id}`;
  const n = norm(r.nome ?? '');
  if (nomes.has(n)) erro(o, `nome duplicado com ${nomes.get(n)}`); else nomes.set(n, r.id);
  if (!isStr(r.nome)) erro(o, 'nome ausente');
  if (!['drink', 'preparo'].includes(r.tipoReceita)) erro(o, 'tipoReceita deve ser drink ou preparo');
  if (r.tipoReceita === 'drink' && !idsFam.has(r.familia)) erro(o, `família inexistente ${r.familia}`);
  if (!Array.isArray(r.ingredientes) || !r.ingredientes.length) erro(o, 'sem ingredientes');
  for (const [k, ing] of (r.ingredientes ?? []).entries()) {
    const oi = `${o}.ingredientes[${k}]`;
    if (!idsTipo.has(ing.tipo)) erro(oi, `tipo inexistente ${ing.tipo}`);
    if (!PAPEIS.includes(ing.papel)) erro(oi, `papel inválido ${ing.papel}`);
    const temMl = ing.ml !== undefined, temQtd = ing.qtd !== undefined || SEM_QTD.includes(ing.unidade);
    if (temMl === temQtd) erro(oi, 'use ml OU (qtd + unidade) OU unidade sem quantidade (top, splash, um_pouco)');
    if (temMl && (!isNum(ing.ml) || ing.ml <= 0)) erro(oi, 'ml inválido');
    if (temQtd && !UNIDADES.includes(ing.unidade)) erro(oi, `unidade inválida ${ing.unidade}`);
    if (ing.qtd !== undefined && (!isNum(ing.qtd) || ing.qtd <= 0)) erro(oi, 'qtd inválida');
  }
  if (!TECNICAS.includes(r.tecnica)) erro(o, `técnica inválida ${r.tecnica}`);
  if (r.tipoReceita === 'drink') {
    if (!COPOS.includes(r.copo)) erro(o, `copo inválido ${r.copo}`);
    if (!GELOS.includes(r.gelo)) erro(o, `gelo inválido ${r.gelo}`);
    perfil(o, r.perfil);
    if (!isNum(r.abv) || r.abv < 0 || r.abv > 60) erro(o, 'abv ausente ou fora de 0–60 (rode tools/base/calcular.mjs)');
    if (!isNum(r.volumeFinalMl)) erro(o, 'volumeFinalMl ausente (rode tools/base/calcular.mjs)');
    if (![1, 2, 3].includes(r.dificuldade)) erro(o, 'dificuldade deve ser 1, 2 ou 3');
    if (r.porcoesBase !== undefined && (!Number.isInteger(r.porcoesBase) || r.porcoesBase < 1)) erro(o, 'porcoesBase deve ser inteiro ≥ 1');
    for (const oc of r.ocasioes ?? []) if (!OCASIOES.includes(oc)) erro(o, `ocasião inválida ${oc}`);
    if (!/^#[0-9a-fA-F]{6}$/.test(r.cor ?? '')) erro(o, 'cor deve ser #rrggbb');
  } else {
    if (!idsTipo.has(r.produz)) erro(o, `produz tipo inexistente ${r.produz}`);
    for (const c of ['rendimentoMl', 'tempoMin', 'validadeDias']) if (!isNum(r[c])) erro(o, `${c} ausente`);
    if (typeof r.rapido !== 'boolean') erro(o, 'rapido deve ser booleano');
  }
  for (const g of r.guarnicao ?? []) {
    if (!isStr(g.texto)) erro(o, 'guarnição sem texto');
    if (g.tipo && !idsTipo.has(g.tipo)) erro(o, `guarnição com tipo inexistente ${g.tipo}`);
  }
  if (!Array.isArray(r.passos) || !r.passos.length || !r.passos.every(isStr)) erro(o, 'passos ausentes');
  if (!Array.isArray(r.fontes) || !r.fontes.length) erro(o, 'toda receita precisa de fonte');
  for (const f of r.fontes ?? []) if (!URL_RE.test(f.url ?? '')) erro(o, `fonte sem URL válida`);
  if (!CONFIANCAS.includes(r.confianca)) erro(o, `confiança inválida ${r.confianca}`);
  if (r.variacaoDe && !idsRec.has(r.variacaoDe)) aviso(o, `variacaoDe aponta para receita fora da base: ${r.variacaoDe}`);
}
for (const t of tipos) if (t.preparo && !receitas.some(r => r.id === t.preparo && r.tipoReceita === 'preparo'))
  aviso(`tipos.json#${t.id}`, `preparo ${t.preparo} ainda não está na base`);

// ---------- garrafas ----------
const garrafas = existsSync(join(DATA, 'garrafas.json')) ? ler('garrafas.json') : [];
const idsGarrafa = unicos('garrafas.json', garrafas);
for (const g of garrafas) {
  const o = `garrafas.json#${g.id}`;
  if (!isStr(g.rotulo)) erro(o, 'rotulo ausente');
  if (!idsTipo.has(g.tipo)) erro(o, `tipo inexistente ${g.tipo}`);
  if (g.abv !== null && (!isNum(g.abv) || g.abv < 0 || g.abv > 100)) erro(o, 'abv inválido');
  if (g.abv === null) aviso(o, 'abv desconhecido');
  perfil(o, g.perfil);
  if (!isStr(g.notas)) erro(o, 'notas ausentes');
  if (!['pesquisado', 'pendente'].includes(g.perfilStatus)) erro(o, 'perfilStatus inválido');
  if (g.perfilStatus === 'pesquisado' && !(g.fontes ?? []).length) erro(o, 'perfil pesquisado sem fonte');
  for (const f of g.fontes ?? []) if (!URL_RE.test(f)) erro(o, `fonte inválida ${f}`);
  for (const m of g.melhorUso ?? []) {
    const [kind, alvo] = (m.alvo ?? '').split(':');
    if (kind === 'familia') { if (!idsFam.has(alvo)) erro(o, `melhorUso família inexistente ${alvo}`); }
    else if (kind === 'receita') { if (!idsRec.has(alvo)) aviso(o, `melhorUso receita ainda fora da base: ${alvo}`); }
    else erro(o, `melhorUso alvo inválido ${m.alvo}`);
    if (![3, 4, 5].includes(m.nota)) erro(o, `melhorUso nota deve ser 3–5 (${m.alvo})`);
    if (!isStr(m.frase) || m.frase.length > 180) erro(o, `melhorUso frase ausente ou longa demais (${m.alvo})`);
  }
  for (const s of g.serveComo ?? []) {
    if (!idsTipo.has(s.tipo)) erro(o, `serveComo tipo inexistente ${s.tipo}`);
    if (![1, 2, 3].includes(s.qualidade)) erro(o, 'serveComo qualidade deve ser 1–3');
  }
  if (g.foto && !existsSync(join(SITE, g.foto))) erro(o, `foto não encontrada ${g.foto}`);
}

// ---------- seed ----------
if (existsSync(join(DATA, 'seed', 'meu-bar.json'))) {
  const seed = ler(join('seed', 'meu-bar.json'));
  for (const it of seed.inventario ?? []) {
    const o = `seed/meu-bar.json#${it.id}`;
    if (!idsGarrafa.has(it.id) && !idsTipo.has(it.id)) erro(o, 'item não é garrafa nem tipo da base');
    if (!['tenho', 'acabou', 'quero'].includes(it.status)) erro(o, `status inválido ${it.status}`);
    if (it.nivel && !['cheia', 'metade', 'fim'].includes(it.nivel)) erro(o, `nível inválido ${it.nivel}`);
  }
  for (const b of seed.prefs?.basicosSempre ?? []) if (!idsTipo.has(b)) erro('seed/meu-bar.json', `básico inexistente ${b}`);
}

// ---------- meta ----------
if (existsSync(join(DATA, 'meta.json'))) {
  const meta = ler('meta.json');
  const real = { tipos: tipos.length, garrafas: garrafas.length,
    receitas: receitas.filter(r => r.tipoReceita === 'drink').length, preparos: receitas.filter(r => r.tipoReceita === 'preparo').length };
  for (const [k, v] of Object.entries(real)) if (meta.contagens?.[k] !== v) erro('meta.json', `contagens.${k} = ${meta.contagens?.[k]}, real = ${v}`);
}

// receitas citadas em melhorUso que ainda não estão na base: agrupa numa linha (é esperado enquanto a base cresce)
const FORA = 'melhorUso receita ainda fora da base: ';
const fora = new Map();
for (const a of avisos.filter(a => a.includes(FORA))) { const id = a.split(FORA)[1]; fora.set(id, (fora.get(id) ?? 0) + 1); }
for (const a of avisos.filter(a => !a.includes(FORA))) console.log(`⚠ ${a}`);
if (fora.size) console.log(`⚠ melhorUso cita ${fora.size} receitas ainda fora da base: ${[...fora].sort((a, b) => b[1] - a[1]).map(([id, n]) => `${id} (${n})`).join(', ')}`);
for (const e of erros) console.log(`✗ ${e}`);
console.log(`\n${erros.length} erro(s), ${avisos.length} aviso(s) — ${tipos.length} tipos, ${garrafas.length} garrafas, ${receitas.length} receitas`);
process.exit(erros.length ? 1 : 0);
