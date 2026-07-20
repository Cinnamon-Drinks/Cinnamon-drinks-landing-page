# Identidade Visual — Cinnamon Drinks

Resumo da IDV oficial extraído de `Brand Book _ Cinnamon Drinks.pdf`. Use este documento como referência para qualquer decisão de design, escolha de cor, tipografia ou tratamento visual no site.

**Designer responsável:** Giovanna Evaristo (Fotografia & Design)

---

## 1. Conceito da marca

Palavras-chave que guiam toda a identidade:

- **Modernidade**
- **Jovialidade**
- **Dinamicidade**
- **Sofisticação**

A marca quer transmitir que a Cinnamon Drinks é uma empresa moderna que entrega o melhor em drinks aos seus clientes. O degradê (rosa → laranja) remete às misturas e à criatividade nos sabores. O preto traz o peso de uma marca forte e impactante.

---

## 2. Paleta de cores

| # | Nome de uso | HEX | RGB aprox. | Aplicação |
|---|-------------|-----|------------|-----------|
| 1 | Preto da marca | `#000000` | `0, 0, 0` | Tipografia principal, logo monocromático, peso e impacto. **Decisão do projeto:** apesar de o brand book listar o HEX `#00324E` (azul-petróleo bem escuro) para esta cor, visualmente ele é apresentado como preto em todo o material. Optamos por usar **preto puro `#000000`** no site, para máximo contraste e fidelidade à percepção visual da marca. |
| 2 | Rosa | `#F26294` | `242, 98, 148` | Cor de destaque, jovialidade. Início do degradê. |
| 3 | Laranja | `#F2662B` | `242, 102, 43` | Cor de destaque quente, energia. Fim do degradê. |

### Degradê oficial

```
linear-gradient(90deg, #F26294 0%, #F2662B 100%)
```

Usado em: fundos de destaque, versão colorida do logo, cartão de visita (frente), fachada e materiais promocionais.

### Sugestão de tokens CSS

```css
:root {
  --color-brand-dark: #000000;
  --color-brand-pink: #F26294;
  --color-brand-orange: #F2662B;
  --color-brand-gradient: linear-gradient(90deg, #F26294 0%, #F2662B 100%);
}
```

---

## 3. Tipografia

**Fonte oficial do site:** **Outfit** (Google Fonts) — substituta da Nexa por motivos de licenciamento (ver nota abaixo).

| Papel | Peso | Uso |
|-------|------|-----|
| Fonte principal | **Outfit Bold** (700) | Títulos, headlines, CTAs, palavras de destaque |
| Fonte secundária | **Outfit Thin** (100) | Subtítulos, textos corridos delicados, sublinhas elegantes |

**Por que Outfit:**

- Sans-serif geométrica desenhada por Rodrigo Fuenzalida — perfil visual muito próximo da Nexa (mesma vibe moderna, jovial, geométrica).
- Disponível em todos os pesos de 100 (Thin) a 900 (Black), incluindo os dois pesos pedidos pela IDV (Bold + Thin).
- Licença **SIL Open Font License (OFL)** — uso comercial livre, sem custo, sem necessidade de atribuição na página, sem risco jurídico para um negócio com fins lucrativos.
- Servida diretamente pelo Google Fonts (CDN otimizado, hospedagem zero-custo).
- Página oficial: https://fonts.google.com/specimen/Outfit

### ⚠️ Por que NÃO usamos Nexa (especificada no brandbook original)

A IDV original especifica a fonte **Nexa (Fontfabric)** — Bold como principal e Thin como secundária. Em 2026-05-04, após verificação com a designer responsável pela IDV (Giovanna Evaristo), foi confirmado que **não há licença comercial da Nexa adquirida** para o projeto Cinnamon Drinks. A versão "Free for personal use" disponível em sites como dafont.com não cobre uso comercial, e a Cinnamon Drinks é um negócio com fins lucrativos. Aplicar a Nexa sem a licença exporia o projeto a notificação extrajudicial da Fontfabric, pedido de takedown e cobrança retroativa de licença + danos.

**Decisão tomada em 2026-05-04:** substituir a Nexa pela **Outfit**. A Outfit foi escolhida pelo usuário (Luís Carlos) por ser visualmente próxima da Nexa e por ter licença que elimina qualquer risco jurídico. Esta decisão deve ser validada/comunicada com a Giovanna para oficialização na IDV.

### Como aplicar no site

```html
<!-- No <head> dos HTMLs -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;700&display=swap" rel="stylesheet">
```

```css
/* No CSS */
font-family: 'Outfit', sans-serif;
/* Pesos: 100 (Thin) e 700 (Bold) */
```

**Status atual no CSS:** ✅ Outfit aplicada (substituição executada em 2026-05-04 — 17 HTMLs e 8 ocorrências em `css/cinnamon-drinks.webflow.css`).

---

## 4. Logo

O logo é composto por dois elementos:

1. **Símbolo (ícone):** taça de drink estilizada com a letra "C" inscrita no bojo da taça.
2. **Wordmark:** "CINNAMON" (em peso forte) + "DRINKS" (em peso fino, com tracking aberto), envolto por colchetes/brackets minimalistas que formam moldura.

### Variações oficiais (todas presentes no brand book)

| Variação | Quando usar |
|----------|-------------|
| **Preta sobre branco** | Aplicação primária em fundos claros, materiais impressos sóbrios, papelaria. |
| **Branca sobre degradê (rosa→laranja)** | Aplicação principal em fundos coloridos da marca, redes sociais, banners. |
| **Coral/rosa sólido sobre branco** | Variação alternativa para ambientes minimalistas claros. |
| **Apenas o ícone (taça com C)** | Favicon, avatar, selos, fachada com sinalização compacta. |

### Regras de aplicação observadas no brand book

- Manter sempre os colchetes da moldura ao redor do wordmark — eles são parte integral do logo, não decoração opcional.
- Em fundos escuros/coloridos, usar versão branca do logo.
- Em fundos claros, usar versão preta ou coral.
- Não distorcer proporções entre o ícone (taça) e o wordmark.

### Arquivos disponíveis no repositório

Localização: `images/logo/`

| Arquivo | Conteúdo |
|---------|----------|
| `logo-principal.png` | Logo completa principal (ícone da taça + wordmark "CINNAMON DRINKS"). |
| `logo-secundaria.png` | Variação secundária da logo completa. |
| `sublogo-principal.png` | Sublogo principal (versão reduzida/compacta). |
| `sublogo-secundaria.png` | Variação secundária do sublogo. |
| `marca-dagua-preta.png` | Marca d'água em preto — para sobreposições em fundos claros. |
| `marca-dagua-colorida.png` | Marca d'água colorida — para sobreposições em fundos neutros. |

**Notas técnicas:**
- Todos os arquivos atuais estão em **PNG**. Versões em **SVG** foram solicitadas à Giovanna em 2026-05-04 (entrega pendente). Quando chegarem, devem entrar nesta mesma pasta `images/logo/` e este documento será atualizado.
- Arquivos renomeados para **kebab-case sem acentos** em 2026-05-04 (originalmente vieram com espaços e caracteres acentuados, ex: `Logo principal.png`, `marca dágua preta.png`). Os nomes atuais não exigem URL-encoding e funcionam em qualquer servidor/ferramenta.

---

## 5. Materiais aplicados (referência visual do brandbook)

O brandbook mostra a IDV aplicada em:

- **Cartão de visita:** frente em degradê rosa→laranja com logo branco; verso branco com logo preto, telefone, Instagram, endereço, serviços e QR code.
- **Fachada da loja:** logo iluminado em fundo com grid de linhas pretas finas, transmitindo "Modernidade & Sofisticação".
- **Placa lateral / sinalização:** apenas o ícone da taça em círculo iluminado.

### Dados de contato oficiais (do cartão de visita)

- **Telefone:** (35) 9 9749-4991
- **Instagram:** @cinnamondrinks
- **Endereço:** Av. Dr. Silvio Menicucci, 2315 - Loja 1, Centenário
- **Serviços:** Aniversários • Casamentos • Confraternizações • Festas em geral

---

## 6. Diretrizes para o site (derivadas da IDV)

Diretrizes que devem ser seguidas ao editar o site:

1. **Cor de destaque principal:** usar o degradê oficial (`#F26294 → #F2662B`) em CTAs principais, banners, hero sections.
2. **Cor de texto principal:** preto puro `#000000` em fundos claros; branco em fundos escuros/coloridos.
3. **Tipografia:** assim que a Nexa estiver disponível, substituir todas as referências a Poppins. Bold para títulos e palavras de destaque; Thin para subtítulos elegantes e textos delicados.
4. **Tom estético:** moderno, jovem, sofisticado — evitar elementos pesados, serifados clássicos, tons terrosos ou paletas que conflitem com o degradê rosa-laranja.
5. **Elementos gráficos auxiliares:** o brandbook usa formas geométricas pretas (círculos, ondas, linhas em zigzag, faixas) sobre fundo de papel amassado em capa/contracapa — pode inspirar texturas de fundo discretas, mas não obrigatório no site.
6. **Logo no site:** usar versão monocromática (preta) no header sobre fundo claro; versão branca em hero sections com fundo em degradê.

---

## 7. Pendências relacionadas à IDV

- [x] ~~Definir fonte substituta da Nexa~~ → **Outfit** (decisão 2026-05-04).
- [x] ~~Atualizar este documento com a fonte substituta oficializada~~ → seção 3.
- [x] ~~Comunicar com a Giovanna a oficialização da Outfit na IDV~~ (informada em 2026-05-04 antes da implementação).
- [x] ~~Aplicar Outfit em `css/cinnamon-drinks.webflow.css`~~ — substituídas 8 ocorrências de `Poppins, sans-serif` por `'Outfit', sans-serif` em 2026-05-04.
- [x] ~~Trocar a fonte carregada via WebFont.load nos HTMLs~~ — 17 HTMLs atualizados de `Poppins:300,400,500,600,700` para `Outfit:100,400,500,600,700` em 2026-05-04.
- [x] ~~Verificar se as cores atuais do CSS estão alinhadas com a paleta oficial~~ → auditoria executada em 2026-05-04. **Achado original:** o CSS herdou paleta amarelo+dourado do template Webflow ("Resturanto") e nenhuma cor da marca estava aplicada. Primeira substituição feita: amarelos → rosa `#F26294`; mostardas/dourados → laranja `#F2662B`. **Decisão revisada (2026-05-04):** após preview visual, o usuário não gostou do rosa aparecendo no botão "Menu" da versão mobile e optou por **manter os elementos em branco (`#fff`) como cor padrão neutra** em vez das cores da marca. Reversão aplicada: `#F26294` → `#fff` e `#F2662B` → `#fff`. Token `--yellow` passou a valer `#fff`.
- [x] ~~Reavaliar aplicação da marca após feedback do cliente~~ → em **2026-05-19**, após validação visual em preview externo (`/tmp/cinnamon-ds-preview/`), Luís aprovou a **Abordagem B "Acento"** do design system. Branco continua default em texto e botões secundários, mas rosa volta a aparecer em pontos pontuais: `:focus-visible` (ring), links no hover, eyebrows/chips, loop SVG decorativo em "Reservar" (asset `border-gradient.svg` com `<linearGradient>` rosa→laranja) e `border-hover`. Gradient rosa→laranja aplicado em CTAs primários (`.hero-cta`, `.btn--primary`) e no botão Menu (`.btn--menu` com liquid-fill animado em CSS puro, 400ms cubic-bezier, replicando o efeito IX2 original do template). Migração faseada em 13 commits — `:root` agora contém apenas tokens IDV (primitives + semantic), com zero hex hardcoded fora dele. Spec: `docs/superpowers/specs/2026-05-19-design-system-tokens.md`. Plan executado: `docs/superpowers/plans/2026-05-19-design-system-implementation.md`.
- [x] ~~Garantir que todas as variações do logo estejam disponíveis no repo~~ → 6 PNGs em `images/logo/` (ver seção 4).
- [ ] Receber da Giovanna as versões em **SVG** das logos (solicitação feita em 2026-05-04 — aguardando entrega).
- [x] ~~Renomear arquivos da pasta `images/logo/` para kebab-case sem acentos~~ → executado em 2026-05-04.
