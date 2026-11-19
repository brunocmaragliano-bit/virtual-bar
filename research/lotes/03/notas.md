# Lote 03 — IBA "New Era" (pesquisa em 2026-11-19)

## Escopo e método
- Lista tirada do próprio site da IBA: `https://iba-world.com/cocktails/the-new-era/` (2 páginas, 34 drinks), conferida com
  `https://iba-world.com/cocktails/all-cocktails/` (6 páginas, 102 drinks).
- **Entraram os 34.** Nenhum New Era já estava na base. O Rabo de Galo aparece no site da IBA como **Contemporary Classics**
  (não New Era), igual ao que já está em `classicos.json`; não refiz.
- Spec: sempre a página oficial da IBA (`confianca: spec_publicada`, `iba: "New Era"`). As páginas da IBA **não trazem história**;
  a `origem` vem de uma fonte secundária por drink (Punch ou Difford's; Wikipedia em IBA Tiki e Ve.N.To, que são fontes mais fracas).
- `passos` são meus; perfis e cores são estimativa minha (mesmo critério da fase 1). `abv`/`volumeFinalMl` ficam para `calcular.mjs`.

## Conversões e leituras da spec (D8/D27)
- **Bee's Knees**: "2 teaspoons Honey Syrup" → 10 ml (1 colher de chá = 5 ml), com nota.
- **Sherry Cobbler**: "1 tsp" de açúcar → `acucar` 5 ml (medida em volume); "1/2 Orange/Lemon Wheel" → `qtd 0.5`, `fatia`.
- **Espresso Martini**: "1 strong Espresso" → `qtd 1, unidade "un"`, sem inventar ml. ⚠ `calcular.mjs` conta `un` como 0 ml
  (só `acucar` tem valor em `ML_UN`), então o ABV desse drink sai superestimado. Sugestão: `ML_UN.cafe_espresso = 30`.
- **IBA Tiki**: a página traz "90 Fresh Pineapple Juice" e "30 Fresh Lime Juice" **sem unidade**; usei ml pelo contexto (todas as
  outras linhas são ml), com nota. Duas linhas de `rum_envelhecido` (Havana Club Profundo e Smoky), cada uma com nota.
- **Three Dots and a Dash**: a página cola duas linhas ("7.5 ml Allspice Saint Elizabeth15 ml Fresh Lime Juice"); li como
  7,5 ml de allspice dram + 15 ml de limão.
- Faixas → mínimo, com a faixa na `nota`: Old Cuban hortelã "6/8" → 6; South Side "5/6" → 5; Penicillin gengibre "2-3" → 2;
  Missionary's Downfall abacaxi "3 to 4 pcs" → 3 (`un`, porque são pedaços e não fatias).
- "Few drops of egg white" → `ovo_clara`, `um_pouco`, `espuma`. Opcional em Illegal, South Side e Ve.N.To (a IBA diz "Optional");
  **não** opcional no New York Sour (a IBA não diz).
- "Fill up / Top up" → `top` (Fernandito, Russian Spring Punch, Suffering Bastard); "Splash of soda" → `splash` (Spritz).

## Tipos escolhidos (onde houve escolha)
- "Dry Gin" (Bee's Knees) → `gin` genérico (a fonte não pede London Dry). South Side pede "London dry Gin" → `gin_london_dry`.
- "Cuban Rum" (Don's Special Daiquiri) → `rum` genérico, com nota. "Gold Jamaican Rum" e "Jamaica Overproof White Rum" → `rum_jamaicano`.
- "Goslings Rum" e "Blackstrap rum" → `rum_escuro`. "Peach Brandy" → `licor_pessego`. "Honey mix" e "Monin Honey Syrup" → `xarope_mel`.
- "Passion Fruit Puree" (IBA Tiki, Porn Star Martini) → `suco_maracuja` com nota; não há tipo de purê/polpa. Se o Bruno usar polpa
  congelada, vale um tipo `polpa_maracuja`.
- "Raw Honey" (Canchanchara) → `mel`. "Amaro Nonino" → `amaro_medio`. "Champagne" (Porn Star Martini) → `champagne` (a spec diz Champagne).
- **Trinidad Sour**: 45 ml de Angostura é a **base** (`bitters_aromatico` em ml, papel `base`).
- **Porn Star Martini**: o champagne é servido à parte num copinho; mantive como ingrediente (`diluidor`, com nota), o que infla o
  volume estimado. Avaliar se o motor deve tratá-lo como acompanhamento.
- **Spritz**: id `aperol_spritz` (regra 9), nome "Spritz". A IBA cita versões com Campari, Cynar ou Select (está na nota do Aperol).

## Copo, gelo, família
- "footed copo glass" (Don's Special Daiquiri, Three Dots and a Dash), "coppa grande" (Missionary's Downfall) e "large goblet"
  (Pisco Punch) → `taca_vinho`. "cocktail glass" → `coupe`; "martini cocktail glass" (Tipperary) e Espresso/French Martini → `martini`.
- Pisco Punch: a IBA não fala de gelo no copo → `gelo: nenhum`. Canchanchara: "cracked ice" → `picado`; a IBA não nomeia o copo
  (o tradicional é tigelinha de barro) → `rocks`.
- Gin Basil Smash: a IBA manda bater tudo com gelo e servir em taça gelada, sem macerar antes; segui a IBA.
- Famílias discutíveis: Old Cuban → `champagne_cocktail` (espumante como `diluidor`); Espresso e French Martini → `duo_trio`;
  Paper Plane e Naked and Famous → `daisy`; Porn Star Martini e Spicy Fifty → `sour`; Suffering Bastard e Paloma → `highball`.
- `variacaoDe`: Don's Special Daiquiri → `daiquiri`; Grand e Tommy's Margarita → `margarita`; New York Sour → `whiskey_sour`;
  Paper Plane → `last_word` (Difford's: "riff on the Last Word"); Naked and Famous → `paper_plane` (Punch: "cruzamento de Last Word e Paper Plane").

## Origem: divergências e lacunas
- **Sem origem confiável** (tudo `null`): Don's Special Daiquiri (só o nome liga a Don the Beachcomber), Grand Margarita, Illegal
  (Kindred e outros dizem "história desconhecida").
- Chartreuse Swizzle: Punch credita Marco Dionysos e cita Smuggler's Cove (SF); deixei `bar: null` porque parece ser onde a
  receita é servida, não onde nasceu.
- Old Cuban: Difford's dá 2004, Nova York; Punch diz que começou no Beacon e foi concluído no Tonic. `bar: null`.
- Espresso Martini: Difford's dá ~1983 no Soho Brasserie; há quem defenda 1984 ou 1985.
- French Martini: Punch credita Dale DeGroff servindo no Pravda (NY); deixei `bartender: null` (não está claro que ele criou).
- Fernandito: Córdoba (Argentina); a lenda do bartender Oscar "el Negro" Becerra nos anos 1970 (Difford's) ficou fora.
- Spicy Fifty: Difford's diz "2004/5", para o primeiro cardápio do Fifty (fev/2005); gravei 2005.
- Ve.N.To: segundo criador é "Leonardo Veronesi" na Wikipedia e "Leonardo Varesi" em outras fontes; ano de criação não publicado
  (entrou na lista da IBA em 2020), então `ano: null`.
- Missionary's Downfall: Punch dá 1937, sem bar nem cidade. Jungle Bird: "fim dos anos 1970" no Kuala Lumpur Hilton, então `ano: null`.
- Tipperary: Ensslin (1916) publicou em partes iguais; a spec da IBA (50/25/15) é mais próxima da de MacElhone (1922), segundo Difford's.
- South Side: história disputada (21 Club, NY, ou Southside Sportsmen's Club, Long Island): `null`. Sherry Cobbler: EUA, anos 1820–30: `null`.
- Canchanchara: região de Trinidad (Cuba), mambises na Guerra dos Dez Anos (1868–1878): só a cidade.
- IBA Tiki: Diosmel Mendoza Medrano, El Polinesio (Habana Libre), 2022, para o campeonato da IBA em Varadero (fonte: Wikipedia).

## Specs com dúvida
- **Tommy's Margarita**: a IBA lista 30 ml de néctar de agave (conferi a página duas vezes); fica bem mais doce que o 2:1:½ que
  costuma circular. Mantive a IBA, sem conferir outra fonte.
- **Sherry Cobbler**: a IBA pede 45 ml de amontillado **e** 45 ml de palo cortado (conferido); gerou o tipo `xerez_palo_cortado`.
- **IBA Tiki**: unidades ausentes (ver acima).

## Tipos propostos (`tipos-propostos.json`) e substituições sugeridas (não gravadas)
`aguardiente_cubana` (pai `rum`), `grappa`, `vodka_baunilha` (pai `vodka`), `licor_avela`, `licor_pimenta_jamaica`,
`xerez_palo_cortado` (pai `xerez`), `cordial_sabugueiro`, `cordial_camomila`, `acucar_baunilha`.
ABV e perfil desses tipos são aproximados. Sugestões para `substituicoes.json`:
- `aguardiente_cubana` → `rum_branco` (2, bidirecional) e → `cachaca_prata` (2);
- `vodka_baunilha` → `vodka` (2, ajuste com `xarope_baunilha`);
- `cordial_sabugueiro` → `licor_sabugueiro` (2; o licor tem álcool e é mais doce);
- `xerez_palo_cortado` → `xerez_amontillado` (3) e → `xerez_oloroso` (2);
- `acucar_baunilha` → `xarope_baunilha` (2); `grappa` → `pisco` (1).
Preparos que fariam falta: `cordial_camomila` (o Ve.N.To ficou com dificuldade 3 por isso), `cordial_sabugueiro` e `xarope_mel`
(o tipo já existe, mas o preparo não).
