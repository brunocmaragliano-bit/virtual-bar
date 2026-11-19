# Lote 04 — preparos (xaropes e cordial)

Pesquisa em 2026-11-19. 13 preparos, um para cada tipo com `preparo` em `tipos.json` (fora o `xarope_simples_1_1`, que já está na base).
Nenhum ficou de fora. Tudo passa nas regras do validador quando os 6 tipos propostos entram (conferido por script).

## Fontes e escolhas

| id | proporção | fonte | confiança |
|---|---|---|---|
| xarope_rico_2_1 | 2 açúcar : 1 água (volume), no fogo | Difford's Guide + Imbibe | adaptacao_publicada |
| xarope_demerara | 1 demerara : 1 água (volume) | Imbibe | adaptacao_publicada |
| xarope_mel | 1 mel : 1 água (volume) | Imbibe (+ Punch para o Brix) | adaptacao_publicada |
| xarope_mel_gengibre | 1 xíc. mel + 1 xíc. água + 15 cm de gengibre, 5 min de fervura + noite na geladeira | Punch (Penicillin, adaptado de *A Proper Drink*, R. Simonson) | adaptacao_publicada |
| xarope_gengibre | 6 xíc. água + 2 xíc. gengibre picado + 2 xíc. açúcar, 1 h em fogo baixo | Imbibe (Betty Fraser e Denise DeCarlo, LA) | adaptacao_publicada |
| xarope_agave | 1 néctar : 1 água (volume) | Imbibe (+ Punch como alternativa) | adaptacao_publicada |
| granadina | 1 suco de romã : 1 açúcar, fogo baixo | Punch | adaptacao_publicada |
| orgeat | 2¼ xíc. amêndoa, 3½ xíc. água, 3½ xíc. açúcar, 1 oz vodka, ¼ c. chá água de flor de laranjeira | Imbibe (Teardrop Lounge, Portland) | adaptacao_publicada |
| xarope_framboesa | 2 xíc. demerara + 1 xíc. água + 1 xíc. framboesa | Imbibe | adaptacao_publicada |
| xarope_canela | 1 açúcar : 1 água + 4 paus de canela, 8–10 min de fervura | Imbibe | adaptacao_publicada |
| cordial_limao | 250 g açúcar, 240 ml água quente, 45 ml suco, 8 g casca, 25 g ácido cítrico, no liquidificador | Jeffrey Morgenthaler (blog do autor) | spec_publicada |
| xarope_maracuja | 1 polpa 100% : 1 xarope simples | Punch (Jeff "Beachbum" Berry) | adaptacao_publicada |
| xarope_baunilha | 1 açúcar : 1 água + 1 fava aberta | Imbibe | adaptacao_publicada |

## Divergências e decisões

- **Agave:** a Imbibe dilui 1:1 em volume. A Punch (Jack Schramm) usa 2 partes de néctar para 1 de água **em peso** (≈ 50° Brix).
  Fiquei com a Imbibe porque é em volume, como o resto da base. A da Punch está citada no `specFonte`.
- **Mel:** a Imbibe usa 1:1 em volume. A Punch dá 1.000 g de mel + 640 g de água quente para 50° Brix. Ficou a Imbibe, com a Punch de referência.
  Muitos bares usam 3:1 (mel:água). Seria outro preparo, e não abri uma fonte para essa versão.
- **Orgeat:** a receita da Punch (Eamon Rockey, Betony) pede 1 libra de **amêndoa amarga** e um banho de 4 h. Descartei: é difícil achar,
  é tóxica crua em quantidade e o método é pouco prático. A da Serious Eats só apareceu por um site espelho, por isso não usei.
  A escolhida (Teardrop/Imbibe) usa amêndoa crua comum.
- **Mel e gengibre:** o original do Sam Ross (Milk & Honey) mistura suco de gengibre com xarope de mel. A versão publicada pela Punch
  (do livro do Simonson) é uma infusão com fervura curta e uma noite de descanso. Entrou a da Punch, que tem proporção publicada.
- **Gengibre:** a versão da Imbibe é cozida por 1 h. Fica mais suave que um xarope feito com suco de gengibre cru (estilo Death & Co).
  Se o Bruno quiser a versão mais picante, ela precisa de uma fonte própria.
- **Maracujá:** a Punch tem outras versões (Samson Swizzle: 1 xíc. água + 1 xíc. purê + 3 xíc. açúcar; Porn Star congelado: 1 purê : 2 xarope).
  Escolhi a do Berry, que é a referência tiki e a mais simples. Ela usa `xarope_simples` como insumo, então é um **preparo encadeado**:
  o motor precisa aceitar um preparo rápido dentro de outro. Usei `suco_maracuja` (polpa 100%) em vez de criar `polpa_maracuja`.
- **Cordial:** a receita impressa pede 250 g de açúcar e o texto do post pede 8 oz/240 ml. Usei 240 ml com nota. Técnica `blender`,
  porque o método é bater no liquidificador. Ela está no vocabulário e descreve melhor que `batido`.
- **Demerara e framboesa:** usei o tipo `acucar_mascavo` ("Açúcar mascavo / demerara"). Mascavo escuro tem sabor bem mais forte que demerara.
  Talvez valha separar os dois tipos no futuro.

## Validade, tempo e rendimento

- `validadeDias` publicado: 14 dias em rico, demerara, mel, agave, granadina, orgeat, framboesa, canela e baunilha.
  No cordial, os 14 dias vêm de uma resposta do autor nos comentários (2025): "duas semanas por segurança", congelado indefinidamente,
  sabor melhor nos primeiros ~4 dias.
- **Sem validade na fonte (usei valor conservador):** mel e gengibre 14, gengibre 14, maracujá **7** (fruta fresca sem conservante).
- `tempoMin` é o tempo total até ficar utilizável, contando infusão e descanso, com estimativa minha para esfriar:
  mel e gengibre 495 (inclui a noite, ~8 h), orgeat 300 (usa o mínimo de 4 h de molho, pela D27), gengibre 90, canela 45, framboesa 40, baunilha 35.
- `rapido: true` vale só para os de dissolver ou misturar: rico, demerara, mel, agave, granadina, cordial e maracujá (este com a polpa já descongelada).
- **Rendimento:** granadina 240 e orgeat 480 são os números publicados (Punch "1 cup"; Imbibe "2 to 3 cups", usei o mínimo). Pela soma dos volumes,
  os dois provavelmente rendem mais (~360 ml e ~1 L). Cordial 360 vem do autor ("roughly 12 fl oz"). Os outros são estimados (`rendimentoEstimado: true`).

## Tipos propostos (`tipos-propostos.json`)

`nectar_agave`, `suco_roma` (categoria `mixer`, como `suco_cranberry`), `amendoa`, `agua_flor_laranja` (unidade padrão `dash`, serve ao
Ramos Gin Fizz), `fava_baunilha`, `acido_citrico`.
- Hoje `xarope_agave` tem o sinônimo "néctar de agave". Se `nectar_agave` entrar, **tire esse sinônimo** para a busca não confundir os dois.
- `docura` de `nectar_agave` = 1,5, pelo Brix da Punch (74–76° contra 50° do simples).

## Pontos para revisar em `tipos.json` (não alterei nada)

As `docura` atuais não batem com as receitas escolhidas. Estimativas pelo Brix:
- `xarope_demerara` = 1,5, mas a receita escolhida é 1:1 (≈ 1,0). O 1,5 combina com um demerara 2:1, que a Punch também cita.
- `xarope_agave` = 1,4, mas 1:1 em volume dá ≈ 0,9 (≈ 1,0 na versão da Punch).
- `xarope_mel` = 1,2, mas mel 1:1 em volume fica perto de 48° Brix (≈ 1,0).
- `xarope_framboesa` = 1, mas a receita da Imbibe é 2:1 de açúcar com fruta (≈ 1,3).

## Fontes que não puderam ser usadas

- liquor.com: bloqueia leitura automatizada. Nenhuma página foi lida.
- Punch: as URLs previsíveis (`/recipes/honey-syrup/` etc.) dão 404. Os xaropes da Punch ficam dentro das notas de receitas de drinks.
- Imbibe `lime-cordial`, `grenadine`, `orgeat`, `passion-fruit-syrup`: 404 (o orgeat está em `homemade-orgeat-recipe`).
