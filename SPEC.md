# SPEC.md — Git Viz

> **Instrução para o assistente de IA:** Leia este arquivo integralmente antes de gerar qualquer código.
> Respeite a ordem das camadas da Clean Architecture. Nunca misture lógica de domínio com I/O ou DOM.
> Aguarde aprovação do plano antes de iniciar a implementação.

---

## 1. Contexto do Projeto

| Campo                | Valor                                                              |
| -------------------- | ------------------------------------------------------------------ |
| **Nome**             | Git Viz                                                            |
| **Objetivo**         | Visualizador interativo de Git para ensinar conceitos a iniciantes |
| **Público-alvo**     | Desenvolvedores iniciantes, instrutores, vibe coders               |
| **Idioma da UI**     | Português Brasileiro (copy/textos visíveis ao usuário)             |
| **Idioma do código** | Inglês (variáveis, funções, comentários, commits)                  |
| **Stack atual**      | HTML + CSS + JavaScript (vanilla, sem build)                       |
| **Stack alvo**       | TypeScript + Vite (builder leve) + SVG                             |
| **Deploy**           | GitHub Pages / Netlify / qualquer hosting estático                 |

---

## 2. Stack e Ferramentas

### 2.1 Runtime

- **TypeScript 5.x** — tipagem estrita (`strict: true` no `tsconfig.json`)
- **Vite** — builder e dev server (HMR, build rápido, zero config para TS)
- **SVG nativo** — grafo renderizado diretamente em SVG, sem canvas ou libs externas

### 2.2 Por que Vite como builder simples

O Vite substitui o script `<script src="app.js">` atual, permitindo:

- Hot Module Replacement durante desenvolvimento
- Import/export de módulos TypeScript sem bundler manual
- Build de produção com `vite build` (output em `dist/`)
- Dev server com `vite` (porta 5173 por padrão)

### 2.3 Estrutura de diretórios alvo

```
git-viz/
├── index.html              ← shell HTML (sem lógica)
├── styles.css              ← estilos globais
├── vite.config.ts          ← configuração do Vite
├── tsconfig.json           ← TypeScript strict
├── package.json
├── SPEC.md                 ← este arquivo
├── DECISIONS.md            ← log de decisões arquiteturais
├── docs/
│   └── spec-driven-guide.md
└── src/
    ├── main.ts             ← entry point (bootstrapping)
    ├── domain/             ← [CAMADA 1] Entidades e regras de negócio puras
    │   ├── entities/
    │   │   ├── Commit.ts
    │   │   ├── Branch.ts
    │   │   └── Repository.ts
    │   └── errors/
    │       └── DomainErrors.ts
    ├── application/        ← [CAMADA 2] Use Cases (orquestração, sem I/O)
    │   ├── ports/
    │   │   ├── IRepositoryStore.ts   ← interface de persistência
    │   │   └── IRenderer.ts          ← interface de renderização
    │   └── use-cases/
    │       ├── AddCommitUseCase.ts
    │       ├── CreateBranchUseCase.ts
    │       ├── CheckoutBranchUseCase.ts
    │       ├── MergeBranchUseCase.ts
    │       └── ResetRepositoryUseCase.ts
    ├── infrastructure/     ← [CAMADA 3] Adapters concretos (DOM, localStorage)
    │   ├── store/
    │   │   └── InMemoryRepositoryStore.ts
    │   └── renderer/
    │       └── SvgGraphRenderer.ts
    └── presentation/       ← [CAMADA 4] UI, eventos, binding
        ├── App.ts          ← composição raiz (dependency injection manual)
        ├── components/
        │   ├── Toolbar.ts
        │   ├── CommitDialog.ts
        │   ├── CommitCard.ts
        │   └── HistoryPanel.ts
        └── i18n/
            └── pt-BR.ts    ← todas as strings visíveis ao usuário
```

---

## 3. Domain Layer — Entidades e Regras

> **Princípio:** Nenhuma entidade conhece o DOM, SVG, localStorage ou qualquer I/O.

### 3.1 `Commit`

```typescript
interface Commit {
  readonly id: string;          // ex: "c1", "c2"
  readonly message: string;
  readonly branchName: string;
  readonly parentIds: string[]; // 0 = inicial, 1 = normal, 2 = merge
  readonly timeIndex: number;
  readonly author: string;      // padrão: "Você" (DEC-001)
  readonly timestamp: number;   // Unix ms — Date.now() na criação (DEC-001)
}
```

**Regras de negócio:**

- Um commit com `parentIds.length === 0` é o commit inicial
- Um commit com `parentIds.length === 2` é um merge commit
- `message` não pode ser vazia (lançar `EmptyCommitMessageError`)

### 3.2 `Branch`

```typescript
interface Branch {
  readonly name: string;
  readonly color: string; // hex, atribuído automaticamente por lane
  readonly tipCommitId: string | null;
  readonly lane: number; // posição vertical no gráfico (0 = master)
}
```

**Regras de negócio:**

- Não é possível criar branch com nome duplicado (`DuplicateBranchError`)
- Não é possível fazer merge de uma branch nela mesma (`SelfMergeError`)

### 3.3 `GitRepository` (Aggregate Root)

```typescript
interface GitRepository {
  commits: Commit[];
  branches: Record<string, Branch>;
  head: { branchName: string };
  commitCounter: number;
}
```

---

## 4. Application Layer — Use Cases

> **Princípio:** Use Cases recebem dados primitivos, operam nas entidades e
> delegam persistência e renderização via interfaces (Ports).

### 4.1 Ports (interfaces)

```typescript
// IRepositoryStore.ts
interface IRepositoryStore {
  getState(): GitRepository;
  setState(repo: GitRepository): void; // auto-salva snapshot antes de mudar (DEC-004)
  undo(): boolean;                     // restaura snapshot anterior (DEC-003)
  clearHistory(): void;                // limpa pilha de snapshots (DEC-003)
}

// IRenderer.ts
interface IRenderer {
  render(repo: GitRepository, selectedCommitId: string | null): void;
}
```

### 4.2 Use Cases e contratos

| Use Case                 | Input                          | Efeito                                              |
| ------------------------ | ------------------------------ | --------------------------------------------------- |
| `AddCommitUseCase`       | `{ message: string }`          | Novo commit na branch atual, atualiza `tip`         |
| `CreateBranchUseCase`    | `{ name: string }`             | Nova branch a partir do `tip` atual                 |
| `CheckoutBranchUseCase`  | `{ branchName: string }`       | Move `HEAD` para a branch                           |
| `MergeBranchUseCase`     | `{ sourceBranchName: string }` | Merge commit com 2 parents                          |
| `ResetRepositoryUseCase` | `{}`                           | Estado inicial com 1 commit em `master`, limpa undo |
| `UndoUseCase`            | `{}`                           | Restaura o snapshot anterior via `store.undo()`     |

Todos os Use Cases devem:

1. Ler o estado via `IRepositoryStore.getState()`
2. Aplicar a mutação nas entidades
3. Persistir via `IRepositoryStore.setState()`
4. **Não** chamar nenhum método de renderização diretamente

---

## 5. Infrastructure Layer — Adapters

### 5.1 `InMemoryRepositoryStore`

- Implementa `IRepositoryStore`
- Mantém o estado em memória (objeto JS simples)
- Armazena snapshots para o sistema de Undo (`history: Snapshot[]`)
- Expõe `undo(): boolean` para reverter ao snapshot anterior

### 5.2 `SvgGraphRenderer`

- Implementa `IRenderer`
- Recebe o estado puro e renderiza o SVG no DOM
- Layout: `x = PADDING + timeIndex * SPACING_X`, `y = PADDING + lane * SPACING_Y`
- Responsabilidades:
  - Desenhar arestas (paths bezier entre commits e seus parents)
  - Desenhar nós (circles com ID do commit)
  - Desenhar labels de branches (tags SVG com background dinâmico)
  - Destacar o commit selecionado (classe CSS `selected`)
- **Não** conhece nenhum Use Case — recebe estado, renderiza, fim

---

## 6. Presentation Layer — UI e Binding

### 6.1 `App.ts` — Composição raiz (injeção de dependências)

```typescript
// Exemplo de composição
const store = new InMemoryRepositoryStore();
const renderer = new SvgGraphRenderer(document.getElementById("graph")!);
const addCommit = new AddCommitUseCase(store);
// ... demais use cases

const toolbar = new Toolbar({
  addCommit,
  createBranch,
  checkout,
  merge,
  reset,
});
toolbar.mount(document.getElementById("toolbar")!);
```

### 6.2 Internacionalização (`pt-BR.ts`)

Todas as strings visíveis ao usuário devem estar centralizadas:

```typescript
export const ptBR = {
  toolbar: {
    addCommit: "Adicionar Commit",
    createBranch: "Criar Branch",
    checkout: "Mudar para",
    merge: "Mesclar de",
    reset: "Resetar",
    undo: "Desfazer",
  },
  commitDialog: {
    title: "Mensagem do Commit",
    placeholder: "Ex: feat: adiciona tela de login",
    save: "Salvar",
    cancel: "Cancelar",
  },
  history: {
    title: "Histórico de Comandos",
  },
  hints: {
    clickCommit: "Clique em um commit para ver detalhes.",
    useToolbar: "Use a barra de ferramentas para criar e mesclar branches.",
  },
  // ... prefixos de commit, mensagens de erro, etc.
};
```

---

## 7. Acceptance Criteria — Feature Atual (MVP Migrado)

### Core

- [ ] Repositório inicializa com `master` e 1 commit ao carregar
- [ ] "Adicionar Commit" cria novo commit na branch atual (HEAD)
- [ ] "Criar Branch" cria branch a partir do tip atual
- [ ] "Mudar para" faz checkout na branch selecionada
- [ ] "Mesclar de" cria merge commit com 2 parents
- [ ] "Resetar" volta ao estado inicial
- [ ] "Desfazer" reverte a última ação

### Visualização

- [ ] Grafo SVG renderiza commits como circles com ID
- [ ] Arestas bezier conectam commits aos seus parents
- [ ] Cada branch tem cor única e consistente
- [ ] Label da branch aparece no tip com indicador `(HEAD)` na branch atual
- [ ] Commit selecionado tem highlight visual
- [ ] Clicar em commit exibe card de detalhes

### Qualidade

- [ ] `tsc --noEmit` passa sem erros
- [ ] Toda string visível ao usuário está em `pt-BR.ts`
- [ ] Nenhuma entidade do Domain importa do DOM ou de módulos de I/O

---

## 8. Roadmap — Casos de Uso Git Flow

> Ordenados por valor educacional e complexidade de implementação.

### 🟢 Fase 2 — Git Flow Básico

- **Cenário guiado: Feature Branch** — tutorial passo a passo mostrando o fluxo `master → feature/x → merge → master`
- **Tag de versão** — marcar um commit com uma tag (ex: `v1.0.0`), visualizada no grafo
- **Fast-forward merge** — distinguir visualmente merge FF (sem merge commit) de merge com commit
- **Rebase visual** — mostrar como commits são "replay"ados sobre outra branch

### 🟡 Fase 3 — Fluxos Colaborativos

- **Simulação de Pull Request** — criar PR de uma branch para outra, com estado "open → merged"
- **Conflito de merge** — simular um conflito e mostrar como resolvê-lo
- **Remote tracking** — representar `origin/master` como branch "fantasma" para ensinar push/pull
- **`git fetch` vs `git pull`** — visualizar a diferença entre buscar e integrar

### 🔵 Fase 4 — Correção e Reescrita de Histórico

- **`git stash`** — pilha de stash visualizada no painel lateral
- **`git cherry-pick`** — copiar um commit de uma branch para outra
- **`git revert`** — criar commit de reversão (não destrói histórico)
- **`git reset --soft / --mixed / --hard`** — visualizar os três modos com o Working Tree

### 🟣 Fase 5 — Git Flow Completo

- **Modo Git Flow** — preset que cria automaticamente as branches `main`, `develop`, `release/*`, `hotfix/*`
- **Hotfix flow** — fluxo de correção urgente: `main → hotfix/x → merge main + develop`
- **Release branch** — fluxo de preparação de release com bump de versão

---

## 9. Out of Scope (desta iteração)

- Integração com repositórios Git reais (via `isomorphic-git` ou API do GitHub) — fase futura
- Autenticação / persistência em nuvem
- Testes automatizados com Vitest (desejável, não bloqueante para MVP migrado)
- Suporte a múltiplos repositórios simultâneos

---

## 10. Decisões Pendentes

> Marque com ✅ ao decidir e mova para `DECISIONS.md`.

- ✅ **Animações:** CSS transitions puras. → `DECISIONS.md DEC-009`
- ✅ **Persistência:** Apenas em memória (sem localStorage) no MVP. → `DECISIONS.md DEC-010`
- ✅ **Testes:** Vitest postergado para após o MVP migrado. → `DECISIONS.md DEC-011`
- ✅ **Build output:** Manter `dist/` no `.gitignore`. → `DECISIONS.md DEC-012`
- ✅ **`author` e `timestamp` no Commit:** Adicionados à entidade. → `DECISIONS.md DEC-001`
- ✅ **`UndoUseCase`:** Criado na camada Application. → `DECISIONS.md DEC-002`
- ✅ **`HistoryPanel`:** Exibe log de comandos git executados. → `DECISIONS.md DEC-006`
- ✅ **`CommitCard`:** Exibe hash, data, autor e mensagem (somente leitura). → `DECISIONS.md DEC-008`
