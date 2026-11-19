// Carrega a base de conhecimento (site/data). Offline, o service worker serve tudo do cache.
const ARQS = ['eixos', 'categorias', 'tipos', 'substituicoes', 'familias', 'garrafas'];
const json = async caminho => {
  const r = await fetch(caminho);
  if (!r.ok) throw new Error(`Não consegui abrir ${caminho} (${r.status})`);
  return r.json();
};

export async function carregarBase() {
  const meta = await json('data/meta.json');
  const [eixos, categorias, tipos, substituicoes, familias, garrafas] = await Promise.all(ARQS.map(a => json(`data/${a}.json`)));
  const arquivos = meta.arquivos?.receitas ?? ['classicos.json', 'preparos.json'];
  const receitas = (await Promise.all(arquivos.map(a => json(`data/receitas/${a}`)))).flat();
  const seed = await json('data/seed/meu-bar.json');
  return { meta, eixos, categorias, tipos, substituicoes, familias, garrafas, receitas, seed };
}
