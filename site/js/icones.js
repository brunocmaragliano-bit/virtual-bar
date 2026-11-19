// Ícones em SVG inline (traço), sem dependência externa.
const P = {
  bussola: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  livro: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  garrafa: '<path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 13h8"/>',
  caderno: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  sortear: '<path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 3.6C14.3 15 15.5 16 17.5 16H21"/><path d="M18 13l3 3-3 3"/><path d="M3 16h3.5c1.4 0 2.4-.5 3.2-1.3"/><path d="M14.3 8.3C15.1 7.5 16.1 7 17.5 7H21"/><path d="M18 4l3 3-3 3"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  filtro: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  coracao: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  direita: '<path d="M9 5l7 7-7 7"/>',
  engrenagem: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  combinar: '<circle cx="8.5" cy="12" r="5.5"/><circle cx="15.5" cy="12" r="5.5"/>',
  copo: '<path d="M5 4h14l-7 8z"/><path d="M12 12v8M8 20h8"/>',
  tela: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
};
export function icone(nome, tam = 22) {
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="${nome === 'coracao-cheio' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[nome === 'coracao-cheio' ? 'coracao' : nome] ?? ''}</svg>`;
}
export function preencherIcones(raiz = document) {
  for (const el of raiz.querySelectorAll('[data-icone]')) if (!el.firstChild) el.innerHTML = icone(el.dataset.icone);
}
