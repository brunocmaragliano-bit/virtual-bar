# Lote 06 — canônicos fora da IBA: whiskey, conhaque, maçã, pisco e amaros (pesquisa em 2026-11-19)

## Escopo e resultado
- Lista-alvo: "Lote 06" de `research/lotes/canonicos.md` (46 drinks). **Entraram 43.** Ficaram de fora 3:
  - `pisco_punch`: é IBA (New Era) e já está no lote 03.
  - `fernet_con_coca`: é o **Fernandito** da IBA (New Era), já no lote 03 (`fernandito`, com "Fernet con coca" em `nomesAlt`).
  - `whiskey_flip`: **sem spec confiável.** Punch e Imbibe não têm página. No Difford's só há uma receita da comunidade
    (marcada como "não testada nem verificada") e a ficha genérica de Flip ("60 ml de destilado"). O resto são sites de receita
    genéricos. Pela regra 3, não entrou. Quem quiser um flip de whiskey hoje usa o `brandy_flip` trocando a base.
- `iba: null` em todas. Nenhuma estava na base nem nos lotes 01–03.
- Validação: JSON ok; todos os tipos existem em `tipos.json`, nos lotes 01–04 ou no `tipos-propostos.json` deste lote.
  Rodei `tools/base/lotes.mjs preparar 01 02 03 04 06` **numa cópia isolada do projeto** (para não mexer em `_staging`):
  validador com **0 erros**.

## Método e fontes
- Fontes abertas de fato: páginas de receita da Punch (lidas pela lista de ingredientes da própria página), Difford's Guide
  (tabela de ingredientes + história), Imbibe (dados estruturados da receita), blog do Jeffrey Morgenthaler, VinePair e Tuxedo No.2.
  Liquor.com não foi usado.
- Busca na web: só 3 consultas (Cynar Flip, Whiskey Flip, Kentucky Mule). O resto saiu de URLs previsíveis da Punch/Imbibe e da
  **busca interna do Difford's**, que não gasta cota: `https://www.diffordsguide.com/cocktails/search?s=1&k=<termo>&g%5Bdg%5D=1`
  (devolve os links `/cocktails/recipe/<id>/<slug>`). Vale para os lotes 05 e 07.
- `passos` são meus; perfis e cores são estimativa minha. `abv`/`volumeFinalMl` ficam para `calcular.mjs`.

| id | fonte da spec | confiança |
|---|---|---|
| rob_roy, blood_and_sand, gold_rush, brown_derby, de_la_louisiane, improved_whiskey_cocktail, hot_toddy, old_pal, kentucky_buck, seelbach, lions_tail, black_manhattan, brooklyn, red_hook, greenpoint, little_italy, mamie_taylor, morning_glory_fizz, japanese_cocktail, brandy_flip, eggnog, rattlesnake, revolver | Punch | adaptacao_publicada |
| ward_eight, scofflaw, fanciulli, monte_carlo, whiskey_smash, mizuwari, godfather, presbyterian, corpse_reviver_1, chilcano, champs_elysees, metropolitan, coffee_cocktail, art_of_choke | Difford's Guide | adaptacao_publicada |
| bobby_burns (DeGroff, *The Essential Cocktail*), jack_rose | Imbibe | adaptacao_publicada |
| amaretto_sour | blog de Jeffrey Morgenthaler (+ Punch) | adaptacao_publicada |
| bourbon_renewal | blog de Jeffrey Morgenthaler (criador) | **spec_publicada** |
| kentucky_mule | VinePair | adaptacao_publicada |
| cynar_flip | Tuxedo No.2, que cita *The Bar Book* (Morgenthaler, 2014) | adaptacao_publicada |

- **Amaretto Sour**: a spec é do Morgenthaler, mas ele não criou o drink (é a versão dele de um clássico), por isso ficou
  `adaptacao_publicada` e `origem` vazia.
- **Fontes mais fracas** (avaliar na revisão): Kentucky Mule (VinePair; o Difford's tem o mesmo drink como "Bourbon Mule":
  50 ml bourbon, 12,5 ml limão, 7,5 ml xarope rico, 75 ml ginger beer) e Cynar Flip (Tuxedo No.2 é um site de receitas, mas cita
  o livro; a receita da comunidade do Difford's, não verificada, bate: 60 ml Cynar, 10 ml de demerara 2:1, ovo e gotas de Angostura).

## Conversões e leituras da spec (D8/D27)
- Colher de chá: Lion's Tail "1 teaspoon simple syrup" → 5 ml; Cynar Flip "2 tsp 2:1 simple syrup" → 10 ml de `xarope_rico`;
  Amaretto Sour "1 tsp/5 ml 2:1" → 5 ml de `xarope_rico`. "1 bar spoon" (Improved Whiskey) → `bsp`.
- Faixas → mínimo, com a faixa na `nota`: Red Hook marasquino ¼–½ oz → 7,5 ml; Hot Toddy água 4–5 oz → 120 ml;
  Kentucky Mule ginger beer 3–4 oz → 90 ml; Morning Glory Fizz absinto 3–4 dashes → 3.
- Solução salina do Difford's (Fanciulli, Scofflaw, Champs-Élysées) → `sal`, 1 `pitada`: o próprio Difford's dá "ou uma pitada de
  sal" como alternativa. No Scofflaw é opcional (como na fonte).
- Champs-Élysées: os 7,5 ml de água gelada viraram `opcional`, porque a fonte manda omitir com gelo molhado.
- Metropolitan: receita de O. H. Byron (1884), citada na página do Difford's: "½ pony brandy, 1 pony French vermouth, 3 dashes
  Angostura, 3 dashes gum syrup" → 15 ml de conhaque, 30 ml de vermute seco (1 pony = 1 oz = 30 ml), 3 dashes de cada.
  Gum syrup → `xarope_simples` com nota.
- "1 egg" → `ovo` 1 `un`; "1 egg white" → `ovo_clara` 1 `un`; "½ oz egg white" → `ovo_clara` 15 ml.
- Kentucky Buck: 1 morango → `morango` 1 `un`; "soda, to top" → `top`. Mizuwari, Presbyterian e Seelbach também usam `top`.
- ⚠ `calcular.mjs` conta `un` (ovo, clara) e `top` do jeito dele; os volumes dos flips e fizzes podem sair distorcidos.

## Tipos escolhidos (onde houve escolha)
- "Scotch, blended" → `scotch_blended`; "Scotch" ou "Scotch (preferably blended)" → `scotch`; "Highland malt scotch" → `scotch_single_malt`.
- "bourbon or rye" → `whiskey_americano` (Improved Whiskey, Hot Toddy). Fanciulli tem split real: 22,5 rye + 22,5 bourbon.
- "Cognac (brandy)" do Difford's e "brandy" → `conhaque`; "cognac" da Punch (Japanese, Eggnog) → `cognac`. Applejack/Calvados → `brandy_maca`.
- Averna → `amaro_medio`; Cynar → `amaro_alcachofra`; Fernet-Branca → `fernet`; Campari → `bitter_aperitivo_vermelho`.
- Punt e Mes (Red Hook) → `vermute_rosso` com nota. Cointreau (Seelbach) → `licor_laranja`. Cherry Heering → `licor_cereja`.
- Allspice dram (Lion's Tail) → `licor_pimenta_jamaica` (proposto no lote 03).
- Amargo Chuncho (Chilcano) e bitter estilo Boker's (Godfather, opcional) → `bitters_aromatico` com nota.
- Half and half (Eggnog) → `creme_leite` com nota (a fonte aceita creme). "Champagne (or a dry sparkling wine)" → `espumante`.
- Xarope de mel 3:1 (Gold Rush) e 2:1 (Brown Derby) → `xarope_mel` com nota; o preparo da base é 1:1, então o drink sai menos
  doce e menos encorpado. Talvez valha um preparo `xarope_mel_3_1`. Xarope de demerara 2:1 (Art of Choke) → `xarope_demerara` com nota.
- Kentucky Buck: o xarope de gengibre do criador é 3 partes de açúcar para 4 de suco de gengibre cru, diferente do preparo cozido
  do lote 04. Mantive `xarope_gengibre` com nota (a fonte também aceita amassar gengibre picado com xarope simples).
- **Mizuwari**: o Difford's usa blended scotch, mas o próprio texto define o drink como "whisky e água" e o costume no Japão é
  whisky japonês. Usei `whisky` genérico, com nota. Se preferir fidelidade estrita à spec, troque por `scotch_blended`.

## Tipo proposto (`tipos-propostos.json`)
- `amer_picon` (categoria `amaro`, pai `amaro`) para o Brooklyn. ABV 18% é o da versão atual (o original tinha ~39%); o perfil é
  aproximado. Sugestão para `substituicoes.json` (não gravada): `amer_picon` → `amaro_medio` (2), já que a Punch indica o
  Amaro CioCiaro como substituto.

## Copo, gelo, técnica e família
- "cocktail glass" → `coupe`. "London dock glass" (Brandy Flip) e "wine glass" (Coffee Cocktail) → `taca_vinho`.
- Fanciulli: o Difford's manda gelar uma Nick & Nora e depois "coar em copo com gelo", o que se contradiz. Fiquei com Nick & Nora sem gelo.
- Morning Glory Fizz: a Punch não diz o copo. Usei copo alto sem gelo, que é o serviço do Difford's e o normal de um fizz.
- Metropolitan: Byron só diz "small wine-glass" e não dá método. Usei mexido e Nick & Nora, como no Difford's.
- Brandy Flip: a Punch manda "bater muito e com força" sem falar de gelo; o passo diz "com gelo" para servir gelado.
- Hot Toddy: aquecer a caneca antes é sugestão minha. A versão da Punch não leva suco de limão (só a rodela de guarnição).
- Famílias discutíveis: Monte Carlo → `martini_manhattan` (Difford's: Manhattan com Bénédictine no lugar do vermute);
  Japanese Cocktail → `old_fashioned` (destilado + adoçante + bitters, mas batido); **Art of Choke** → `old_fashioned` (nenhuma família
  encaixa bem: amaro + rum + hortelã, mexido); Blood and Sand e Champs-Élysées → `daisy`; Kentucky Buck e Morning Glory Fizz → `fizz_collins`;
  Mamie Taylor, Kentucky Mule, Presbyterian, Chilcano e Mizuwari → `highball`; Coffee Cocktail, Eggnog e Cynar Flip → `flip`;
  Godfather → `duo_trio` (como em CLAUDE.md §4); Old Pal → `negroni`; Seelbach → `champagne_cocktail`.
- `variacaoDe`: rob_roy, fanciulli, monte_carlo, black_manhattan, brooklyn, little_italy, revolver e metropolitan → `manhattan`;
  bobby_burns → `rob_roy`; red_hook e greenpoint → `brooklyn`; improved_whiskey_cocktail → `old_fashioned`; old_pal → `boulevardier`;
  gold_rush, ward_eight e rattlesnake → `whiskey_sour`; champs_elysees → `sidecar`; kentucky_mule → `moscow_mule`.
  `whiskey_sour`, `sidecar` e `moscow_mule` estão nos lotes 01/02, então o validador avisa até a consolidação.

## Origem: critério, divergências e lacunas
Critério: `ano` só quando a fonte dá a data de criação (ou o drink é do próprio autor do livro, como o Japanese Cocktail de
Jerry Thomas). A data da primeira receita impressa numa coletânea fica só aqui:
- Primeira aparição impressa: Blood and Sand e Rattlesnake (*Savoy Cocktail Book*, 1930); Lion's Tail (*Café Royal Cocktail Book*,
  Londres, 1937, que diz "invented by L. A. Clarke", daí o `bartender`); Monte Carlo (Embury, 1948); Champs-Élysées (*Drinks — Long
  and Short*, 1925); Metropolitan (Byron, 1884); Brooklyn e Jack Rose (*Jack's Manual*, 1908); Fanciulli (Crockett, 1931, provavelmente
  do Waldorf-Astoria); Improved Whiskey Cocktail (Jerry Thomas, 1876); Coffee Cocktail (Jerry Thomas, 1887); Whiskey Smash (Jerry Thomas,
  1862, resgatado por Dale DeGroff nos anos 2000); Corpse Reviver No. 1 (Savoy, 1930; costuma ser atribuído a Frank Meier, do Ritz de
  Paris, sem prova).
- **Ward Eight**: Boston é consenso. O Locke-Ober Café em 1898 (Tom Hussion ou Billy Kane) e a versão de Charlie Carter (1903) são
  contestados pelo próprio Difford's → só a cidade.
- **Scofflaw**: janeiro de 1924, Paris. O Chicago Tribune fala do bar do Maxim's e, dias depois, do Harry's New York Bar ("Jock") → `bar: null`.
- **Old Pal**: a Punch credita Harry MacElhone (e cita 1922); o Difford's diz que aparece em *Barflies and Cocktails* (1927), num
  texto de Arthur Moss, e que o nome homenageia William "Sparrow" Robinson (a Punch escreve Robertson). Ficou Paris + Harry's New York Bar, sem bartender e sem ano.
- **Rob Roy**: a Punch cita o Waldorf-Astoria de Nova York nas primeiras menções (1897). Ficou cidade + bar, sem ano.
- **Morning Glory Fizz**: a Punch credita Harry Johnson; o Difford's cita dois livros de 1884 (George Winter e O. H. Byron) → tudo `null`.
- **Gold Rush**: T. J. Siegel no Milk & Honey; a Punch diz 2000 e o Difford's 2001 → `ano: null`.
- **Red Hook**: Enzo Errico no Milk & Honey, 2003–2005 (Difford's) → `ano: null`.
- **Kentucky Buck**: o Difford's dá 2009, no Bourbon & Branch (São Francisco). A Punch cita o Polite Provisions (San Diego), onde
  Castro trabalhou depois. Usei o Difford's.
- **Seelbach**: criado em 1995 por Adam Seger no Seelbach Hotel (Louisville). A história de um coquetel de 1917 foi inventada por ele
  e desmentida em 2016 (Difford's e Punch). O Difford's escreve "Segar".
- **Bourbon Renewal**: 2004, Bel Ami Lounge, Eugene (Oregon), segundo o Difford's; a Imbibe diz que ficou famoso no Clyde Common (Portland).
- **Brown Derby**: Vendôme Club, Los Angeles (West Hollywood), anos 1930 → sem ano.
- **Little Italy**: Audrey Saunders, Nova York, 2005; a Punch não diz que foi criado no Pegu Club → `bar: null`.
- **Cynar Flip**: Ben Sandrof, segundo *The Bar Book*. Local e ano não confirmados.
- **Chilcano**: modo tradicional de servir pisco no Peru, sem autor.
- Sem origem nas fontes: Bobby Burns, Godfather (anos 1970), Hot Toddy, Mamie Taylor, Presbyterian, Kentucky Mule, Jack Rose
  (nome disputado), Brandy Flip, Eggnog, Amaretto Sour, Mizuwari.

## Specs com dúvida ou divergência entre fontes
- **Riffs da Punch descartados** (a página com o nome clássico é a versão de um bar): Ward Eight (Logan Rodriguez, Smithereens),
  Godfather (Bill Brooks, The Cannibal), Champs-Élysées (Cody Pruitt, Libertine, 2023, com armagnac e yuzu) e Metropolitan
  (Philip Weltner, Madeira Park). Nesses quatro usei o Difford's.
- **Scofflaw**: a do Difford's é modernizada (rye 100 proof, vermute seco + bianco). A original de 1924: ⅓ Canadian Club, ⅓ vermute
  francês, ⅙ limão, ⅙ granadina, 1 dash de orange bitters.
- **Fanciulli**: o Difford's faz split rye/bourbon e põe sal. Crockett: ½ whiskey, ¼ vermute italiano, ¼ Fernet.
- **Metropolitan**: usei a de Byron (1884). O Difford's adapta para 45 ml de vermute âmbar + 22,5 ml de cognac + 2,5 ml de gomme +
  3 dashes (mesma proporção 2:1, mas pede um vermute que não está na base). A Punch diz que nos anos 1910 ele virou um Manhattan
  de brandy com vermute doce.
- **Jack Rose**: a Punch escreve "1/2 lime juice" sem unidade, então usei a Imbibe (2 oz applejack, ¾ granadina, ¾ limão).
  O Difford's tem uma versão de 8 ingredientes.
- **Whiskey Smash**: a do Difford's (hortelã, bourbon, suco de limão, xarope rico, batido). A da Punch amassa rodelas de limão e
  leva orange bitters, o que é pouco usual; não usei.
- **Bobby Burns**: a do DeGroff (2 : ¾ : ½ de Bénédictine). Savoy (1930): ½ scotch, ½ vermute, 3 dashes de Bénédictine.
- **Godfather**: o Difford's usa 3:1. Ele mesmo diz que as receitas vão de 1:1 até 8:1.
- **Seelbach**: a Punch mantém os 7 + 7 dashes de Seger; o Difford's reduz para 2 + 2.
- **Greenpoint**: a Punch pede 1 dash de Angostura; o Difford's, citando McIlroy, 2.
- **Red Hook**: o Difford's passou a 50/15/10 ml em 2023. Fiquei com a Punch (60 ml de rye, 15 de Punt e Mes, 7,5 a 15 de marasquino).
- **Lion's Tail** e **Rattlesnake**: a Punch, não o Difford's (que usa xarope rico e outras doses).
- **Eggnog**: versão individual da Punch. O Difford's: 25 ml de cognac, 25 ml de rum envelhecido, 10 ml de xarope rico, 25 ml de leite e 1 ovo.
