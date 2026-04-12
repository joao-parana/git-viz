# Spec-Driven Development com Claude Desktop — Git Viz

Este guia explica como usar a metodologia **Spec-Driven Development** na aba `Código` do Claude Desktop
para desenvolver o **Git Viz**, considerando a migração para TypeScript e Clean Architecture.

---

## O que é Spec-Driven no contexto da aba Código

A aba Código do Claude Desktop é o **Claude Code** com acesso ao filesystem e terminal.
"Spec-Driven" aqui significa: você entrega a especificação antes de qualquer linha de código ser gerada,
e o Claude age como um dev sênior que lê o contrato antes de executar.

O arquivo `SPEC.md` na raiz do projeto é o **artefato central** dessa metodologia.
Ele substitui a conversa informal de "faz assim, não, faz assado" — você pensa antes, o Claude executa com precisão.

---

## Estrutura de Arquivos do Workflow

```
git-viz/
├── SPEC.md              ← contrato da feature atual (você edita antes de cada sessão)
├── DECISIONS.md         ← log de decisões tomadas (Claude mantém, você valida)
└── docs/
    └── spec-driven-guide.md   ← este guia
```

O `SPEC.md` é um **arquivo vivo**: a cada nova feature ou iteração, você o atualiza
antes de abrir a aba Código. Ele nunca deve descrever o passado — apenas o que está sendo feito agora.

---

## Fase 1 — Prompt de Abertura de Sessão

> Nunca peça código diretamente. Comece sempre com o prompt de leitura e planejamento:

```
Leia o SPEC.md em $HOME/dev/code_with_ai/claude/git-viz/SPEC.md.

Antes de gerar qualquer código:
1. Liste os arquivos que serão criados ou modificados
2. Identifique a qual camada da Clean Architecture cada arquivo pertence
3. Aponte qualquer ambiguidade no spec que precise de decisão minha

Aguarde meu OK antes de começar a implementação.
```

> Isso ativa o protocolo de planejamento — o Claude lista o plano, você valida, só então ele executa.

---

## Fase 2 — Execução por Camada (Clean Architecture)

Trabalhe sempre de dentro para fora. A ordem correta para o Git Viz é: `Domain Layer` -> `Application Layer` -> `Infrastructure Layer` -> `Presentation Layer`

### Sessão 1 — Domain Layer

```
Com base no SPEC.md, implemente apenas as entidades da seção 3:
- src/domain/entities/Commit.ts
- src/domain/entities/Branch.ts
- src/domain/entities/Repository.ts
- src/domain/errors/DomainErrors.ts

Nenhum adapter, nenhum use case, nenhum import de DOM ainda.
Rode `tsc --noEmit` ao final e reporte o resultado.
```

### Sessão 2 — Application Layer (Use Cases)

```
Com as entidades prontas, implemente os Use Cases da seção 4.
Use as interfaces IRepositoryStore e IRenderer como contratos — sem implementações concretas ainda.
Cada Use Case deve receber os ports via construtor (injeção de dependência manual).
```

### Sessão 3 — Infrastructure Layer (Adapters)

```
Implemente os adapters concretos da seção 5:
- InMemoryRepositoryStore (com suporte a snapshots para Undo)
- SvgGraphRenderer (lógica de layout e renderização SVG)

O renderer recebe estado puro e renderiza — sem conhecer Use Cases.
```

### Sessão 4 — Presentation Layer (UI Binding)

```
Implemente a composição em App.ts (seção 6.1) e os componentes da toolbar.
Todas as strings visíveis ao usuário devem vir de src/presentation/i18n/pt-BR.ts.
```

---

## Fase 3 — Setup do Builder (Vite + TypeScript)

Antes de iniciar qualquer sessão de código, configure o ambiente com:

```
Configure o projeto com Vite e TypeScript seguindo a seção 2 do SPEC.md:
1. Crie package.json com scripts: dev, build, preview, typecheck
2. Crie tsconfig.json com strict: true
3. Crie vite.config.ts mínimo (apenas entry point)
4. Mostre o diff de mudanças no index.html (remover script antigo, apontar para src/main.ts)

Não instale dependências ainda — liste o comando e aguarde meu OK.
```

Com o Vite configurado, o workflow de desenvolvimento fica:

```bash
npm run dev        # dev server com HMR em localhost:5173
npm run typecheck  # tsc --noEmit (validação de tipos)
npm run build      # output em dist/ para deploy
```

---

## Prompt Template Completo (copie e adapte para cada sessão)

```
Você é um dev TypeScript 5 sênior especialista em Clean Architecture.

**Contexto:** Leia SPEC.md antes de qualquer ação.

**Protocolo:**
1. Liste arquivos a criar/modificar com suas camadas CA
2. Aponte ambiguidades no spec
3. Aguarde meu OK
4. Implemente camada por camada: Domain → Application → Infrastructure → Presentation
5. Após cada camada: rode tsc --noEmit e reporte resultado
6. Atualize DECISIONS.md com o que foi feito e decisões não óbvias

**Restrições:**
- Nunca importe DOM ou I/O em src/domain/ ou src/application/
- Use interfaces (Ports) para todas as dependências externas nos Use Cases
- Todas as strings visíveis ao usuário em pt-BR.ts
- Type hints obrigatórios — sem any implícito
- Sem dependências novas (além de Vite e TypeScript) sem aprovação prévia
```

---

## `DECISIONS.md` — Rastreabilidade Arquitetural

Peça ao Claude para manter este arquivo ao final de cada sessão:

```
Ao finalizar a sessão, atualize DECISIONS.md com:
- O que foi implementado nesta sessão
- Decisões de design não óbvias e o motivo (ex: "optei por X em vez de Y porque...")
- Itens da seção 10 do SPEC.md (Decisões Pendentes) que foram resolvidos
- O que ficou fora do escopo desta sessão
```

---

## Resumo do Fluxo

```
Você edita SPEC.md com a feature / iteração atual
            ↓
Prompt de abertura → Claude lê e lista o plano
            ↓
Você valida (OK ou ajuste)
            ↓
Setup Vite + TypeScript (apenas uma vez)
            ↓
Domain Layer → tsc --noEmit ✓
            ↓
Application Layer → tsc --noEmit ✓
            ↓
Infrastructure Layer → tsc --noEmit ✓
            ↓
Presentation Layer → tsc --noEmit ✓
            ↓
DECISIONS.md atualizado
```

---

## Dicas Específicas para o Git Viz

**Sobre o grafo SVG:** O `SvgGraphRenderer` é um adapter de infraestrutura, não um componente de UI.
Ele recebe `GitRepository` puro e produz elementos SVG. Isso permite testá-lo de forma isolada,
passando estado fictício sem precisar de browser.

**Sobre internacionalização:** O `specs.md` original mencionava UI em Português Brasileiro.
Todo o texto visível deve estar centralizado em `pt-BR.ts` — nunca hardcoded nos componentes.
Isso facilita a adição de outros idiomas no futuro (ex: inglês para uso em salas de aula internacionais).

**Sobre o Roadmap:** A seção 8 do `SPEC.md` lista casos de uso Git Flow ordenados por complexidade.
A cada nova fase, copie os itens relevantes para uma seção de `Goal` no topo do `SPEC.md`
e atualize os `Acceptance Criteria` correspondentes.
