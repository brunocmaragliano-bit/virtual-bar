// Estado do app: base indexada (só leitura) + dados do usuário (IndexedDB). Toda mudança persiste e avisa os ouvintes.
import * as db from './db.js';
import { indexarBase, criarMotor, frescosVencidos } from './engine/disponibilidade.js';
import { filtrosVazios } from './engine/filtros.js';

const BASICOS_PADRAO = ['gelo', 'agua', 'acucar', 'sal', 'xarope_simples', 'tonica', 'agua_com_gas'];

export async function criarEstado(bruta, conn) {
  const base = indexarBase(bruta);
  const [inv, gu, reg, prefsArr] = await Promise.all(['inventario', 'garrafasUsuario', 'registros', 'prefs'].map(s => db.todos(conn, s)));
  const prefs = Object.fromEntries(prefsArr.map(p => [p.chave, p.valor]));

  // Seed: só na primeira abertura, com o inventário vazio (CLAUDE.md §5.7 e §6).
  if (!inv.length && !prefs.seedAplicado) {
    const agora = new Date().toISOString();
    const itens = bruta.seed.inventario.map(i => ({ ...i, atualizadoEm: agora }));
    await db.salvarVarios(conn, 'inventario', itens);
    inv.push(...itens);
    const p = { seedAplicado: agora, basicosSempre: bruta.seed.prefs?.basicosSempre ?? BASICOS_PADRAO, unidade: bruta.seed.prefs?.unidade ?? 'ml' };
    await db.salvarVarios(conn, 'prefs', Object.entries(p).map(([chave, valor]) => ({ chave, valor })));
    Object.assign(prefs, p);
  }

  const ouvintes = new Set();
  let versao = 0, motorCache = null, motorVersao = -1;
  const est = {
    base, meta: bruta.meta, eixos: bruta.eixos, categorias: bruta.categorias, familias: bruta.familias,
    inventario: Object.fromEntries(inv.map(i => [i.id, i])),
    garrafasUsuario: gu,
    registros: Object.fromEntries(reg.map(r => [r.id, r])),
    prefs: { unidade: 'ml', basicosSempre: BASICOS_PADRAO, contarSubstituicoes: true, soExato: false, filtros: filtrosVazios(), ...prefs },
    ui: { modo: 'posso', busca: '', buscaBar: '', abaBar: 'garrafas', abaMinhas: 'favoritos', porcoes: {}, recentes: [], combinacao: [], buscaComb: '', escolhaTipo: null },

    on(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); },
    avisar(parcial = false) { versao++; for (const fn of ouvintes) fn(parcial); },

    motor() {
      if (motorVersao !== versao) {
        motorCache = criarMotor(base, { inventario: est.inventario, garrafasUsuario: est.garrafasUsuario,
          basicosSempre: est.prefs.basicosSempre, contarSubstituicoes: est.prefs.contarSubstituicoes });
        motorVersao = versao;
      }
      return motorCache;
    },
    garrafa(id) { return base.garrafaPorId[id] ?? est.garrafasUsuario.find(g => g.id === id); },
    todasGarrafas() { return [...base.garrafas, ...est.garrafasUsuario]; },
    vencidos() { return frescosVencidos(base, est.inventario); },

    async setInventario(id, patch) {
      const atual = est.inventario[id] ?? { id };
      const novo = { ...atual, ...patch, id, atualizadoEm: new Date().toISOString() };
      if (patch.status === 'tenho' && base.tipoPorId[id]?.perecivel && (!atual.desde || atual.status !== 'tenho' || patch.renovar)) novo.desde = novo.atualizadoEm;
      delete novo.renovar;
      est.inventario[id] = novo;
      est.avisar();
      await db.salvar(conn, 'inventario', novo);
    },
    async setPref(chave, valor) {
      est.prefs[chave] = valor;
      est.avisar();
      await db.salvar(conn, 'prefs', { chave, valor });
    },
    async setRegistro(id, patch) {
      const novo = { ...(est.registros[id] ?? { id, historico: [] }), ...patch, id };
      est.registros[id] = novo;
      est.avisar();
      await db.salvar(conn, 'registros', novo);
    },
    async novaGarrafaUsuario(rotulo, tipoId) {
      const t = base.tipoPorId[tipoId];
      const g = { id: `u:${crypto.randomUUID?.() ?? Date.now().toString(36)}`, rotulo, marca: null, produtor: null, tipo: tipoId,
        abv: t.abvTipico, volumeMl: null, pais: null, composicao: null, perfil: { ...t.perfilTipico },
        notas: 'Cadastrada no app. Perfil provisório do tipo, até a pesquisa da garrafa.', melhorUso: [], fontes: [],
        perfilStatus: 'pendente', confiancaPerfil: 'baixa', criadaEm: new Date().toISOString() };
      est.garrafasUsuario.push(g);
      await db.salvar(conn, 'garrafasUsuario', g);
      await est.setInventario(g.id, { status: 'tenho' });
      return g;
    },
  };
  return est;
}
