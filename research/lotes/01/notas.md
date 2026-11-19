# Lote 01 — IBA "The Unforgettables"

Pesquisado em 2026-11-19. Fonte principal: a página oficial de cada drink em `iba-world.com/iba-cocktail/<slug>/`,
baixada e lida na íntegra (ingredientes, método, guarnição e notas). Todas as receitas: `confianca: spec_publicada`,
`iba: "Unforgettables"`. A segunda fonte (Punch ou Difford's) serve só para história e origem; a spec é sempre a da IBA.

## Lista
A categoria tem 34 drinks (`iba-world.com/cocktails/the-unforgettables/`, páginas 1 e 2). Seis já estão na base
(negroni, americano, manhattan, old_fashioned, hanky_panky, boulevardier). O rabo_de_galo é Contemporary Classics, não entra aqui.
**Entram 28:** alexander, angel_face, aviation, between_the_sheets, brandy_crusta, casino, clover_club, daiquiri, martini (Dry Martini),
gin_fizz, john_collins, last_word, martinez, mary_pickford, monkey_gland, paradise, planters_punch, porto_flip, ramos_fizz,
remember_the_maine, rusty_nail, sazerac, sidecar, stinger, tuxedo, vieux_carre, whiskey_sour, white_lady.
**Nenhum drink ficou de fora.**

## Tipos propostos (`tipos-propostos.json`)
- `caldo_cana` (citrico_suco, perecível 1 dia): o Planter's Punch da IBA (versão atual) pede "sugar cane juice". Deixei sem `docura`
  porque não achei uma equivalência publicada com o xarope simples. Talvez valha uma substituição `caldo_cana → xarope_simples`
  (qualidade 1–2, com outro ml), mas isso precisa de fonte ou de um teste do Bruno.
- `agua_flor_laranjeira` (outros, dash) e `extrato_baunilha` (outros, gota): os dois são do Ramos Fizz.

## Decisões de mapeamento
- "Apricot Brandy" (Angel Face, Paradise) → `licor_damasco`. No uso da IBA é o licor de damasco, não um destilado.
- "Cherry Brandy Luxardo" (Remember the Maine) → `licor_cereja`.
- "Brandy" (Brandy Crusta, Porto Flip) → `conhaque` (genérico). "Cognac" → `cognac`.
- "Curacao" (Brandy Crusta) → `curacao_laranja`, pela fidelidade à spec. Se isso bloquear demais o "Posso fazer", troque para `licor_laranja`.
- "Triple Sec" → `licor_laranja`. "White Crème de Menthe" → `licor_menta`. "Crème de Cacao (Brown)" → `licor_cacau_escuro`.
- "Dry Gin" (Monkey Gland) → `gin`, com nota. Qualquer gin seco serve, só o Old Tom fica de fora.
- "Red Tawny Port" (Porto Flip) → `porto_tawny`. "Scotch Whisky" (Rusty Nail) → `scotch` (genérico).
- "1 Tablespoon" (Monkey Gland) → 15 ml, com nota.
- Quantidades que não são números (regra 5 / D27):
  - Clover Club: "few drops of egg white" → `um_pouco`.
  - Whiskey Sour: a mesma clara, como `um_pouco` com `opcional: true`.
  - Gin Fizz: "splash of soda" → `splash`.
  - Ramos Fizz: "Soda Water" sem quantidade → `top`.
  - Planter's Punch: "add dilution up to taste" → `agua` como `um_pouco`, opcional.
- Porto Flip: a IBA pede **10 ml** de gema, então ficou `ovo_gema` com `ml: 10`, mesmo que o tipo use `un`.
- Daiquiri: "2 bar spoons superfine sugar" → `acucar` com `qtd: 2, unidade: bsp`.
- Sazerac e Remember the Maine: o absinto da lavagem tem papel `lavagem`, porque a IBA manda descartar o excesso.
- Ramos Fizz: técnica `batido_seco`. A IBA manda bater 2 min com gelo e depois 1 min sem gelo, ou seja, um reverse dry shake.
- Brandy Crusta: técnica `mexido`, porque a IBA diz "mix ... in a mixing glass". Muitas fontes batem esse drink.
  A crosta de açúcar e a casca forrando o copo são a identidade do drink, então as duas guarnições estão com `essencial: true`.
  Na casca usei o tipo `limao_siciliano`, que o drink já exige pelo suco, para não bloquear sem necessidade.
- Copos fora do vocabulário:
  - Brandy Crusta: o "slim cocktail glass" virou `nick_nora`.
  - Whiskey Sour: a IBA serve em "cobbler glass" sem gelo, ou "on the rocks". Escolhi `rocks` + `cubos`, e os passos citam a outra opção.
  - John Collins: a IBA diz highball, então ficou `highball`, não `collins`.
- Famílias discutíveis:
  - Mary Pickford, Paradise e Angel Face não têm cítrico forte.
  - Mary Pickford e Paradise ficaram em `daisy`, porque são adoçados com licor.
  - Angel Face ficou em `duo_trio`.
  - Monkey Gland ficou em `sour`.
- `variacaoDe`:
  - between_the_sheets → sidecar: o Punch chama de "riff on the Sidecar".
  - tuxedo → martini: o Difford's diz "riff on a Fifty-Fifty Dry Martini".

## Divergências e dúvidas
- **Monkey Gland:** a IBA pede 1 colher de sopa (~15 ml) de absinto. O Difford's cita a versão de 1923 do MacElhone com só
  "1 dash". Mantive a IBA, mas vai sair um drink bem anisado. Vale o Bruno provar antes.
- **Sazerac:** a IBA usa Cognac e diz que o rye veio depois da Guerra Civil. O Punch diz que essa tese do Cognac original
  "foi praticamente descartada" e usa rye. A spec ficou com o Cognac da IBA. Se o Bruno quiser a versão com rye, ela entra
  como receita própria, com a fonte do Punch.
- **Ramos Fizz:** sobre o bar de origem, a IBA diz Meyer's Table d'Hôtel Internationale (1888) e o Punch diz Imperial Cabinet
  Saloon (1888). Ficou o bar da IBA em `origem`.
- **Mary Pickford:** a página da receita no Difford's diz Hotel Nacional de Cuba, e outra página do próprio Difford's diz
  Hotel Sevilla-Biltmore. Por isso `bar: null`, e ficaram só Havana e Fred Kaufman. O Difford's também diz que a receita de 1928
  não tinha marasquino; a IBA tem.
- **Monkey Gland (origem):** o Difford's diz "fim dos anos 1920", mas também que a receita aparece no livro de 1922. Por isso `ano: null`.
- **Martinez:** a IBA pede London Dry, e o Punch diz que a tradição é Old Tom. Ficou London Dry, com nota.
- **Vieux Carré:** a IBA lista só Peychaud's, e muitas versões levam também Angostura. Ficou como a IBA.
- **Stinger:** a IBA mexe o drink. O Punch publica uma versão própria, batida e com hortelã, que não foi usada.
- **Planter's Punch:** a IBA trocou a versão antiga (com sucos de laranja e abacaxi, granadina e Angostura) por esta,
  com caldo de cana. Usei a atual.
- **Tom Collins:** a página do John Collins diz "use Old Tom Gin for Tom Collins". Isso sustenta um `tom_collins`
  (as mesmas medidas, com `gin_old_tom`). Não criei a receita porque a IBA não lista o drink à parte; fica para o lote de canônicos.

## Origem
Só preenchi o que a fonte secundária afirma:
- **Punch:** aviation, brandy_crusta, clover_club, last_word, vieux_carre, sazerac e white_lady.
- **Difford's:** monkey_gland e mary_pickford.
- **Página da própria IBA:** ramos_fizz.

Com atribuição incerta, os campos ficaram em `null`, e tuxedo, sidecar, between_the_sheets e martinez ganharam a tag `historia_disputada`.
Sem fonte secundária de história (origem toda em `null`): angel_face, casino, paradise, porto_flip, rusty_nail, john_collins, whiskey_sour, planters_punch.

## Pendências para a consolidação
- `abv` e `volumeFinalMl` ficaram em branco, de propósito: quem preenche é `tools/base/calcular.mjs`.
- Antes de consolidar, os 3 tipos propostos precisam entrar em `site/data/tipos.json`.
