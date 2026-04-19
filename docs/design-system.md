# Design System — Git Viz

## Visão Geral

Este documento descreve o processo de criação e importação do Design System da aplicação **Git Viz**, utilizando o **Claude Design** (`claude.ai/design`) como ferramenta de prototipação e o **Claude Code** para implementação no projeto.

---

## 1. Inventário Visual

O ponto de partida foi um inventário completo dos componentes visuais existentes na aplicação, documentado em [`docs/visual-inventory.md`](./visual-inventory.md).

O inventário levantou:

- **12 tokens CSS** já definidos em `:root` (cores, glow, bordas)
- **8 componentes de UI** (Toolbar, Botões, Modal, CommitCard, HistoryPanel, SVG Graph, Hint, Scrollbar)
- **4 animações** (`fadeIn`, `scaleIn`, `slideIn`, `pulse`)
- **5 lacunas** a resolver no Design System

### Lacunas identificadas

| #   | Problema                                                   | Solução aplicada                                                            |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Tokens faltantes (espaçamento, tipografia, raios, z-index) | Escala 4px, escala tipográfica 12–32px, `--radius-*`, `--z-*`               |
| 2   | 4 variantes de glow soltas e inconsistentes                | 3 tokens canônicos: `--glow-sm`, `--glow-md`, `--glow-lg` + `--glow-purple` |
| 3   | `BranchTag` sem spec de cor por tipo                       | Tokens `--tag-head-*`, `--tag-main-*`, `--tag-feature-*`, `--tag-fix-*`     |
| 4   | Estado vazio no `HistoryPanel` ausente                     | Componente `history-empty` com ícone, texto e subtexto                      |
| 5   | Erros via `alert()` nativo                                 | Componente `Toast` com variantes `success`, `error`, `warning`              |

---

## 2. Criação no Claude Design

### Prompt utilizado

> _"Crie um Design System considerando as informações contidas no arquivo `visual-inventory.md` que foi anexado. Fique atento à seção que descreve as 'Lacunas a definir no Design System'. Se precisar de mais informação basta pedir."_

O arquivo [`docs/visual-inventory.md`](./visual-inventory.md) foi anexado diretamente na interface do Claude Design.

### O que foi gerado

O Claude Design produziu **19 cards** organizados em 4 grupos:

| Grupo          | Cards                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| **Colors**     | Fundos, Accent, Semânticas, Texto                                                    |
| **Type**       | Escala tipográfica, Famílias + pesos                                                 |
| **Spacing**    | Escala 4px, Raios, Glow/Sombras, Z-index                                             |
| **Components** | Botões, Inputs, Branch Tags, Toast, Superfícies, History Panel, Grafo SVG, Animações |
| **Brand**      | UI Kit interativo completo                                                           |

**Arquivos-chave gerados:**

- `colors_and_type.css` — todos os tokens CSS em um único arquivo importável
- `ui_kits/git-viz/index.html` — protótipo interativo com commit, branch, modal, toast e histórico

---

## 3. Exportação para o Claude Code

Na interface do Claude Design, foi utilizada a opção **"Handoff to Claude Code..."**, que exporta um bundle `.zip` contendo:

```
git-viz/
├── README.md          ← instruções para o agente de código
├── chats/
│   └── chat1.md       ← transcrição completa da sessão de design
└── project/
    ├── README.md       ← fundações visuais, voz, iconografia
    ├── SKILL.md
    ├── colors_and_type.css   ← tokens canônicos
    ├── preview/        ← 14 cards HTML de preview
    ├── ui_kits/
    │   └── git-viz/
    │       └── index.html    ← protótipo interativo de referência
    └── uploads/
        └── visual-inventory.md
```

O bundle é acessível via API Anthropic e foi processado pelo Claude Code usando o endpoint:

```
https://api.anthropic.com/v1/design/h/<id>
```

---

## 4. Implementação no Projeto

A implementação seguiu as instruções do `README.md` do bundle: ler os chats para entender a intenção, identificar o arquivo primário de design e implementar pixel-perfect na tecnologia do projeto (TypeScript + Vite).

### Estrutura de tokens adotada

O arquivo `src/design-system/tokens.css` é o **único ponto de verdade** para todos os tokens visuais. O `styles.css` importa este arquivo via `@import`.

```
styles.css
└── @import './src/design-system/tokens.css'
    ├── Cores (fundo, texto, accent, bordas, semânticas)
    ├── Glow (--glow-sm / md / lg / purple)
    ├── Espaçamento (--space-1 … --space-16, grid 4px)
    ├── Raios (--radius-sm / md / lg / xl / full)
    ├── Z-index (--z-base / raised / overlay / modal / toast)
    ├── Tipografia (--font-sans / mono, --text-xs … 2xl, pesos, leading)
    ├── Sombras compostas (--shadow-panel / card / modal)
    ├── Branch Tags (--tag-head / main / feature / fix)
    └── Animações (--duration-* e --ease-*)
```

### Componentes atualizados

Cada componente TypeScript foi atualizado para gerar HTML com as classes do Design System. A hierarquia de componentes permaneceu inalterada — apenas as classes CSS e a estrutura do markup foram atualizadas.

### Fontes tipográficas

Adicionadas via Google Fonts no `index.html` e via `@import url(...)` no `tokens.css`:

- **Inter** (400 / 500 / 600 / 700) — UI geral
- **JetBrains Mono** (400 / 500 / 600) — identificadores Git, código, comandos

---

## 5. Arquivos criados/atualizados

| Arquivo                                                                                         | O que mudou                                                                                     |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`src/design-system/tokens.css`](../src/design-system/tokens.css)                               | Novo — tokens completos (cores, espaçamento, tipografia, glow, z-index, branch tags, animações) |
| [`styles.css`](../styles.css)                                                                   | Reescrito com `@import` dos tokens e todas as classes novas do design system                    |
| [`index.html`](../index.html)                                                                   | Google Fonts, estrutura simplificada, `graph-container` agora é o `graph-area`                  |
| [`src/presentation/components/Toast.ts`](../src/presentation/components/Toast.ts)               | Novo — substitui todos os `alert()`                                                             |
| [`src/presentation/components/Toolbar.ts`](../src/presentation/components/Toolbar.ts)           | Nova identidade visual: brand, status-badge, stat-pill, btn-sm                                  |
| [`src/presentation/components/CommitDialog.ts`](../src/presentation/components/CommitDialog.ts) | modal-overlay, prefix-btn com estado active, 8 prefixos                                         |
| [`src/presentation/components/CommitCard.ts`](../src/presentation/components/CommitCard.ts)     | branch-tag-html com cores por tipo (HEAD/main/feature/fix), botão fechar                        |
| [`src/presentation/components/HistoryPanel.ts`](../src/presentation/components/HistoryPanel.ts) | Empty state visual, novo layout de items                                                        |
| [`src/presentation/App.ts`](../src/presentation/App.ts)                                         | Usa Toast para erros e confirmações, sem nenhum `alert()`                                       |
