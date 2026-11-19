# Lote 05 — canônicos fora da IBA: gin, vodka, vermutes, xerez, saquê e aperitivos (pesquisa em 2026-11-19)

## Escopo
- A lista de `research/lotes/canonicos.md` tem 50 drinks. **Entraram 48 drinks + 1 preparo** (`infusao_gin_earl_grey`, sub-receita do
  Earl Grey MarTEAni). O preparo está no mesmo `receitas.json`, com `tipoReceita: "preparo"`.
- **Ficaram de fora (2):**
  - `sherry_cobbler`: é IBA (New Era) e já está no lote 03.
  - `aperol_sour`: não tem spec canônica. Punch e Imbibe deram 404. No Difford's só existem versões enviadas por usuários
    (ids 9270, 13238 e 20742), todas diferentes entre si: com ou sem gin, com ou sem clara, com xarope de laranja. Também não há criador
    conhecido. Fica de fora até aparecer uma fonte de referência.
- Nenhum outro drink da lista é IBA. Conferi contra os lotes 01–03 e a base; não há id nem nome repetido.
- `iba: null` em todos. **`confianca: adaptacao_publicada` em todos.** Nenhuma spec foi lida direto do bar ou do bartender criador.
  Quando a Punch credita o criador (Audrey Saunders, Paul Harrington, Stephen Cole, Wayne Collins, William Elliott), ainda é uma fonte secundária.

## Fontes e método (economia de busca)
- **Punch**, por URL previsível (`/recipes/<slug>/`): 34 páginas lidas. Deram 404: gin-and-it, 20th-century (a certa é `twentieth-century`),
  fitzgerald, eastside, cin-cyn, vodka-martini, fifty-fifty-martini, salty-dog, screwdriver, caipiroska, cape-codder, sake-martini,
  coronation-cocktail-no-1, hugo-spritz, improved-holland-gin-cocktail e aperol-sour.
- **Difford's Guide**: os ids das URLs saíram do sitemap público `https://www.diffordsguide.com/sitemap/cocktail.xml`, baixado com curl
  (não gasta cota de busca). Spec, método e história vêm do JSON-LD e do HTML de cada página. Os nomes de marca do Difford's
  (Hayman's, Ketel One, Strucchi, Thomas Henry…) são de patrocínio: virei o tipo genérico (`gin`, `vodka`, `vermute_dry`…), sem nota.
- **Imbibe**: tudo 404, menos `recipe/eastside/`, que existe mas não carrega o texto da receita (página em JS).
- **Busca na web: 1 só** (Aperol Sour).

## Escolhas de spec quando as fontes divergem
| id | spec usada | por quê / alternativa |
|---|---|---|
| gimlet | Punch: 2 oz gin, ¾ lima, ¾ xarope simples | O clássico usa cordial de lima (Rose's). O Difford's tem várias versões (Difford's, Schumann, Baker 1939). Uma variação com `cordial_limao` pode entrar depois, com fonte |
| tom_collins | Punch: gin genérico | O Difford's comenta que o certo seria Old Tom. A Punch pede só "gin" |
| bronx | Difford's: gin, rosso, dry, suco de laranja, orange bitters opcional | A Punch troca o dry por Dolin Blanc e põe limão. A do Difford's é a fórmula clássica (dois vermutes + laranja) |
| harvey_wallbanger | Difford's: highball com Galliano flutuando | A Punch é a versão do Golden Cadillac (NY), batida e servida em taça com borda salgada. É releitura de bar |
| white_russian | Difford's: 60 vodka, 30 licor de café, 30 creme | A Punch é a releitura de Toby Cecchini (licor de nozes, creme com amaretto). Não usei |
| dirty_martini | Difford's | A URL da Punch é um "Dirty Martini Highball" (Fanny Chu). Não usei |
| pimms_cup | Difford's (Classic Pimm's): Pimm's + frutas + limonada inglesa + ginger ale | Na Punch (Pimm's, limão, xarope, Angostura, ginger ale) a lista e o modo de fazer se contradizem (ginger ale × soda), e a própria nota diz que o bitter não é original |
| white_negroni | Punch (Wayne Collins): 1½ gin, ¾ Suze, 1 Lillet Blanc | O Difford's usa partes iguais, com Gentiane du Sommet. Fiquei com a versão atribuída ao criador |
| bitter_giuseppe | Punch (Stephen Cole): ¼ oz limão, 6 dashes Regans' | O Difford's usa 7,5 ml de limão, 3 dashes e a casca espremida no mixing glass |
| earl_grey_marteani | Punch (Audrey Saunders): 1½ gin com chá, ¾ limão, 1 oz xarope simples, 1 clara | O Difford's usa 60 gin + 15 xarope rico e dry shake |
| gin_gin_mule | Punch (Saunders, via *A Proper Drink*) | O Difford's usa licor de gengibre. O original citado por ele usa gengibre fresco amassado (2 oz gin, ½ lima, ¼ xarope, 12 folhas) |
| alaska | Punch (Simonson): 2 Old Tom : 1 Chartreuse amarela, batido | É a proporção de Straub (⅔ : ⅓ jigger), segundo o Difford's |
| negroni_sbagliato | Difford's: 30/30/60 | A Punch diz só "completar". Usei `espumante` genérico porque a Punch aceita qualquer espumante seco e o Bar Basso usa spumante, não prosecco |
| kir_royale | Difford's: 15 ml cassis + 120 ml espumante brut | A Punch pede ¼ oz de cassis e completar com Champagne |
| death_in_the_afternoon | Difford's: 10 ml absinto, 5 ml xarope rico, 135 ml espumante | O original de Hemingway pede 1 jigger de absinto, sem açúcar. A Punch dá ¼–½ oz de absinto e uma dash opcional de xarope |
| obituary | Punch (William Elliott, Maison Premiere): gin, dry vermouth, absinto | O Difford's usa Old Tom e vermute bianco |
| bamboo | Punch, com xarope rico | O texto da Punch diz que a versão do Simó leva xarope de cana, mas a receita lista "rich simple syrup". Segui a lista |
| eastside | Difford's ("Eastside Gimlet"): a versão servida em taça do Milk & Honey, com 15 ml de soda | O original do Libation era long drink, e não achei a spec dele |
| screwdriver, salty_dog, harvey_wallbanger | Difford's, que acrescenta 5 ml de xarope rico e bitters | São os toques do Difford's. O Greyhound veio da Punch (só vodka e toranja, 2:4). No Salty Dog, a spec de Ted Saucier (1962) pede "1 jigger", medida ambígua, então não usei |

## Conversões e leituras (D8/D27)
- 1⅔ oz → 50 ml (Breakfast Martini); 2¾ oz → 82,5 ml (Obituary); 1 colher de chá → 5 ml (Bamboo); 1,25 ml mantido (Improved Holland, ¼ de colher de chá).
- Faixas → mínimo, com nota: Pink Gin 4–6 dashes → 4; Gin Rickey ½–¾ oz → 15 ml.
- "1 egg white" → `ovo_clara` `{qtd 1, un}` (o `calcular.mjs` conta 30 ml). "1 egg" → `ovo` `{1, un}`.
- "6 sprigs of mint" → `hortela` `{6, un}` com nota (não há unidade "ramo"). "1 spoonful marmalade" → `{1, bsp}` com nota.
- "Saline solution or pinch of salt" → `sal` `{1, pitada}` com nota (Fitzgerald, opcional; Salty Dog).
- Salmoura de azeitona → tipo `azeitona` em ml (o tipo já tem o sinônimo "salmoura de azeitona"), em vez de criar um tipo novo.
- Caipiroska: "3/4 lime" → `limao_taiti` `{0.75, un}`, no mesmo formato da Caipirinha do lote 02.
- Pimm's: "2 slice strawberries" → `morango` `{2, fatia}`; limonada inglesa → `refrigerante_limao`.
- **Opcionais omitidos por falta de tipo:** bitters de ginseng (Vodka Martini, Dirty Martini) e bitters de toranja (Salty Dog). Estão no `specFonte`.
- Crème de cacao sem cor na fonte (Twentieth Century) → `licor_cacau_branco`, com nota.

## Origem
- `ano` = ano de criação quando a fonte dá: White Negroni 2001, Gin-Gin Mule 2000, Earl Grey MarTEAni 2000, Breakfast Martini 1996,
  Eastside 2004, Hugo 2005, Bitter Giuseppe 2007, Death in the Afternoon 1935 (livro *So Red the Nose*).
- **`ano` = primeira publicação** (mesmo critério do Toronto), quando a fonte só dá isso: Tom Collins 1876 (Jerry Thomas), Ford 1895 (Kappeler),
  Bijou 1900 (Harry Johnson; há um Bijou de 1895 com Grand Marnier), Fifty-Fifty 1917 (Ensslin), Twentieth Century 1937 (Tarling; criador "C. A. Tuck").
- **Deixei `null` quando as fontes divergem:**
  - Alaska: Straub 1913 ou 1914.
  - Army & Navy: a Punch diz "anos 1930" e o Difford's cita a 1ª aparição em Embury, 1948.
  - Harvey Wallbanger: a Punch credita Donato Antone (Hollywood, anos 1950) e o Difford's conta a lenda do surfista (fim dos anos 1960).
  - Bronx: a Punch credita Johnnie Solan (Waldorf-Astoria) e o Difford's trata como suposição. Ficou só a cidade.
  - Adonis: a Punch diz que o Waldorf-Astoria criou o drink para o musical de 1884, mas o hotel só abriu nos anos 1890. Ficou só a cidade.
  - Dirty Martini: Wondrich liga o drink a John E. O'Connor (Waldorf, 1901, azeitona amassada), mas o primeiro registro de salmoura é de 1930.
  - Earl Grey MarTEAni: a Punch liga o drink ao Pegu Club e o Difford's diz Bemelmans Bar (Carlyle), em 2000. `bar: null`.
  - Negroni Sbagliato: o Difford's diz "fim dos anos 1980" e grafa "Stocchetti". Usei a grafia corrente "Stocchetto". Outras fontes dizem 1972 (não conferi).
- Sem origem conhecida nas fontes: Cin Cyn, Gimlet, Gin Sour, Pink Lady, Greyhound, Screwdriver, Cape Codder, Caipiroska, Sake Martini, Bicicletta, Kir Royale, Improved Holland.

## Família, copo e guarnição
- Famílias discutíveis: Pink Gin e Improved Holland → `old_fashioned`; Alaska → `duo_trio`; Bronx e Bitter Giuseppe → `martini_manhattan`;
  Pegu Club, Jasmine, Twentieth Century e Breakfast Martini → `daisy`; Gin Rickey, Gin-Gin Mule e Pimm's Cup → `highball`;
  Eastside e Earl Grey → `sour`; White Russian → `duo_trio`; Milano-Torino → `negroni` (igual ao Americano).
- `variacaoDe`: martini (Gibson, Fifty-Fifty, Obituary, Vodka Martini, Dirty Martini, Sake Martini); negroni (White Negroni, Cin Cyn,
  Sbagliato); gin_sour (Fitzgerald); pegu_club (Jasmine); greyhound (Salty Dog); screwdriver (Harvey Wallbanger); black_russian (White Russian);
  caipirinha (Caipiroska); kir (Kir Royale).
- `essencial: true` só em dois casos: a cebolinha do Gibson e a borda de sal do Salty Dog (os dois definem o drink).
- White Negroni: a fonte aceita servir em taça (sem gelo) ou em copo baixo com gelo; gravei `rocks`/`cubos` e citei a taça nos passos.

## Preparo `infusao_gin_earl_grey`
- Fonte: Punch (Saunders): 750 ml de gin + 4 colheres de sopa de chá a granel (gravado como 60 ml de volume), 2 h em temperatura ambiente, coar.
- `validadeDias: 180` é um valor conservador meu. A fonte diz que, na geladeira, ele dura indefinidamente.
  `tempoMin: 130` = 2 h + coar. `rendimentoMl: 750` é estimado (coando, perde um pouco). `rapido: false`.
- O Difford's tem um atalho: 120 ml de gin + 1 sachê por 5 min. Esse atalho seria `rapido`, mas precisaria entrar como outro preparo, com essa fonte.

## Tipos propostos (`tipos-propostos.json`)
- `gin_earl_grey` (destilado, `preparo: infusao_gin_earl_grey`). Ficou **sem `pai: gin`** de propósito: com o pai, a garrafa caseira
  passaria a contar como "gin" em qualquer receita. Sugestão para `substituicoes.json`: `gin_earl_grey` ← `gin` (qualidade 1, perde o chá).
- `cha_earl_grey` (cafe_cha), `geleia_laranja` (outros, unidade `bsp`) e `fruit_cup` (licor, ~25%, sinônimos Pimm's).
- ABV e perfis desses tipos são aproximados.
- Reusei o que já existia: `quinquina_branca` (Lillet), `aperitivo_genciana` (Suze), `brandy_maca` (applejack), `licor_sabugueiro` (Hugo),
  `curacao_laranja` (dry curaçao), `genever`, `beneditino`, `galliano`, `refrigerante_limao`.

## Verificação
- `receitas.json` e `tipos-propostos.json` são JSON válidos. Todo `tipo` de ingrediente e de guarnição existe em `site/data/tipos.json`,
  nos `tipos-propostos.json` dos lotes 01–04 ou no deste lote.
- Montei uma base paralela no scratchpad (site/data + lotes 01–05, com ABV pelo `calcular.mjs`) e rodei `tools/validar.mjs`:
  **0 erros no lote 05**. Os únicos erros são as contagens do meta.json, porque não rodei o `escreverMeta`. Não mexi em `_staging`.
- Com o seed, o motor dá 4 prontos (Gin & It, Pink Gin, Cin Cyn, Milano-Torino) e 15 com "falta 1". Quase todos os que faltam pedem
  frescos (limão, laranja), que não estão marcados no seed.
- Com os lotes 01–05 juntos, só 5 receitas citadas em `melhorUso` continuam fora da base: rob_roy, mezcal_negroni, mizuwari,
  black_manhattan e rosita, que são dos lotes 06–07. Antes eram 29.
