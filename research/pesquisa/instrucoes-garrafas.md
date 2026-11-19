# Instruções de pesquisa — perfil de garrafas

Método usado para preencher `site/data/garrafas.json`. Vale para a fase 1 e para garrafas novas depois.
Contexto do projeto: `CLAUDE.md` (schema da garrafa em §5.5, regras em §1).

## Regras
1. **Toda informação factual tem fonte.** Prefira, nesta ordem: site do produtor ou importador, ficha técnica,
   e só depois boas referências independentes (Difford's Guide, Distiller, Whisky Advocate, Master of Malt, The Whisky Exchange,
   Punch, Imbibe, Diffords, Wine-Searcher, lojas especializadas com ficha detalhada). Guarde as URLs que você realmente usou.
2. **Nunca invente.** ABV, volume, idade, botânicos e mash bill vêm do rótulo (dado lido na foto) ou de fonte. Se não achar, use `null`.
   O ABV lido no rótulo da foto vale mais que o de fonte genérica (pode ser versão de mercado diferente); se divergir, registre em `observacoes`.
3. **Texto próprio, em português.** `notas` e `frase` com suas palavras. Não copie frases de sites, nem traduza literalmente.
4. **Perfil calibrado.** Leia as âncoras de cada eixo em `site/data/eixos.json` e use a escala inteira (0–5, inteiros).
   Compare as garrafas do seu lote entre si: duas garrafas parecidas devem ter perfis parecidos, e a diferença tem que fazer sentido.
   O perfil descreve a garrafa pura, não um drink.
5. **Tipo.** Cada garrafa tem um `tipoSugerido` (ids de `site/data/tipos.json`). Mantenha, ou troque por outro id que **já exista** nesse
   arquivo se a pesquisa mostrar que outro é mais correto (ex.: vermute genérico → `vermute_rosso`). Explique trocas em `observacoes`.
   Se nenhum tipo existente servir, mantenha o sugerido e proponha o novo tipo em `observacoes`.
6. **Garrafas com `perfilPendente: true`** (sem fabricante conhecido): não pesquise fabricante. Use o `perfilTipico` do tipo, ajustado só pelo
   que a foto mostra (cor, rótulo), `fontes: []` e `perfilStatus: "pendente"`.

## Melhor uso
`melhorUso` é uma lista de 3 a 6 itens com os usos em que essa garrafa se destaca:
- `alvo`: `familia:<id>` (ids de `site/data/familias.json`) ou `receita:<id>`, usando só ids desta lista de receitas-âncora:
  `negroni, americano, manhattan, old_fashioned, martini, boulevardier, hanky_panky, toronto, rabo_de_galo, gin_tonica,
  highball_whisky, rob_roy, penicillin, sazerac, daiquiri, margarita, caipirinha, paloma, pisco_sour, mezcal_negroni, last_word,
  aperol_spritz, bitter_giuseppe, cin_cyn, black_manhattan, vieux_carre, mai_tai, french_75, tom_collins, gimlet, bramble,
  white_negroni, rosita, negroni_sbagliato, bamboo, adonis, milano_torino, sake_martini, mizuwari`
- `nota`: 5 = referência para esse uso · 4 = muito bom · 3 = funciona bem. Não liste usos abaixo de 3.
- `frase`: uma frase curta (até ~140 caracteres) dizendo **por que** ela funciona ali, comparando com o padrão do drink
  (ex.: "Mais seco e de zimbro firme: segura o Campari sem sumir."). Sem marketing.
- Use as fontes (recomendações do produtor, reviews, specs de bares que citam a garrafa) e o seu conhecimento de coquetelaria.

`serveComo` (opcional): quando essa garrafa específica substitui bem outro tipo (ex.: um blend de bourbon e rye serve como os dois;
um whisky japonês turfado serve como `scotch_turfado`). `qualidade` 3 boa · 2 ok · 1 último recurso, e uma `nota` curta.

## Saída (uma entrada por garrafa do lote, na mesma ordem)
```jsonc
{
  "id": "mantém o id recebido",
  "rotulo": "nome de exibição limpo, ex.: 'Carpano Antica Formula'",
  "marca": "...", "produtor": "... ou null",
  "tipo": "id de site/data/tipos.json",
  "abv": 16.5, "volumeMl": 1000, "pais": "Itália", "regiao": "Piemonte ou null",
  "composicao": "botânicos / mash bill / base / idade / barril / matéria-prima, em PT, curto; null se não houver",
  "perfil": { "doce": 0, "acido": 0, "amargo": 0, "seco": 0, "herbal": 0, "frutado": 0, "defumado": 0, "picante": 0, "cremoso": 0, "umami": 0 },
  "notas": "2 a 3 frases próprias: estilo, aromas e boca, o que esperar num drink",
  "melhorUso": [{ "alvo": "receita:negroni", "nota": 4, "frase": "..." }],
  "serveComo": [],
  "fontes": ["https://..."],
  "perfilStatus": "pesquisado | pendente",
  "confiancaPerfil": "alta | media | baixa",
  "observacoes": "trocas de tipo, divergências de ABV, dúvidas; null se nada"
}
```
Grave um array JSON e confira que ele é válido:
`node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <arquivo>`
