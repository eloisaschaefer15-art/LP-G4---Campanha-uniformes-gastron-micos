# LP G4 Uniformes · Campanha Fim de Ano: Bares e Restaurantes 2026

Landing page estática (HTML/CSS/JS puro, sem build). Abrir `index.html` por um servidor local:

```
python -m http.server 8000
```

→ http://localhost:8000

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Todo o conteúdo (textos, alt das imagens, links) |
| `css/style.css` | Cores, fontes, layout e animações |
| `js/script.js` | Configuração (`CONFIG` no topo), WhatsApp, contador, menu, carrossel, animações |
| `assets/` | Imagens, vídeo, logos, fontes |

---

## Trocar o número do WhatsApp

`js/script.js`, no topo:

```js
whatsappNumber: "55XXXXXXXXXXX",
```

Só dígitos: `55` + DDD + número (ex.: `5545999999999`). Todos os botões da página usam esse número.

## Trocar a data-limite

`js/script.js`:

```js
deadline: "2026-10-15T23:59:59-03:00",
afterDeadline: "message", // ou "hide"
```

- Mantenha o `-03:00` (horário de Brasília). O contador fica certo em qualquer fuso do visitante.
- Depois do prazo: `"message"` troca o texto da barra por *"Fale com um consultor e confira a agenda de produção"*; `"hide"` esconde a barra. Em ambos os casos o contador grande da seção 7 some.
- **A data "15/10" também aparece escrita nos textos** (barra, seção 2, seção 7, meta description). Se mudar o prazo, procure `15/10` no `index.html` e troque também.

## Links por canal (`?c=`)

A mensagem do WhatsApp ganha "(via …)" conforme o parâmetro `c` da URL. O canal fica guardado durante a visita, mesmo navegando pelas âncoras.

URL base atual (GitHub Pages, até ter domínio próprio):
`https://eloisaschaefer15-art.github.io/LP-G4---Campanha-uniformes-gastron-micos/`

| Canal | Link | Mensagem enviada |
|---|---|---|
| Instagram (bio, stories) | `…/?c=ig` | …bares e restaurantes (via Instagram) |
| TikTok | `…/?c=tt` | …(via TikTok) |
| LinkedIn | `…/?c=li` | …(via LinkedIn) |
| Anúncios pagos | `…/?c=ads` | …(via Anúncio) |
| QR code do flyer | `…/?c=qr` | …(via Material impresso) |
| Parceria Abrasel | `…/?c=abrasel` | …(via Abrasel) |

Sem `?c=` (ou com código desconhecido), vai só a mensagem base. Para criar um canal novo, acrescente uma linha em `CONFIG.channels`.

## Textos

Todos os textos estão no `index.html`, na ordem das seções (há um comentário `<!-- ===== N. NOME ===== -->` antes de cada uma). O `<title>` e a descrição de busca/compartilhamento ficam no `<head>`.

## Fontes

**Hoje:** Figtree (400/500/700/800) como substituta da Texta + IBM Plex Mono, ambas pelo Google Fonts (`<link>` no `<head>` do `index.html`).

**Ativar a Texta:**
1. Coloque os arquivos em `assets/fonts/`: `texta-book.woff2` (400), `texta-medium.woff2` (500), `texta-bold.woff2` (700), `texta-heavy.woff2` (800).
2. No topo do `css/style.css`, descomente os quatro `@font-face` da Texta.
3. No `<head>` do `index.html`, descomente os dois `<link rel="preload">` (Heavy e Book, usados acima da dobra).
4. Opcional: tire `Figtree:wght@400;500;700;800&` da URL do Google Fonts.

**IBM Plex Mono local (opcional):** coloque `ibm-plex-mono-400.woff2` e `ibm-plex-mono-500.woff2` em `assets/fonts/`, descomente os `@font-face` correspondentes no CSS e remova `&family=IBM+Plex+Mono:wght@400;500` da URL do Google Fonts. Se as duas saírem do Google, apague também os dois `<link rel="preconnect">`.

## Assets

Enquanto um arquivo não existe, o lugar dele aparece como bloco cinza com o nome esperado. **Basta salvar o arquivo com o nome e a pasta exatos**; não precisa mexer no HTML.

| Pasta | Arquivos esperados | Onde aparece | Formato sugerido |
|---|---|---|---|
| `assets/brand/` | `logo-g4-branco.svg` | Menu e rodapé (hoje usam `simbolo-g4.svg`, ver abaixo) | SVG branco |
| | `logo-g4.svg` | Reserva (versão para fundo claro) | SVG |
| | `favicon.svg` | Aba do navegador (já existe: símbolo G4 exportado do Figma) | SVG |
| | `apple-touch-icon.png` | Ícone ao salvar no iPhone | PNG 180×180 |
| | `og-image.jpg` | Prévia do link no WhatsApp/redes | JPG 1200×630 |
| `assets/hero/` | `hero-loop.mp4` | Hero, 1º slide | MP4 H.264, sem áudio, ≤ 4 MB, 1920×1080 |
| | `hero-poster.webp` | Hero, primeiro frame e versão estática | WebP 1920×1080 |
| | `hero-01.webp` … `hero-04.webp` | Hero, slides 2 a 5 | WebP 1920×1080 |
| `assets/produtos/` | `cozinha-dolma`, `cozinha-touca`, `cozinha-calca`, `cozinha-avental`, `salao-camisa`, `salao-avental` (`.webp`) | Seção Produtos | WebP 800×1000 (4:5), peça **em uso** |
| `assets/case/` | `case-01.webp` (vertical) + `case-02` … `case-04.webp` (horizontais) | Seção Clientes, galeria do case | WebP 1200×1500 e 1200×900 |
| `assets/clientes/` | `quinta-da-oliva`, `pateo-du-fogo`, `luigia-pizzaria`, `don-ritter`, `dom-aureo` (`.svg`) | Letreiro "Quem já atendemos" | SVG **monocromático em `#0A2447`** |

Observações:
- **Logo completo:** o arquivo do Figma só expôs o símbolo (ícone laranja), salvo em `assets/brand/simbolo-g4.svg`. Quando tiver `logo-g4-branco.svg`, troque o `src` no menu e no rodapé do `index.html` (há um comentário `TODO` em cada lugar) e ajuste `width`/`height`.
- **Nomes do case:** o nome do cliente do case não aparece em nenhum lugar da página, nem no nome dos arquivos. Mantenha `case-01…04`.
- **Logos de clientes:** enquanto o SVG não existir, aparece o nome em texto. Os logos não ganham cor no hover, então exporte já em navy.
- **Imagens com proporção diferente** são recortadas para caber (`object-fit: cover`); se mudar o tamanho real, atualize `width`/`height` no `<img>`.
- **og-image:** o WhatsApp não lê caminho relativo. No deploy, troque `assets/brand/og-image.jpg` nas tags `og:image` e `twitter:image` pela URL completa do site.
- **Depoimento:** há um modelo pronto e comentado na seção Clientes do `index.html` (citação, nome, cargo, restaurante, foto ou vídeo).

## Pendências (`TODO` no código)

- Número do WhatsApp (`js/script.js`)
- Links de Instagram e LinkedIn (rodapé do `index.html`)
- Telefone, endereço e CEP no JSON-LD (`<head>` do `index.html`)
- URL absoluta da `og-image` (depois do deploy)
- Meta Pixel / Google Tag: espaço comentado no `<head>`
- Domínio próprio (arquivo `CNAME` só na Etapa 5)

## Auditoria

Lighthouse via `npx` (não vira dependência do projeto):

```
npx lighthouse http://localhost:8000 --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --view
```
