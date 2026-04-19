# Inventário Visual — Git Viz

## Tokens CSS existentes

| Token              | Valor                    | Uso                            |
| ------------------ | ------------------------ | ------------------------------ |
| `--bg`             | `#0a0e1a`                | Fundo principal                |
| `--panel`          | `rgba(22,26,43,0.6)`     | Painéis semi-transparentes     |
| `--panel-solid`    | `#161a2b`                | Painéis opacos                 |
| `--text`           | `#f0f1f7`                | Texto primário                 |
| `--muted`          | `#a8acc5`                | Texto secundário               |
| `--accent`         | `#6ee7af`                | Verde destaque                 |
| `--accent-glow`    | `rgba(110,231,175,0.3)`  | Glow do accent                 |
| `--border`         | `rgba(110,231,175,0.15)` | Bordas                         |
| `--danger`         | `#ef4444`                | Erros/Resetar                  |
| `--secondary`      | `#2b3049`                | Fundo de elementos secundários |
| `--glow-primary`   | `rgba(110,231,175,0.6)`  | Glow forte verde               |
| `--glow-secondary` | `rgba(124,58,237,0.3)`   | Glow roxo                      |

---

## Componentes de UI

### 1. Layout Shell

- **`.main`** — flex column, 100vh
- **`.layout`** — grid 2 colunas (`1fr 320px`), responsive → 1 coluna em < 900px
- **`.box`** — container padrão: `backdrop-filter: blur`, borda `--border`, sombra

### 2. Toolbar (`Toolbar.ts`)

Sub-elementos:

- **`.status`** — badge `HEAD → <branch>` (branch em `--accent`)
- **`.stats`** — inline badges "Commits: N" e "Branches: N"
- **`.group`** — agrupamento `label + input/select + button`
- Inputs: `<input>` texto livre e `<select>` dropdown

### 3. Botões (variantes)

| Classe          | Aparência                                |
| --------------- | ---------------------------------------- |
| `button` (base) | Gradient verde, glow, `::before` shimmer |
| `.primary`      | Base + glow extra                        |
| `.secondary`    | Fundo escuro `--secondary`               |
| `.lg`           | Padding aumentado                        |
| `:disabled`     | Opacity 0.4, cursor default              |
| `.default-btn`  | Botão de prefixo rápido no modal         |

### 4. Modal — CommitDialog (`CommitDialog.ts`)

- **`.modal`** — overlay fixed, `backdrop-filter: blur(8px)`, animação `fadeIn`
- **`.modal-content`** — card centralizado, animação `scaleIn`
- **`.default-messages`** — grid de botões de prefixo rápido (`fix:`, `feat:`, `docs:`, etc.)
- Input de texto, botões Salvar/Cancelar

### 5. CommitCard (popup flutuante)

- **`.commit-card`** — posição absoluta sobre o grafo, `backdrop-blur`, animação `slideIn`
- Conteúdo: `<code>` para ID/branch, `.meta` para autor/data/mensagem/parents

### 6. HistoryPanel (`HistoryPanel.ts`)

- **`.history-controls`** — botão "Desfazer"
- **`.history-list`** — scroll vertical
- **`.history-item`** — `#N`, timestamp, `.command > code` (monospace verde), descrição

### 7. SVG Graph (nós e arestas)

| Elemento SVG            | Descrição                                      |
| ----------------------- | ---------------------------------------------- |
| `.edge`                 | Linhas de conexão, stroke azulado, opacity 0.5 |
| `.edge:hover`           | Stroke maior, opacity 1                        |
| `.commit-node`          | Círculo com fill/sombra, hover com glow        |
| `.commit-node.selected` | Verde + stroke 4 + animação `pulse`            |
| `.commit-id`            | Texto curto dentro do nó                       |
| `.label`                | Labels de texto SVG                            |
| `.branch-tag`           | Tags de branch sobre o grafo                   |

### 8. Elementos utilitários

- **`.hint`** — caixa de dica, borda esquerda `--accent`, fundo `rgba(110,231,175,0.05)`
- **`.status-row`** — texto `--muted` pequeno
- **Scrollbar custom** — trilha escura, thumb gradient verde

---

## Animações

| Nome      | Usado em                       |
| --------- | ------------------------------ |
| `fadeIn`  | Modal overlay                  |
| `scaleIn` | Modal content                  |
| `slideIn` | CommitCard                     |
| `pulse`   | Nó selecionado no grafo        |
| `shimmer` | Definida, não usada ativamente |

---

## Lacunas a definir no Design System

1. **Tokens faltantes:** escala de espaçamento (4/8/12/16/24px), escala tipográfica (12/14/16/20px), raio de borda consistente, z-index semântico
2. **Unificar glow:** hoje existem 4 variantes de glow soltas — consolidar em 2–3 tokens
3. **Componente `BranchTag`** — o `.branch-tag` SVG precisa de spec de cor por tipo (HEAD, feature, main)
4. **Estado vazio** para `.history-list` quando não há comandos
5. **Toast/feedback** — hoje erros são `alert()` nativo — definir componente
