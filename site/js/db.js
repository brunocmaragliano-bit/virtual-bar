// IndexedDB "virtualbar": só dados do usuário (CLAUDE.md §6). A base nunca escreve aqui, exceto o seed na 1ª abertura.
const NOME = 'virtualbar';
export const VERSAO_USUARIO = 1;
const STORES = { inventario: 'id', garrafasUsuario: 'id', receitasUsuario: 'id', registros: 'id', fotos: 'id', prefs: 'chave' };

export function abrir() {
  return new Promise((ok, erro) => {
    const req = indexedDB.open(NOME, VERSAO_USUARIO);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [nome, chave] of Object.entries(STORES)) if (!db.objectStoreNames.contains(nome)) db.createObjectStore(nome, { keyPath: chave });
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
}

const tx = (db, store, modo, fn) => new Promise((ok, erro) => {
  const t = db.transaction(store, modo);
  const res = fn(t.objectStore(store));
  t.oncomplete = () => ok(res?.result ?? res);
  t.onerror = () => erro(t.error);
});

export const todos = (db, store) => new Promise((ok, erro) => {
  const req = db.transaction(store).objectStore(store).getAll();
  req.onsuccess = () => ok(req.result);
  req.onerror = () => erro(req.error);
});
export const salvar = (db, store, obj) => tx(db, store, 'readwrite', s => s.put(obj));
export const salvarVarios = (db, store, objs) => tx(db, store, 'readwrite', s => { for (const o of objs) s.put(o); });
export const apagar = (db, store, id) => tx(db, store, 'readwrite', s => s.delete(id));

export async function pedirPersistencia() {
  try { return await navigator.storage?.persist?.(); } catch { return false; }
}
