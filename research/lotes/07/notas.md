# Lote 07: canônicos de rum, cachaça, agave e tiki (pesquisa em 2026-11-19)

## Escopo
A lista de `research/lotes/canonicos.md` tem 46 drinks. **Entraram 40:** hurricane, painkiller, el_presidente, air_mail,
queens_park_swizzle, corn_n_oil, navy_grog, rum_old_fashioned, ti_punch, fog_cutter, saturn, hot_buttered_rum, rum_swizzle,
port_light, mezcal_negroni, oaxaca_old_fashioned, el_diablo, rosita, batanga, siesta, matador, ranch_water, division_bell,
mezcal_mule, caju_amigo, batida_de_coco, batida_de_maracuja, bombeirinho, quentao, caipirinha_de_maracuja, macunaima,
cachaca_sour, rum_runner, scorpion, test_pilot, nui_nui, rum_flip, dark_daiquiri, mexican_firing_squad, tia_mia.

**Ficaram de fora (6):**
- `jungle_bird`, `three_dots_and_a_dash`, `missionarys_downfall`: são IBA New Era e já estão no lote 03.
- `tequila_old_fashioned`: não achei spec canônica. Não existe no Difford's (só riffs, como o Gingerbread), e Punch e Imbibe dão 404.
  O Oaxaca Old Fashioned cobre a ideia.
- `cobra_fang`: não está no Difford's, no Punch nem no Imbibe. A busca só trouxe blogs e uma versão moderna da Paste Magazine
  (1½ oz de rum jamaicano + ½ oz de demerara 151), diferente da receita de Donn Beach (~1937) que o Beachbum Berry publicou.
  Sem a spec do Berry aberta, não entra.
- `leite_de_onca`: a busca só trouxe receitas caseiras do Tudo Gostoso (enviadas por usuários, em latas e copos, versões muito
  diferentes entre si). Nenhuma fonte brasileira confiável com proporção. Pela regra, fica de fora.

## Método e fontes
- As páginas foram baixadas e lidas no HTML original (não por resumo). As URLs do Difford's saíram do sitemap oficial
  (`/sitemap/cocktail.xml`), sem gastar busca. Punch e Imbibe: URL previsível. Panelinha: URL previsível (`/receita/<slug>`).
- O Difford's bloqueou (403) por alguns minutos depois de ~22 páginas seguidas. Voltou sozinho. Em lotes futuros, espaçar os pedidos.
- Buscas na web usadas: 4 (caju amigo, cobra's fang, bombeirinho, leite de onça).
- `passos` são meus. Perfis e cores são estimativas minhas. `abv`/`volumeFinalMl` ficam para `calcular.mjs`.
- Validado numa cópia da base com os tipos dos lotes 01–04 e 07 juntos: 0 erros nas receitas do lote (os únicos erros eram as
  contagens do `meta.json` da cópia). Todos os `tipo` de ingrediente e guarnição existem.

## Confiança
- `spec_publicada` (o criador publicou): **fog_cutter** (Trader Vic's Book of Food and Drink, 1946), **scorpion** e **port_light**
  (Trader Vic's Bartender's Guide, 1972) e **cachaca_sour** (criação do próprio Simon Difford, 2025). As três do Trader Vic eu li na
  citação literal do livro, dentro da página de história do Difford's (a URL da fonte é essa página).
- `adaptacao_publicada`: todas as outras. Isso inclui casos com a spec atribuída ao criador mas publicada por terceiro:
  - Siesta (Punch credita Katie Stipe);
  - Division Bell (Punch credita Phil Ward);
  - Macunaíma (receita do bar Boca de Ouro, passada por Arnaldo Hirai ao Difford's);
  - Tia Mia ("original recipe, Ivy Mix, 2010", citada pelo Difford's);
  - Mezcal Mule (a Punch diz "adapted from" o livro da PDT).

## Escolha de versão (onde as fontes divergem)
- **Hurricane:** usei a "original recipe" do Difford's (adaptada do Grog Log do Beachbum Berry, que remete à Pat O'Brien's de
  1956): 120 ml de rum jamaicano, 60 de xarope de maracujá e 60 de limão-siciliano. É um drink grande. Outras versões:
  - Punch: 1 oz de rum claro, 1 de escuro, ¾ de limão e 1 de xarope de maracujá;
  - Imbibe: versão moderna com sucos, Galliano e bitter;
  - Difford's "Hurricane": 8 ingredientes.
- **Painkiller:** Difford's (45 navy rum : 90 abacaxi : 22,5 laranja : 15 creme de coco). A Punch publica 1½ : 1½ : ½ : ¾, que fica
  longe da proporção 4:1:1 de abacaxi, creme de coco e laranja da Pusser's. As "Difford's Daiquiri Bitters" (opcionais, marca própria)
  ficaram fora dos ingredientes e aparecem só no `specFonte`.
- **El Presidente:** Punch (rum dourado, vermute seco, curaçao, granadina). O Difford's divide entre vermute dry e bianco e põe solução salina.
- **Queen's Park Swizzle:** Punch, com rum demerara, que é o tradicional (Trader Vic, 1947). O Difford's usa rum dourado e xarope de demerara.
- **Corn 'n' Oil:** Difford's, sem suco de limão, como no rótulo do Velvet Falernum e na tradição de Barbados. A Punch acrescenta
  ½ oz de limão.
- **Navy Grog:** a receita do Grog Log (Berry), citada no Difford's, com três runs, mel e soda e batida com gelo. A versão do próprio
  Difford's vai no liquidificador com goma xantana. A citação diz "¾ soda water" sem unidade; li ¾ oz (nota no ingrediente).
- **Fog Cutter:** a spec de 1946 do Trader Vic. Ela pede só um "float" de xerez, sem quantidade, então usei os 15 ml do Difford's
  (oloroso), com nota. O tipo ficou `xerez` genérico, porque em 1972 o Vic pede xerez doce. A versão do Difford's tem pisco e
  ficou de fora.
- **Saturn:** Imbibe (Garret Richard, Slowly Shirley): 1½ gin, ½ limão-siciliano, ½ orgeat, ¼ purê de maracujá e ¼ falernum.
  O Difford's usa goma xantana como ingrediente obrigatório.
- **Rum Swizzle:** Difford's (Georgetown Club, Guiana), com falernum e demerara. A Punch traz o "ode" do Trader Vic com "juice of 1 lime",
  e o Difford's tem também o Bermuda Rum Swizzle, de 9 ingredientes.
- **Port Light, Scorpion e Test Pilot:** as specs de 1972 do Trader Vic, citadas no Difford's. A versão do Difford's para o Port Light
  acrescenta granadina. O Test Pilot é criação de Donn Beach (~1941), e a versão do Vic é de terceiro, por isso `adaptacao_publicada`.
- **Rosita:** Punch (Gary Regan), com 1½ de tequila e 1 de Campari. O Mr. Boston de 1974 usa 1 de tequila e 1 de Campari, e o Difford's
  usa 45/15/15/15.
- **Matador:** Difford's "Matador No.1" (tequila, triple sec, limão, abacaxi), que é a família "Margarita com abacaxi". Alternativas:
  - Tarling (1937): partes iguais de tequila, curaçao e vermute seco, sem volume definido;
  - Punch: um riff com Chartreuse.
  Vale o Bruno escolher.
- **Ranch Water:** Imbibe (Ricky Cobia): tequila, limão e água com gás. Fica mais perto do original do que a do Difford's, que
  acrescenta triple sec, agave e sal para imitar o Topo Chico. A origem é disputada (Kevin Williamson no Ranch 616, em Austin, em 1998,
  ou o Gage Hotel, em Marathon), por isso deixei em branco com a tag `historia_disputada`.
- **Mezcal Mule:** Punch (livro da PDT). Ela pede 1 oz de "ginger beer" (a caseira da PDT). O Difford's diz que o original de Meehan
  usa 30 ml de xarope "ginger wort".
- **Mexican Firing Squad:** a adaptação do Difford's para a receita de Baker (1939): 60/20/12,5 + 2 dashes. Fica mais perto de Baker
  (1½ a 2 colheres de chá de granadina) do que a da Punch (¾ oz de granadina, 5 dashes).
- **Tia Mia:** a receita original de Ivy Mix (2010), citada no Difford's, e não a adaptação deles.
- **Macunaíma:** a receita usada no bar (50 cachaça, 20 limão-taiti, 20 xarope 1:1, 7 Fernet), citada no Difford's. A adaptação do
  próprio Difford's troca para limão-siciliano e xarope 2:1. A Punch dá as mesmas medidas convertidas para oz ("scant 1¾"...).
- **Batida de coco:** Difford's (cachaça, creme de coco, leite condensado; no liquidificador). A Punch traz a versão do Surubar (Rio),
  um lote de garrafa com coco fresco, suco de maçã, leite de coco, leite condensado e cachaça, que descansa 7 dias. Pode virar uma
  receita à parte depois.
- **Caju Amigo:** Panelinha, com vodca, caju em calda, açúcar, suco de caju concentrado e limão. Bate com a descrição do original do
  Pandoro (Forbes Brasil: vodca, suco de caju, fruta em calda, açúcar e gelo, criado em 1974 por Guilhermino Ribeiro dos Santos). O
  original tinha um "ingrediente secreto" nunca revelado. A Forbes também conta a versão carioca de Carlinhos Niemeyer (1954, com gin).
  A versão com cachaça do Fifty Fifty Bar, também publicada pela Forbes (60 suco de caju, 40 calda de caju, 20 limão, 60 cachaça),
  pode virar variação.
- **Bombeirinho:** coluna "Butecos de JF" (Airton Soares) do jornal Tribuna de Minas. É a única fonte com proporção explícita que
  achei: "preparo gourmet" com 30 ml de cachaça prata, 10 de limão e 10 de groselha, mexido e servido em copo de shot. A mesma
  coluna descreve o "preparo de botequim" sem medida exata (¼ de copo americano de cachaça, ¼ de groselha, meio limão). A fonte é
  um jornal regional, mais fraca que as outras: revisar.
- **Batida de maracujá:** Panelinha. A receita "serve até 4 porções" (4 maracujás, ½ xícara de leite condensado, ½ xícara de cachaça),
  e eu dividi por 4 (1 maracujá, 30 ml, 30 ml). Está anotado no `specFonte`.
- **Quentão:** Panelinha. Mantive a **receita de panela inteira** (até 6 canecas: 720 ml de cachaça, 480 de água, 360 de açúcar
  caramelizado...), porque dividir por 6 daria frações de cravo e de canela. Ela tem a tag `receita_de_panela`, e o primeiro passo
  avisa o rendimento. ⚠ O ABV que `calcular.mjs` vai estimar não reflete a fervura de 25 min, e a ficha vai tratar o lote como
  "1 porção". Sugestão: um campo `porcoes` no schema de drinks. A técnica ficou `montado` porque não há técnica "cozido".
- **Cachaça Sour:** a receita é uma criação do Simon Difford (set/2025), não um clássico antigo (`origem.classico: false`). As
  "Bob's Ginseng Bitters" (opcionais) ficaram fora, e a solução salina virou uma pitada de sal, alternativa que a própria fonte dá.

## Conversões e mapeamentos (D8/D27)
- Colher de chá = 5 ml (granadina do El Presidente 2,5 ml; limão do Caju Amigo 5 ml). Colher de sopa = 15 ml (açúcar do Caju Amigo).
  Xícara = 240 ml (Quentão). Barspoon → `bsp`.
- "Solução salina (3–4 gotas) ou uma pitada de sal" → `sal` 1 `pitada` (Matador, Cachaça Sour), com nota.
- Ramo de hortelã → `hortela` 1 `un` com nota (como no lote 02). "1 knob butter" → `manteiga` 1 `un` ("uma noz").
- Disco de limão do Ti' Punch → `limao_taiti` 1 `fatia`. Meio limão da caipirinha → `limao_taiti` 0,5 `un`.
- Rum, pela descrição do Difford's:
  - "light gold rum (1–3 anos)" e "Caribbean blended rum aged 6–10 years" → `rum_envelhecido`;
  - "light white rum" e "light Puerto Rican rum" → `rum_branco`;
  - "dark Jamaica rum", "Jamaican rum" e "overproof white rum (unaged Jamaican/funky)" → `rum_jamaicano`;
  - "Dark/black/blackstrap" → `rum_escuro`;
  - "Navy rum" → **`rum_navy`** (proposto).
- "Agave nectar" / "agave syrup (agave nectar)" → **`nectar_agave`** (proposto no lote 04), e não `xarope_agave` (que é diluído 1:1).
  O lote 03 usou `xarope_agave` no Tommy's; vale padronizar.
- Purê ou néctar de maracujá → `suco_maracuja`, com nota (Saturn, Mezcal Mule, Port Light), como no lote 03.
- Xaropes 2:1 da fonte em tipos 1:1 da base, com nota: xarope de mel 3:1 no Air Mail, demerara 2:1 no Rum Swizzle e o demerara do
  Rum Flip, cuja proporção a página da Punch não traz ("see Editor's Note", nota ausente).
- Marcas de tequila do Difford's viraram o tipo da categoria (Olmeca Altos Plata → `tequila_blanco`, Reposado → `tequila_reposado`).
  Onde a fonte diz só "tequila", usei `tequila`.
- Copo hurricane → `highball` (mesmo critério do Singapore Sling no lote 02). "Port light glass" e "grapefruit supreme glass" → `dof`.
  "Toddy glass" → `caneca_quente`. "Copo longo" (Panelinha) → `collins`.

## Origem: lacunas e anos aproximados
- Anos aproximados ("circa") que gravei como ano: Navy Grog 1940, Test Pilot 1941, Siesta 2006, Tia Mia 2010.
- El Diablo: 1946 é o ano da 1ª publicação ("Mexican El Diablo", Trader Vic's Book of Food and Drink). O Difford's mostra um "Diablo"
  de rum em 1940 e diz que o Vic só trocou o rum pela tequila, por isso o bartender ficou vazio.
- El Presidente: Havana, origem disputada (Punch cita Eddie Woelke; o Difford's, via Wondrich, cita Constantino Ribalaigua): bartender
  vazio, com a tag.
- Hurricane: a Pat O'Brien's (Nova Orleans) o tornou famoso. Ele pode ter nascido no Hurricane Bar de Nova York (1939); o "Louis Culligan,
  1956" ficou fora, porque o próprio Difford's diz "purported".
- Painkiller: o Punch diz que "em geral" o crédito é de Daphne Henderson, no Soggy Dollar Bar, nos anos 1970. Ano vazio.
- Saturn: Difford's dá 1969 (campeonato do IBA), mas conta que o nome mudou depois de um acidente de 15/11/1967. O Imbibe diz
  "inventado em 1967". Ano vazio.
- Rum Runner: o Holiday Isle Tiki Bar (Islamorada) se diz "a casa" do drink. A lenda do gerente John Elber ("Tiki John") é sustentada
  só pelo site do próprio bar, então o bartender ficou vazio.
- Sem origem nas fontes abertas: Air Mail (1930s, panfleto da Bacardi), Corn 'n' Oil (Barbados, sem cidade), Hot Buttered Rum,
  Mezcal Negroni, Rosita, Matador, Batidas, Bombeirinho, Quentão, Caipirinha de maracujá, Rum Flip e Dark Daiquiri.

## Tipos propostos (`tipos-propostos.json`)
- `rum_navy` (pai `rum_escuro`, ABV típico 54,5): Painkiller e Dark Daiquiri. O Difford's pede "circa 55%". A Pusser's Blue Label
  tem ~42%. Como filho de `rum_escuro`, ele atende receitas que pedem rum escuro.
- `xarope_cana` (sirop de canne): Ti' Punch. Sem `docura`, porque não achei Brix publicado.
- `licor_banana` (crème de banane): Rum Runner. Sem `docura`, pelo mesmo motivo.
- `manteiga` (ovo_laticinio, `un`, validade 30 dias): Hot Buttered Rum.
- `leite_condensado` (outros, ml): as duas batidas.
- `caju_calda` (outros, `un`) e `suco_caju` (mixer, ml, concentrado de garrafa, sem `derivadoDe`): Caju Amigo.
- Reusados de outros lotes: `rum_demerara` (02), `licor_pimenta_jamaica` (03) e `nectar_agave` (04).

**Substituições sugeridas** (não gravadas, precisam de ok):
- `xarope_cana` → `xarope_simples` (2), porque a Punch diz que o simples "serve no aperto";
- `rum_navy` → `rum_escuro` (3) e → `rum_demerara` (2);
- `nectar_agave` → `xarope_agave` (3, com ajuste de ml);
- `suco_caju` → `caju` (fruta batida e coada, 2), pela Forbes (Fifty Fifty);
- `leite_condensado` → sem substituto óbvio.

## Dúvidas para o Bruno
1. Caju Amigo com vodca (original do Pandoro) ou trocar para a versão com cachaça (Fifty Fifty Bar)?
2. Matador: versão com abacaxi (escolhida) ou a de Tarling (tequila, curaçao e vermute seco)?
3. Quentão como receita de panela (6 porções) está ok, ou prefere que o schema ganhe `porcoes`?
4. O Bombeirinho tem uma fonte mais fraca (coluna de jornal regional). Mantém?
