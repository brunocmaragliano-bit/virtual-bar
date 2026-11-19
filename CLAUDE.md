# Virtual Bar — app pessoal de bartender (PWA offline)

> **Status: Fase 2 publicada, aguardando o teste do Bruno no iPhone (2026-11-19).** Fase 1 aprovada em 2026-11-18.
> App: https://brunocmaragliano-bit.github.io/virtual-bar/ · repo: https://github.com/brunocmaragliano-bit/virtual-bar (público).
> Base `2026.11.1` consolidada com o ok do Bruno à amostra (2026-11-19): 236 drinks (IBA inteira + 132 canônicos)
> + 15 preparos, 217 tipos, 78 garrafas. 20 drinks possíveis só com as garrafas; ~44 com limões, laranja, ovos e hortelã.
> Critério de aceite da fase 2: instalado no iPhone e funcionando em modo avião → falta o ok do Bruno.
> Nunca avançar de fase sem ok explícito.

App só do Bruno para gerenciar o bar de casa e decidir o que preparar. Uso principal no
iPhone, muitas vezes sem internet. Interface em português; nomes dos drinks no original.

---

## 1. Regras de trabalho (permanentes)

1. **Não avançar de fase sem ok explícito.** Ao fim de cada fase: demo + teste offline + pedido de ok.
2. **Inteligência só na construção.** Pesquisa e IA acontecem quando eu (Claude) gero a base. No uso,
   o app roda só um motor local e determinístico sobre a base. Exceção planejada: câmera (fase 6).
3. **Nunca inventar proporção.** Sem spec confiável e com fonte, a receita não entra.
4. **Toda receita tem fonte (URL) e um nível de confiança** (ver §5.6).
5. **Texto próprio.** Modo de preparo e notas escritos com minhas palavras. Não copiar textos nem fotos de sites.
6. **Atualizar a base nunca apaga dados do usuário** (ver §6).
7. **`fotos/` é somente leitura.** Originais nunca são alterados, movidos nem apagados. Também não vão para o git.
8. **Teste offline a cada fase** (modo avião simulado + checklist no iPhone).
9. **Backlog vivo:** toda ideia nova do Bruno entra em §10 com data.
10. Versionar app e base: o app usa semver em `site/version.json` e a base usa `baseVersion` em `site/data/meta.json`.

---

## 2. Decisões de arquitetura

| # | Decisão | Por quê |
|---|---|---|
| D1 | HTML + CSS + JS puro (ES modules), sem bundler, sem framework, **zero dependências em runtime** | Pedido do Bruno; nada a quebrar offline; fácil de manter |
| D2 | Roteamento por hash (`#/receita/negroni`) | Funciona no GitHub Pages sem configurar servidor |
| D3 | GitHub Pages publicado por **GitHub Action** a partir de `site/`. A Action valida a base e roda os testes do motor antes de publicar | Base inválida não chega ao celular |
| D4 | **Service worker** com precache versionado de tudo (app + base + imagens). A lista de arquivos é gerada por `tools/precache.mjs` | 100% em modo avião depois da 1ª abertura |
| D5 | Atualização do app: o SW baixa a nova versão em segundo plano e aparece o aviso "Nova versão — atualizar" | Nunca troca o app no meio do preparo |
| D6 | Base = JSON estático em `site/data/`. Dados do usuário ficam no IndexedDB `virtualbar`, com schema próprio e versionado | As duas camadas ficam separadas (ver §6) |
| D7 | IDs da base são slugs estáveis (`negroni`, `rye_whiskey`), **nunca removidos nem reaproveitados**. Um ID obsoleto ganha `obsoleto: true` + `substituidoPor` | Referências do usuário nunca quebram |
| D8 | Volume guardado em **ml**, com a convenção **1 oz = 30 ml** (preserva as proporções das specs em oz). Dash, gota, colher de bar, unidade, folha e top são unidades próprias. Na exibição em oz, arredonda para ¼ oz | Escalar e alternar ml/oz sem distorcer |
| D9 | Ferramentas de construção em **Node** (já instalado, v24). Python não está instalado | Uma linguagem só |
| D10 | Fotos de garrafa: DNG → JPEG embutido (resolução cheia) → recorte da garrafa → WebP de ~600 px de altura (~40–60 KB) | ~100 garrafas ≈ 5 MB offline |
| D11 | Imagem de drink: 1) foto do Bruno; 2) foto de licença aberta com crédito; 3) **ilustração SVG gerada em runtime** (copo + cor + gelo + guarnição), sem peso em arquivo | Offline e leve |
| D12 | "Modo preparo" usa a Screen Wake Lock API, com fallback de vídeo mudo em loop para iOS antigo | No iOS, a tela ligada só funciona como PWA instalado a partir do 18.4 |
| D13 | `navigator.storage.persist()` + lembrete de backup se o último tiver mais de 30 dias | Reduz o risco do iOS apagar o IndexedDB |
| D14 | Pesquisa em lotes de ~50 com subagentes em paralelo. Lote bruto vai para `research/lotes/NN/`, depois validação, dedupe e amostra para o Bruno. Só então consolida em `site/data/receitas/` | Qualidade e rastreabilidade |
| D15 | Variações geradas por regra **nunca viram receita do catálogo**. Aparecem com o selo "gerada por regra · não testada". O Bruno pode salvar uma em Minhas Receitas | Não contradiz a regra 3 |

**Respostas da fase 0** (2026-11-18, Bruno aprovou os padrões propostos):

| # | Decisão |
|---|---|
| D16 | Repositório público no GitHub está ok: lista de garrafas e recortes das fotos ficam visíveis. Login no GitHub é sempre do Bruno. Como criar o repositório (instalar `gh` com permissão ou repo criado pelo Bruno) se decide na fase 2 |
| D17 | Rigor do "Posso fazer": básicos padrão = gelo, água, açúcar, sal. Substituições contam, com selo "ajuste". Guarnição não essencial não bloqueia. Preparo rápido (ex.: xarope simples) conta |
| D18 | Copos e equipamentos são só sugestão no MVP. Cadastro deles foi para o backlog |
| D19 | Frescos: "tenho hoje" pede reconfirmação sozinho depois de `validadeDias` do tipo (ex.: hortelã 5, limão 10) |
| D20 | Escopo de clássicos no MVP: todos os IBA (~100) + ~150 canônicos de referência (Death & Co, PDT, Difford's). Nenhum bar obrigatório ou vetado por enquanto |

**Confirmação do inventário** (2026-11-18, Bruno acatou todas as sugestões, com os detalhes abaixo):

| # | Decisão |
|---|---|
| D21 | Básicos "sempre tenho" (padrão do app): gelo, água, açúcar, sal, **xarope simples, tônica e água com gás** |
| D22 | Cachaça e vermute "Fernanda & Raul" (lembranças de casamento) entram com tipo genérico (`cachaca`, `vermute`) e `perfilStatus: pendente`. Tiê Prata é cachaça prata normal. Whisky of Ye Monks é **coleção**: aparece no Meu Bar, mas fica fora do "Posso fazer" (`colecao: true` no inventário). Extrato de limão vai para a despensa |
| D23 | Saquês entram numa categoria própria (`saque`) e contam para o "Posso fazer". Só vale o que aparece nas fotos; frescos e despensa o Bruno liga no app |
| D24 | Imagens de garrafa em WebP, geradas com `sharp` (devDependency só das ferramentas, nunca vai para o app). Red Label, Union, Apothek e Aperol entram como "quase acabando" (`nivel: fim`) |
| D25 | O schema é validado por `tools/validar.mjs` (Node, sem dependências), que também confere integridade referencial (tipos, famílias, receitas). Não há arquivos JSON Schema separados |
| D26 | Uma garrafa pode ter `serveComo` (substituição específica daquela garrafa, ex.: Lost Monarch serve como bourbon e como rye). Tipos podem ter `derivadoDe` (ex.: suco de limão existe se há limão) |
| D27 | Quantidade não numérica publicada vira unidade própria, nunca número inventado: `splash` (IBA "a splash of soda") e `um_pouco` (IBA "few dashes of water"). Faixa publicada (ex.: "3 a 4 oz") usa o mínimo, com `nota` citando a faixa |
| D28 | Quando o rótulo da foto e a fonte divergem no ABV, vale o rótulo (versões de mercado diferem: Campari BR 28,5% × UE 25%; Cynar BR 20% × IT 16,5%) |

**Fase 2** (2026-11-19):

| # | Decisão |
|---|---|
| D29 | Filtros: no grupo **sabor** os eixos marcados valem juntos (E): quem marca "amargo" e "herbal" quer as duas coisas. Nos outros grupos, OU dentro do grupo e E entre grupos |
| D30 | Tela ligada (revisa D12): só a Screen Wake Lock API. Sem o truque do vídeo mudo (exigiria um arquivo de vídeo binário sem ferramenta para gerá-lo). Sem suporte, o modo preparo avisa que, no iPhone, a tela fica ligada com o app instalado (iOS 18.4+) |
| D31 | Commits só com identidade escolhida pelo Bruno: o e-mail pessoal ficaria público num repo público. Sugestão: o endereço noreply do GitHub (`<id>+<usuario>@users.noreply.github.com`) |
| D32 | Frescos vencidos (D19) continuam contando no "Posso fazer", com aviso no Descobrir e um toque para reconfirmar |
| D33 | Favoritos e "já fiz" entraram já no MVP (são leves e o schema já previa). Receitas autorais continuam na fase 5 |
| D34 | `serveComo` também respeita a chave "contar substituições" (é uma substituição específica da garrafa) |
| D35 | Receita de lote (ex.: Quentão da fonte para 6) guarda `porcoesBase`. A ficha abre nessa quantidade de porções e escala a partir dela; o volume estimado é por porção |
| D36 | Mel 3:1 ou 2:1 de specs (Gold Rush, Brown Derby) usa o tipo `xarope_mel` (1:1) com `nota` citando a proporção da fonte. Um preparo próprio para mel denso fica para quando houver fonte |
| D37 | Publicação (resolve D16 e D31): GitHub CLI instalado com ok do Bruno; login dele (conta `brunocmaragliano-bit`). Repo público `virtual-bar`, Pages pela Action (`build_type: workflow`). Git deste projeto usa `Bruno Maragliano <277779003+brunocmaragliano-bit@users.noreply.github.com>` (config local, não global). `gh` fica em `C:\Program Files\GitHub CLI\gh.exe` |
| D38 | Os rótulos de lembrança de casamento ("Fernanda & Raul", 28.06.2025) foram publicados como estão, por decisão do Bruno (2026-11-19) |

**Para publicar uma versão nova:** `npm run build` → `git commit` → `git push`. A Action valida, testa, confere o precache e publica;
no celular aparece "Nova versão do app pronta · Atualizar".

## Pipeline da base (fase 1)
```
node tools/fotos/extrair-previews.mjs fotos <tmp>/full        # DNG → JPEG embutido (resolução cheia)
powershell -File tools/fotos/redimensionar.ps1 ...             # previews 1400 px p/ identificação + miniaturas
node tools/inventario/consolidar.mjs <lotes> research/inventario   # lotes de identificação → identificacao.json + revisao.html
node tools/inventario/confirmar.mjs                            # aplica a confirmação do Bruno → confirmado.json
node tools/fotos/recortar.mjs <tmp>/full [id...]               # recortes WebP 400×640 (ajustes: research/inventario/recortes-ajuste.json)
node tools/base/montar.mjs                                     # pesquisa → garrafas.json, seed, receitas, meta (log em research/pesquisa/log-montagem.md)
node tools/base/calcular.mjs                                   # ABV e volume estimados (fatores v0 provisórios)
node tools/validar.mjs                                         # schema + integridade (0 erros obrigatório)
node tools/base/checar-bar.mjs                                 # o que dá para fazer com o seed (protótipo do motor)
node tools/base/revisao-fase1.mjs                              # página de revisão com fotos embutidas
```
Pesquisa de garrafas segue `research/pesquisa/instrucoes-garrafas.md`.

## Pipeline de receitas em lotes (fase 2 em diante, D14)
```
research/lotes/NN/{lote.json, receitas.json, tipos-propostos.json, notas.md, correcoes.json}
node tools/base/lotes.mjs preparar 01 02 …     # base paralela em research/lotes/_staging/data + calcular + validar + dedupe
node tools/base/lotes.mjs amostra 01 02 …      # research/lotes/amostra.html para o Bruno revisar
node tools/base/lotes.mjs consolidar 01 02 …   # só depois do ok: copia para site/data e reescreve meta.json
npm run build                                   # calcular + validar + testes + precache do service worker
```
Método da pesquisa: `research/pesquisa/instrucoes-receitas.md`. Lista dos canônicos: `research/lotes/canonicos.md`.
Correções minhas num lote ficam em `correcoes.json` (auditável): `trocarTipo`, `tipos[].set`, `tirarSinonimos`, `receitas[].set`, `excluir`.

## App (site/)
- `js/app.js` rotas por hash + render + eventos delegados (`data-acao`, `data-input`) + folhas + avisos + atualização do SW.
- `js/estado.js` base indexada + dados do usuário (IndexedDB via `js/db.js`); seed só na 1ª abertura.
- `js/engine/` motor puro (disponibilidade, filtros, afinidade, eixos), testado em `tests/motor.test.mjs` (`npm test`).
- `js/ui/` telas: descobrir, receitas, ficha, preparo, meubar, garrafa, outras (partir, combinação, minhas, ajustes), filtros-folha, ilustracao, comum.
- `sw.js` precache com versão = hash do conteúdo (`tools/precache.mjs`); `version.json` (semver do package.json + build).
- Servidor local: `.claude/launch.json` ("app" = site/ na porta 8081; "projeto" = raiz na 8080, para as páginas de revisão).

---

## 3. Estrutura de pastas (proposta da fase 0; o estado real do app está em "App (site/)" acima)

```
virtual_bar/
  CLAUDE.md
  fotos/                    # originais DNG — somente leitura, fora do git (.gitignore)
  site/                     # tudo o que vai para o GitHub Pages
    index.html  manifest.webmanifest  sw.js  version.json  precache.json
    css/app.css
    js/
      app.js  router.js  db.js (IndexedDB)  base.js (carrega a base)  backup.js
      engine/ disponibilidade.js  afinidade.js  variacoes.js  filtros.js  random.js
      ui/ descobrir.js  receitas.js  ficha.js  preparo.js  meubar.js  minhas.js  ilustracao.js
    data/
      meta.json  eixos.json  categorias.json  tipos.json  substituicoes.json  familias.json
      garrafas.json  receitas/classicos.json  receitas/preparos.json  receitas/bares-NN.json
      seed/meu-bar.json     # inventário inicial (aplicado uma vez por aparelho)
    img/garrafas/*.webp  img/drinks/*.webp  icons/
  tools/                    # validar (schema + integridade), dedupe, calcular ABV, precache, fotos, servidor local
  research/                 # lotes brutos, fontes, amostras de revisão, decisões de exclusão
  tests/                    # testes do motor (node:test) + teste offline (Playwright)
  .github/workflows/pages.yml
```

---

## 4. Taxonomia

**Eixos de sabor** (fixos, inteiros de 0 a 5, sempre os 10):
`doce, acido, amargo, seco, herbal, frutado, defumado, picante, cremoso, umami` (umami = salgado/umami).

**Categorias** (nível 1). O `grupo` define em que aba do Meu Bar o item aparece:
- garrafas: `destilado`, `licor`, `vermute_fortificado` (vermutes, xerez, porto, quinquinas), `amaro` (inclui bitter
  aperitivo: Campari, Aperol, Cynar, fernet), `bitters`, `vinho_espumante`, `saque`, `cerveja_sidra`
- frescos: `citrico_suco`, `erva`, `fruta`, `ovo_laticinio`
- despensa: `xarope` (inclui cordiais e infusões caseiras), `especiaria`, `mixer`, `cafe_cha`, `outros`
- básicos: `basico` (gelo, água, açúcar, sal), que podem ser marcados como "sempre tenho"

**Tipos** (nível 2) formam uma árvore pelo campo `pai`. Uma receita que pede `gin` aceita qualquer descendente
(`gin_london_dry`, `gin_plymouth`...). Uma que pede `gin_old_tom` exige esse tipo ou uma substituição.

**Famílias** (proposta): `sour`, `daisy` (sour com licor: Margarita, Sidecar), `old_fashioned`,
`martini_manhattan`, `negroni`, `highball`, `fizz_collins`, `flip` (inclui nogs), `spritz`, `julep_smash`,
`tiki`, `duo_trio` (Godfather, Black Russian), `creme` (Alexander, Grasshopper), `champagne_cocktail`,
`punch_cobbler`, `quente` (Toddy, Irish Coffee).

**Técnica:** `batido`, `mexido`, `montado`, `batido_seco` (dry/reverse dry shake), `macerado`, `blender`,
`swizzle`, `throw`, `whip`. **Copo:** `coupe`, `nick_nora`, `martini`, `rocks`, `dof`, `highball`, `collins`,
`julep_cup`, `tiki_mug`, `taca_vinho`, `flauta`, `caneca_cobre`, `caneca_quente`, `shot`.
**Gelo:** `nenhum`, `cubos`, `cubo_grande`, `picado`, `bloco`.

---

## 5. Schema da base (`site/data/`)

Notação: `?` = opcional. `Perfil` = objeto com os 10 eixos, cada um inteiro de 0 a 5.

### 5.1 `meta.json`
```jsonc
{ "schemaVersion": 1, "baseVersion": "2026.11.0", "geradoEm": "2026-11-18",
  "contagens": { "tipos": 0, "garrafas": 0, "receitas": 0, "preparos": 0 } }
```

### 5.2 `tipos.json` — nível 2 (o que as receitas referenciam)
```jsonc
{ "id": "rye_whiskey", "nome": "Rye whiskey", "categoria": "destilado", "pai": "whiskey_americano",
  "sinonimos": ["rye", "whisky de centeio"],           // autocomplete e busca
  "abvTipico": 45, "perfilTipico": Perfil,            // usado quando a garrafa não tem perfil próprio
  "gruposTroca": ["destilado_envelhecido", "whiskey"],// usado pelo gerador de variações
  "docura?": 0,                                       // equivalência entre adoçantes (xarope simples 1:1 = 1.0)
  "unidade": "ml",                                    // ml | dash | gota | bsp | un | folha | fatia | pitada | top
  "perecivel?": { "validadeDias": 5 },                // frescos: quando "tenho hoje" pede reconfirmação
  "preparo?": "xarope_simples_1_1",                   // o tipo é feito em casa → aponta para a sub-receita
  "derivadoDe?": "limao_taiti",                       // existe se o tipo de origem existe (suco ← fruta)
  "obsoleto?": false, "substituidoPor?": null }
```

### 5.3 `substituicoes.json` (o que a receita pede → o que posso usar)
```jsonc
{ "de": "rye_whiskey", "para": "bourbon", "qualidade": 3,  // 3 boa · 2 ok · 1 último recurso
  "bidirecional": true,
  "nota": "Bourbon deixa o drink mais doce e redondo; o rye é mais seco e apimentado.",
  "ajuste?": [{ "tipo": "xarope_simples", "ml": 5 }],  // ex.: Old Tom ← London Dry + 5 ml de xarope
  "somenteFamilias?": ["old_fashioned", "martini_manhattan"] }
```

### 5.4 `familias.json` (regras de variação por família)
```jsonc
{ "id": "sour", "nome": "Sour", "descricao": "destilado + cítrico + adoçante, batido",
  "slots": [
    { "papel": "base",      "regras": ["trocar_mesmo_grupo", "split_base"] },
    { "papel": "acido",     "regras": ["trocar_mesmo_grupo"] },
    { "papel": "adocante",  "regras": ["trocar_por_docura"] } ] }
```

### 5.5 `garrafas.json` — nível 3 (rótulo específico)
```jsonc
{ "id": "cynar_original", "rotulo": "Cynar", "marca": "Cynar", "produtor": "Campari Group",
  "tipo": "amaro_alcachofra", "abv": 16.5, "volumeMl?": 900, "pais": "Itália", "regiao?": null,
  "composicao": "alcachofra e mais 12 ervas e plantas",  // botânicos / mash bill / idade / barril
  "perfil": Perfil, "notas": "texto curto próprio, em PT",
  "melhorUso": [
    { "alvo": "familia:negroni", "nota": 4, "frase": "Amargor mais terroso e menos doce que o Campari." },
    { "alvo": "receita:cin_cyn",  "nota": 5, "frase": "É o próprio drink." } ],
  "serveComo?": [{ "tipo": "bourbon", "qualidade": 3, "nota": "blend com bourbon na base" }],  // substituição só desta garrafa
  "foto?": "img/garrafas/cynar_original.webp", "fotoOrigem?": "20261108_154333982_iOS.dng",
  "fontes": ["https://..."], "perfilStatus": "pesquisado",   // pesquisado | pendente
  "confiancaPerfil": "alta",                                  // alta | media | baixa (pouca informação publicada)
  "revisadoEm": "2026-11-20" }
```
O status (tenho / acabou / quero comprar) **não** fica aqui: é dado do usuário (§6).

### 5.6 `receitas/*.json` — drinks e sub-receitas (preparos)
```jsonc
{ "id": "negroni", "nome": "Negroni", "nomesAlt": [], "tipoReceita": "drink",   // drink | preparo
  "familia": "negroni", "iba?": "Unforgettables",
  "ingredientes": [
    { "tipo": "gin_london_dry",            "ml": 30, "papel": "base" },
    { "tipo": "vermute_rosso",             "ml": 30, "papel": "modificador" },
    { "tipo": "bitter_aperitivo_vermelho", "ml": 30, "papel": "amargo" }
    // outras formas: { "tipo": "angostura", "qtd": 2, "unidade": "dash", "papel": "tempero" }
    //                { "tipo": "agua_com_gas", "unidade": "top", "papel": "diluidor" }, "opcional": true
    //                unidades sem quantidade: top (completar), splash, um_pouco — ver D27; "nota" explica a origem
  ],
  // papéis: base | modificador | adocante | acido | amargo | tempero | diluidor | espuma | lavagem (rinse)
  "tecnica": "mexido", "copo": "rocks", "gelo": "cubo_grande",
  "guarnicao": [{ "tipo?": "laranja", "texto": "casca de laranja", "essencial": false }],
  "passos": ["Gele o copo.", "Mexa tudo com gelo por ~20 s.", "Coe sobre o cubo grande e torça a casca."],
  "perfil": Perfil, "abv": 24, "volumeFinalMl": 115,   // ABV e volume estimados no build pela técnica
  "dificuldade": 1, "ocasioes": ["aperitivo", "noite"], // aperitivo | digestivo | verao | festa | brunch | noite | sobremesa | inverno
  "origem": { "classico": true, "ano": 1919, "cidade": "Florença", "bar": "Caffè Casoni", "bartender?": null },
  "fontes": [{ "url": "https://iba-world.com/...", "titulo": "IBA — Negroni", "acessadoEm": "2026-11-20" }],
  "specFonte": "30 ml Gin, 30 ml Bitter Campari, 30 ml Sweet Red Vermouth",  // spec como publicada, para auditoria
  "confianca": "spec_publicada", "estimativa": "v0",   // versão dos fatores usados no ABV/volume
  "imagem?": { "arquivo": "img/drinks/negroni.webp", "credito": "...", "licenca": "CC BY-SA 4.0", "url": "..." },
  "cor": "#b3262d",                // usado pela ilustração quando não há imagem
  "porcoesBase?": 1,               // a spec da fonte rende N porções (D35)
  "variacaoDe?": null, "tags": [] }

// Preparo (sub-receita): mesmos campos, mais:
{ "tipoReceita": "preparo", "produz": "xarope_simples", "rendimentoMl": 250,
  "tempoMin": 5, "validadeDias": 30, "rapido": true }   // rapido = dá pra fazer na hora
```
**Níveis de confiança:**
- `spec_publicada`: a spec foi publicada pelo próprio bar ou bartender, ou pela IBA no caso dos clássicos.
- `adaptacao_publicada`: uma fonte secundária confiável (Difford's, Punch, Imbibe, livro do bar) publicou a spec atribuída ao bar.
- `reconstrucao`: um terceiro identificado publicou a reconstrução do drink com proporções. Uma reconstrução minha nunca entra.

### 5.7 `seed/meu-bar.json`
Lista de `{ garrafa | tipo, status }` aplicada **só se o inventário do aparelho estiver vazio** (1ª abertura).

---

## 6. Dados do usuário (IndexedDB `virtualbar`)

| Store | Chave | Conteúdo |
|---|---|---|
| `inventario` | id da garrafa, `u:<uuid>` ou id do tipo (frescos e despensa) | `status` (tenho / acabou / quero), `tenhoHoje` e `desde` (frescos), `nivel?` (cheia / metade / fim), `colecao?` (fora do "Posso fazer"), `notas`, `atualizadoEm` |
| `garrafasUsuario` | `u:<uuid>` | mesmo schema de garrafa, com `perfilStatus: "pendente"` e `vinculadaA?` (quando a base passar a ter a garrafa) |
| `receitasUsuario` | `u:<uuid>` | mesmo schema de receita, com `baseadaEm?`, `fotoId?`, `criadaEm`, `editadaEm` |
| `registros` | id da receita (base ou usuário) | `favorito`, `avaliacao` (0–5), `notas`, `historico: [{ em, garrafasUsadas, porcoes, nota }]` |
| `fotos` | uuid | blob da foto (receitas autorais) |
| `prefs` | chave | unidade, porções padrão, básicos "sempre tenho", "contar substituições", última base vista, último backup, filtros salvos |

**Garantias de atualização da base:**
1. A base nunca escreve nos stores do usuário. O único caso é o seed, só na primeira abertura com inventário vazio.
2. Os dados do usuário apontam para IDs estáveis, e a base nunca remove um ID (D7).
3. A cada carga da base roda uma reconciliação: uma referência sem alvo vira cópia em `garrafasUsuario`/`receitasUsuario`. Nada é descartado.
4. O IndexedDB tem migração própria (`userSchemaVersion`), independente da `baseVersion`.

**Backup:** `virtualbar-backup-AAAA-MM-DD.json` = `{ app, userSchemaVersion, baseVersion, exportadoEm, stores }`,
com fotos em base64. A importação mostra uma prévia das contagens e pede **mesclar** (padrão, por id, o mais recente vence)
ou **substituir**. Exporta pela folha de compartilhar do iOS (salvar no Arquivos ou no iCloud).

---

## 7. Motor local (determinístico)

**Disponibilidade de um ingrediente do tipo T**, em ordem:
1. *exato*: tenho uma garrafa do tipo T ou de um descendente, ou o fresco/despensa T está marcado "tenho hoje";
2. *básico*: T está nos básicos "sempre tenho";
3. *preparo rápido*: T tem preparo `rapido` e eu tenho todos os insumos → "prepare antes: xarope simples";
4. *substituição*: uma regra `de: T` cujo `para` está disponível. Fica a de maior qualidade, com nota e ajuste;
5. *falta*.
Ingrediente opcional e guarnição não essencial não bloqueiam.

**Status da receita:** `pronto` (só 1–2) · `com_ajuste` (alguma 3–4) · `falta_1` · `falta_n`.
"Posso fazer" = pronto + com_ajuste (com selo; um toggle restringe a "só exato"). "Falta 1" mostra o que falta
e quais garrafas da base resolveriam.

**Afinidade garrafa × receita** (função 6):
`0,5 · melhorUso(receita, senão família) + 0,5 · cosseno(perfil da garrafa, perfil da receita)`, normalizado de 0 a 100.
Só entram receitas em que o tipo da garrafa ocupa algum slot (exato, ou por substituição com penalidade).

**Melhor garrafa** (função 8): quando tenho mais de uma garrafa que serve no slot, ganha a de maior afinidade.
A frase vem de `melhorUso.frase`. Sem frase, um template monta a explicação com os 2 eixos que mais pesaram
("Mais seca e cítrica que o Tanqueray — combina com o perfil ácido do drink.").

**Variações** (função 9): (a) catalogadas, pelo campo `variacaoDe`; (b) geradas pelas regras do slot da família:
trocar a base por outra garrafa minha do mesmo `gruposTroca`, split base (½ + ½ de duas bases), trocar o
modificador e trocar o adoçante pela `docura` (ml ajustado, arredondado a 2,5 ml). Saem só com garrafas que tenho,
ordenadas por afinidade, no máximo 6 por receita, com o selo de D15.

**Random:** sorteio uniforme no pool "Posso fazer" com os filtros ativos, evitando as últimas 5 sorteadas.

**Filtros:** E entre grupos, OU dentro do grupo. Grupos: sabor (eixo ≥ 3), família, destilado base (derivado do
papel `base`), fresco/erva/especiaria, técnica, teor (leve < 12% · médio 12–20% · forte > 20%), ocasião.

**Combinação** (função 5): receitas que contêm **todos** os tipos escolhidos (com herança de tipo), mostrando a spec inteira.

**ABV estimado:** calculado no build, `Σ(ml × abv) / (Σml + diluição)`, com fator de diluição por técnica. Os fatores
serão calibrados com referências publicadas na fase 2.

---

## 8. UX

- Mobile-first, modo escuro por padrão, 4 abas na barra inferior: **Descobrir · Receitas · Meu Bar · Minhas Receitas**.
- Uso com uma mão: ações principais na metade de baixo, **campo de busca colado acima da barra de abas**,
  folhas (bottom sheets) para filtros e escolhas, alvos de toque ≥ 44 px.
- Ficha de receita: imagem, chips (família · copo · ABV), perfil em barras, ingredientes com seletor ml/oz e porções,
  garrafa sugerida em cada linha + "por quê", passos, origem/fonte/confiança, variações, botão **Modo preparo**.
- Modo preparo: tela cheia, fonte grande, ingredientes com check, um passo por vez, tela sempre ligada.
- Minhas Receitas reúne Autorais · Favoritos · Histórico. Ajustes (unidades, básicos, backup) ficam no ícone de engrenagem do Meu Bar.

---

## 9. Roadmap

| Fase | Entrega | Critério de aceite |
|---|---|---|
| 0 | Perguntas, plano, schema, wireframe (este documento) | ok do Bruno |
| 1 | Inventário pelas fotos: lista para confirmar (com as ilegíveis e duvidosas sinalizadas) → perfil pesquisado de cada garrafa → `garrafas.json` + recortes WebP + `seed/meu-bar.json` + tipos e substituições necessários + **10 receitas de exemplo que já posso fazer** | Bruno confirma a lista e as 10 receitas; tudo valida no schema |
| 2 | MVP: app + clássicos (todos os IBA + canônicos) + Meu Bar populado + filtros + Posso fazer / Falta 1 + Random + Combinação + Partir de uma garrafa + ficha + modo preparo; repositório git + deploy no Pages | Instalado no iPhone, funciona em modo avião |
| 3 | Melhor garrafa por receita + variações (catalogadas e geradas) | Revisão de amostra pelo Bruno |
| 4 | Pesquisa dos bares em lotes de ~50 (50 Best global e regionais, Spirited Awards, bares de referência, SP) | Amostra aprovada por lote |
| 5 | Minhas Receitas (criar / editar / duplicar, foto), favoritos, avaliação, histórico, backup, imagens dos drinks | Backup → limpar → restaurar sem perda |
| 6 | Cadastro por foto dentro do app (API da Claude, chave só no aparelho) + extras do backlog | — |

---

## 10. Backlog (ideias do Bruno)

- 2026-11-18 — Próxima garrafa que destrava mais drinks
- 2026-11-18 — Lista de compras (itens "quero comprar" + o que falta para os favoritos)
- 2026-11-18 — Escalar receita para N pessoas / batch (com diluição pré-calculada)
- 2026-11-18 — Cardápio da noite
- 2026-11-18 — Câmera no app: classificação básica + "perfil pendente" para garrafa fora da base
- 2026-11-18 — Cadastro de copos e equipamentos (liquidificador, sifão, nick&nora...) filtrando o "Posso fazer"

---

## 11. Riscos e pontos de atenção

- **iOS:** a tela sempre ligada (Wake Lock) só funciona em PWA instalado a partir do iOS 18.4, por isso o fallback (D12).
  O iOS pode limpar o armazenamento de sites, por isso persist() + backup (D13).
- **Repositório público:** o GitHub Pages grátis exige repo público. A lista de garrafas e os recortes das fotos ficam
  visíveis. Inventário pessoal, notas e receitas autorais ficam só no aparelho.
- **OneDrive + git:** um `.git` dentro do OneDrive funciona, mas a sincronização pode travar arquivos durante operações grandes.
- **Fotos:** 114 DNG (~1,6 GB) — nunca no git. Extração do preview já testada.
- **Ferramentas:** `gh` (GitHub CLI) instalado em 2026-11-19 (fora do PATH das sessões antigas; usar o caminho completo). Login no GitHub é sempre do Bruno.
- **Direitos:** proporções e listas de ingredientes são fatos; passos, notas e imagens são próprios ou de licença aberta com crédito.

## 12. Pendências técnicas da base

- Fatores de diluição do ABV são provisórios (`estimativa: v0`) → calibrar na fase 2.
- 3 perfis pendentes (Fernanda & Raul ×2, Orlandoni) e 15 de confiança baixa: revisar quando houver informação ou prova do Bruno.
- Whisky of Ye Monks: se for engarrafado no Brasil, trocar para `whisky_brasileiro` (sem fonte que ligue a Union à marca).
- Bittermens Hellfire é um shrub de vinagre: avaliar um tipo próprio (`tempero_picante`/`shrub`).
- ~~29 receitas citadas em `melhorUso` entram com os clássicos da fase 2~~ → resolvido na base 2026.11.1.
- Fontes mais fracas da base 2026.11.1, para revisar quando houver melhor: Bombeirinho (coluna de jornal regional), Kentucky Mule (VinePair),
  Cynar Flip (Tuxedo No.2 citando Morgenthaler). Screwdriver, Salty Dog e Harvey Wallbanger seguem a versão do Difford's (com xarope e bitters).
- Preparos possíveis no futuro: mel 3:1 (Gold Rush) e 2:1 (Brown Derby) — hoje usam `xarope_mel` 1:1 com nota (D36).
- `tools/base/montar.mjs` agora só mexe em garrafas, seed e meta; receitas entram só por lotes.
- Busca na web dos subagentes tem cota por sessão: lotes grandes de pesquisa (fase 4) devem ser divididos ao longo do tempo.
