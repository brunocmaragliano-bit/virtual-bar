# Instruções de pesquisa — receitas (clássicos, preparos e, na fase 4, bares)

Método usado para preencher `site/data/receitas/`. Contexto: `CLAUDE.md` (regras §1, taxonomia §4, schema §5.6, D27).
Exemplo real e válido do formato: `site/data/receitas/classicos.json` (10 receitas da fase 1) e `site/data/receitas/preparos.json`.

## Regras inegociáveis
1. **Nunca invente proporção.** Cada spec vem de uma fonte publicada que você abriu de verdade. Sem spec confiável, a receita
   **não entra**: registre em `notas.md` do lote o motivo.
2. **Fonte e confiança.** `fontes: [{ url, titulo, acessadoEm }]` e `confianca`:
   - `spec_publicada`: IBA (clássicos oficiais) ou o próprio bar/bartender criador;
   - `adaptacao_publicada`: fonte secundária confiável (Difford's Guide, Punch, Imbibe, Liquor.com, livro de referência, PDT, Death & Co);
   - `reconstrucao`: reconstrução publicada por terceiro identificado. Reconstrução sua nunca entra.
   Para clássicos fora da IBA, prefira a versão mais canônica e cite a fonte; se as fontes divergem muito, escolha uma e diga qual em `notas.md`.
3. **`specFonte`**: a spec como publicada, só a lista de quantidades e ingredientes (ex.: "2 oz rye, 3/4 oz sweet vermouth, 2 dashes Angostura").
4. **Texto próprio em português.** `passos` (3 a 6 frases curtas) com suas palavras. Não traduza o texto da fonte nem copie descrições.
5. **Quantidades** (D8 e D27): 1 cl = 10 ml; **1 oz = 30 ml**; ¾ oz = 22,5; ½ oz = 15; ¼ oz = 7,5. Dash → `{qtd, unidade:"dash"}`;
   colher de bar → `"bsp"`; gotas → `"gota"`; folhas → `"folha"`; unidade inteira (cubo de açúcar, ovo) → `"un"`; fatia/gomo → `"fatia"`.
   Completar o copo → `unidade:"top"` (sem qtd). "A splash" → `"splash"`. "Few dashes / a little" sem número → `"um_pouco"`.
   Faixa publicada ("3–4 oz") → use o mínimo e ponha a faixa em `nota`. Nunca transforme "alguns" em número.
6. **Tipos de ingrediente**: só ids de `site/data/tipos.json`. Use o mais genérico que a spec permite ("gin" se qualquer gin serve;
   "gin_london_dry" se a fonte pede London Dry; "whiskey_americano" se diz "bourbon or rye"; "suco_limao_taiti" para lime juice,
   "suco_limao_siciliano" para lemon juice). Marca citada na fonte (ex.: "Cointreau") vira o tipo (`licor_laranja`) com `nota`.
   Se faltar um tipo de verdade, **não force**: proponha em `tipos-propostos.json` do lote (mesmo formato de tipos.json, id novo em snake_case)
   e use esse id na receita.
7. **Guarnição** vai em `guarnicao` (`essencial: true` só quando o drink não existe sem ela, ex.: azeitona/twist não; hortelã do julep é
   ingrediente). Ingredientes "optional" na fonte → `opcional: true`.
8. **Vocabulários fixos** (CLAUDE.md §4): família, técnica, copo, gelo, papel, ocasiões. Perfil do drink pronto nos 10 eixos
   (inteiros 0–5, âncoras em `site/data/eixos.json`). `dificuldade` 1 (montar/mexer) · 2 (batido, dry shake, poucos preparos) · 3 (preparos, técnica fina).
   `cor`: hex aproximado do drink pronto. Não preencha `abv` nem `volumeFinalMl` (uma ferramenta calcula).
9. **ids**: snake_case ascii do nome (`vieux_carre`, `pina_colada`, `dark_n_stormy`). Use estes ids quando o drink for um destes:
   `martini` (Dry Martini), `aperol_spritz` (Spritz/Spritz Veneziano), `negroni_sbagliato`, `whiskey_sour`, `pisco_sour`, `mai_tai`,
   `french_75`, `tom_collins`, `gimlet`, `daiquiri`, `margarita`, `caipirinha`, `paloma`, `penicillin`, `sazerac`, `last_word`, `bramble`,
   `vieux_carre`, `rob_roy`, `mezcal_negroni`, `white_negroni`, `rosita`, `bamboo`, `adonis`, `milano_torino`, `black_manhattan`,
   `bitter_giuseppe`, `cin_cyn`, `sake_martini`, `mizuwari`.
   **Já estão na base** (não refaça): negroni, americano, manhattan, old_fashioned, hanky_panky, boulevardier, toronto, rabo_de_galo,
   gin_tonica, highball_whisky, xarope_simples_1_1.
10. `iba`: nome da lista IBA ("Unforgettables", "Contemporary Classics", "New Era") ou null. `variacaoDe`: id da receita-mãe se for
    variação conhecida (ex.: `boulevardier` → `negroni`). `origem`: só o que as fontes sustentam (`classico: true` para clássicos).

## Preparos (sub-receitas)
`tipoReceita: "preparo"`, `produz` (id do tipo), `rendimentoMl` (pode ser estimado: marque `rendimentoEstimado: true`),
`tempoMin`, `validadeDias` (da fonte; se ela não disser, use um valor conservador e diga em `notas.md`), `rapido` (true só se fica
pronto em ≤ 10 min sem infusão nem resfriamento longo). Medidas de sólidos em volume (xícara = 240 ml) ou peso em `nota`.
Técnica: use `batido` (agitar em pote) ou `mexido` (dissolver mexendo) conforme o método.

## Saída do lote (pasta `research/lotes/NN/`)
- `receitas.json`: array no formato de `site/data/receitas/classicos.json`;
- `tipos-propostos.json`: array (pode ser `[]`);
- `notas.md`: o que ficou de fora e por quê, divergências entre fontes, dúvidas.
Valide o JSON: `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <arquivo>`.

## Economia de busca
A cota de busca na web é compartilhada. Prefira abrir URLs previsíveis com fetch antes de buscar:
`https://iba-world.com/iba-cocktail/<slug>/`, `https://punchdrink.com/recipes/<slug>/`, `https://www.liquor.com/recipes/<slug>/`,
`https://imbibemagazine.com/recipe/<slug>/`. Use a busca só quando a URL previsível falhar.
