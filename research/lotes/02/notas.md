# Lote 02 — IBA Contemporary Classics

Pesquisa em 2026-11-19. Lista tirada do próprio site da IBA (`https://iba-world.com/cocktails/all-cocktails/`, 6 páginas,
102 drinks, com o selo de categoria em cada card). São 34 drinks com o selo "Contemporary Classics". O `rabo_de_galo` já está na base,
então ficam **33 receitas**, todas com a página oficial da IBA como fonte da spec (`confianca: spec_publicada`).

Os outros nomes excluídos pelo pedido (negroni, americano, manhattan, old_fashioned, hanky_panky, boulevardier) estão na lista
"Unforgettables" do site, não na Contemporary. Nenhum drink da categoria ficou de fora por falta de spec.

Obs.: o Golden Dream não aparece mais em nenhuma das 6 páginas do site atual.

## Fontes secundárias (só história e origem, nunca a spec)
- Difford's: Bellini (Giuseppe Cipriani, Harry's Bar, Veneza, 1945), Black Russian (Gustave Tops, Metropolitan Hotel, Bruxelas, 1949),
  Hemingway Special (Constantino Ribalaigua Vert, El Floridita, Havana). O Difford's diz que o maraschino e a toranja foram
  acrescentados anos depois por Antonio Meilan. Deixei Ribalaigua como bartender.
- Punch: Cosmopolitan (Toby Cecchini, The Odeon, Nova York, 1988), Irish Coffee (chef Joe Sheridan, restaurante do aeroporto de
  Foynes, 1943), Singapore Sling (Raffles Hotel, Singapura, 1915; criador não citado), Zombie (Donn Beach, Don the Beachcomber's,
  Hollywood, 1934), Pisco Sour (Victor Morris, Peru; a página não dá cidade nem ano), Vesper (1953 = ano do livro *Casino Royale*,
  de Ian Fleming; não é um bar).
- **Mai Tai:** o Punch credita o "Trader Vic's de Los Angeles" e a receita de 1944. A origem mais citada é Oakland, então deixei
  `cidade: null` até conferir com uma segunda fonte. O `bartender: "Trader Vic"` vem da nota de rodapé da própria IBA.
- **Moscow Mule e Piña Colada:** o Punch diz que a origem é disputada. No Moscow Mule, John G. Martin e Jack Morgan, dono do Cock 'n'
  Bull de Hollywood, no início dos anos 1940. Na Piña Colada, o Caribe/Puerto Rican Hilton reivindica 1954, mas a primeira menção
  conhecida (NYT, 1950) fala em Cuba. Deixei a origem em branco e pus a tag `historia_disputada`.
- Sem origem nas fontes abertas (campos `null`): Bloody Mary, Caipirinha, Cardinale, Champagne Cocktail, Corpse Reviver #2, Cuba Libre,
  French 75, French Connection, Garibaldi, Grasshopper, Horse's Neck, Kir, Lemon Drop, Long Island, Margarita, Mimosa, Mint Julep,
  Mojito, Sea Breeze, Sex on the Beach, Tequila Sunrise. Dá para completar numa passada de história depois, sem mexer na spec.

## Quantidades não numéricas (regra 5 / D27)
- **Bloody Mary:** Tabasco, sal de aipo e pimenta "up to taste" → três ingredientes `um_pouco` com nota "a gosto".
- **Champagne Cocktail:** "few drops of Grand Marnier (optional)" → `um_pouco`, `opcional: true`.
- **Piña Colada:** a IBA conta que antes se juntavam "algumas gotas de limão a gosto". Entrou como `suco_limao_taiti` `um_pouco`
  opcional. Ela também aceita 4 fatias de abacaxi fresco no lugar do suco (está na nota do ingrediente).
- **Mojito:** a soda não tem quantidade (um splash antes do gelo e depois completar o copo) → um único `top` com nota.
  **Long Island:** "Top with Cola" → `top`.
- **Colheres de chá (tsp)** → `bsp`, com nota dizendo "colher de chá": Caipirinha (4 de açúcar), Mint Julep (1 de açúcar de
  confeiteiro, 2 de água), Irish Coffee (1 de açúcar, "pelo menos"), Mojito (2 de açúcar), Zombie (1 de granadina).
- **Ramos de hortelã** (Mint Julep 4, Mojito 6) → `qtd` + `un` com nota "ramos". O tipo `hortela` usa `folha` por padrão.
- **Caipirinha:** "1 lime cut into small wedges" → `limao_taiti` 1 `un`.
- **Horse's Neck:** a lista diz "Dash of Angostura (optional)" e o método fala em "dashes". Usei 1 dash, opcional, com nota.
- **Pisco Sour:** a clara entrou como `ovo_clara` 1 `un`. As "few dashes of Amargo bitters" ficaram na **guarnição**, como a IBA lista
  (tipo `bitters_aromatico`, não essencial).
- **Zombie:** o Donn's Mix (15 ml) foi aberto pela proporção que a própria IBA dá (2 partes de toranja : 1 de xarope de canela), ou seja,
  10 ml de `suco_toranja` + 5 ml de `xarope_canela`. É só aritmética, não uma proporção inventada. Os "170 g of cracked ice" estão nos passos.

## Mapeamento de ingredientes (marca ou rótulo da fonte → tipo)
- Cointreau e triple sec → `licor_laranja`. Lillet Blanc → `quinquina_branca`. Campari → `bitter_aperitivo_vermelho`.
  Smirnoff → `vodka`. Maraschino Luxardo → `maraschino`. DOM Bénédictine → `beneditino`. Pernod → `anis`.
  Cherry Sangue Morlacco (Luxardo) → `licor_cereja`. Peach schnapps → `licor_pessego`. Amaretto → `licor_amendoa`.
- Mai Tai: "Amber Jamaican Rum" → `rum_jamaicano`. "Martinique Molasses Rhum" → `rum_envelhecido`, porque a própria IBA avisa
  que não é agricole e não existe um tipo mais próximo.
- Zombie: "Jamaican dark rum" → `rum_jamaicano`. "Gold Puerto Rican rum" → `rum_envelhecido`. "Demerara Rum" → **`rum_demerara` (proposto)**.
- Hemingway Special: a página atual diz só "Rum" → `rum` (genérico), com a nota de que o tradicional é rum branco.
- Pisco Sour: a IBA pede "lemon juice" → `suco_limao_siciliano`, como foi publicado.
- Bellini: "White Peach Puree" → **`pure_pessego` (proposto)**.
- Mimosa: a IBA lista Prosecco (o método fala em "sparkling wine") → `prosecco`.

## Copo, gelo e técnica (decisões a revisar)
- "Cocktail glass" virou `coupe` (como no restante da base). "Large cocktail glass" (Cosmopolitan, Hemingway) virou `martini`.
- Singapore Sling: a IBA diz só "strain into Hurricane glass", sem gelo no copo → `highball` + `gelo: nenhum`, fiel ao texto.
  Muitos bares servem com gelo; vale confirmar.
- Moscow Mule: a IBA não menciona gelo. Usei `cubos` na caneca de cobre, que é o serviço normal de um highball.
- Mai Tai: "shake and pour into a double rocks glass" → `dof` com `cubos` (o gelo do shaker vai junto). A IBA não fala em gelo picado.
- Bloody Mary: mexido e servido em copo baixo **sem** gelo (padrão da IBA). A versão com gelo vai em copo alto e está explicada nos passos.
- Mojito (copo não nomeado) → `highball`. Kir (copo não nomeado) → `taca_vinho`. Pisco Sour ("goblet") → `taca_vinho`.
  Zombie ("tall tumbler") → `collins`.
- Piña Colada e Zombie usam `blender` + `gelo: picado`, porque o gelo vai no liquidificador.

## Famílias discutíveis
- Caipirinha → `sour`, e não `julep_smash`: a estrutura é destilado + cítrico + açúcar, e as variações da IBA (Caipiroska,
  Caipirissima, Caipirão) só trocam a base.
- French 75 → `fizz_collins` (sour alongado com espumante). Singapore Sling → `punch_cobbler`.
- Bellini, Mimosa e Kir → `champagne_cocktail`. O Kir usa vinho branco parado, mas é o mesmo esquema: vinho como base + licor
  modificador.
- Garibaldi: o Campari tem papel `base`, porque a família `highball` troca o slot base.
- Horse's Neck: a espiral de casca de limão está marcada como guarnição **essencial**, porque ela é o que dá nome ao drink. Se preferir que
  não bloqueie o "Posso fazer", basta trocar para `false`.

## Variações citadas pela IBA (não viraram receita)
- White Russian (Black Russian + creme por cima, **sem quantidade**), Kir Royal (Kir com champagne), Caipiroska, Caipirissima,
  Caipirão (Licor Beirão), Bellini → Puccini (tangerina), Rossini (morango), Tintoretto (romã). Nenhuma tem spec própria na
  IBA. Para entrarem, precisam de fonte com proporção.

## Lemon Drop Martini
A página atual da IBA pede **vodka comum** (não citron) e **não menciona borda de açúcar**. Segui a página como está.

## Tipos propostos (`tipos-propostos.json`)
- `pure_pessego`: purê de pêssego, `citrico_suco`, `derivadoDe: "pessego"`. Sugestão: tirar o sinônimo "purê de pêssego" de
  `pessego` em `tipos.json`, para a busca não confundir a fruta com o purê.
- `rum_demerara`: filho de `rum`. Sugestão para `substituicoes.json`: `rum_demerara` ↔ `rum_escuro`, qualidade 2.

## Outros
- `variacaoDe` aponta para `daiquiri` (Hemingway Special) e `martini` (Vesper), que entram em outro lote. O validador avisa até lá.
- Validação feita numa cópia da base com os 2 tipos propostos: 0 erros nas receitas (só as contagens do `meta.json`, que é esperado).
  `abv`/`volumeFinalMl` não foram preenchidos, como mandam as instruções.
