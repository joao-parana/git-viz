# DECISIONS.md — Git Viz

> Log de decisões arquiteturais. Mover itens de `SPEC.md § 10` para cá ao decidir.

---

## ✅ DEC-001 — Entidade `Commit` estendida com `author` e `timestamp`

**Data:** 2026-04-12  
**Decisão:** Adicionar `author: string` e `timestamp: number` (Unix ms) à interface `Commit`.  
**Motivo:** `CommitCard` precisa exibir autor e data. Para um repositório simulado, `author` padrão é `'Você'` e `timestamp` é `Date.now()` no momento da criação.  
**Impacto:** `SPEC.md § 3.1` atualizado.

---

## ✅ DEC-002 — `UndoUseCase` adicionado à camada Application

**Data:** 2026-04-12  
**Decisão:** Criar `UndoUseCase` que delega para `IRepositoryStore.undo()`.  
**Motivo:** O botão "Desfazer" na `HistoryPanel` deve acionar um Use Case explícito, não chamar o store diretamente da apresentação.  
**Impacto:** `SPEC.md § 4.2` atualizado com novo use case.

---

## ✅ DEC-003 — `IRepositoryStore` expõe `undo()` e `clearHistory()`

**Data:** 2026-04-12  
**Decisão:** Adicionar `undo(): boolean` e `clearHistory(): void` à interface `IRepositoryStore`.  
**Motivo:** `UndoUseCase` precisa de `undo()`. `ResetRepositoryUseCase` precisa de `clearHistory()` para limpar os snapshots após reset, evitando desfazer para um estado pré-reset (confuso para fins educacionais).  
**Trade-off:** Polui levemente a interface com concerns de histórico, mas evita criar uma segunda interface `IUndoableStore` para um projeto de escopo reduzido.

---

## ✅ DEC-004 — Snapshot automático em `setState()`

**Data:** 2026-04-12  
**Decisão:** `InMemoryRepositoryStore.setState()` salva um deep-copy do estado atual antes de aplicar o novo estado.  
**Motivo:** Os Use Cases não precisam chamar `saveSnapshot()` explicitamente — a persistência do undo é um detalhe de implementação do store, invisível para a camada Application.

---

## ✅ DEC-005 — Log de comandos mantido em `App.ts`

**Data:** 2026-04-12  
**Decisão:** `App.ts` mantém um array `commandLog: CommandEntry[]`. Cada método `execute*` adiciona a entrada APÓS sucesso do Use Case.  
**Motivo:** O log de comandos é uma concern de apresentação (o que o usuário fez, em pt-BR), não de domínio. Manter no Use Case violaria a separação de camadas.  
**Consequência:** O undo em `App.ts` faz `commandLog.pop()` junto com `store.undo()`.

---

## ✅ DEC-006 — `HistoryPanel` exibe log de comandos (não commits)

**Data:** 2026-04-12  
**Decisão:** `HistoryPanel` mostra os comandos git executados (ex: `git commit -m 'feat: ...'`), não o histórico de commits do grafo.  
**Motivo:** Valor educacional: o aluno vê o comando git equivalente a cada ação que executa na UI.

---

## ✅ DEC-007 — Botão "Desfazer" na `HistoryPanel`

**Data:** 2026-04-12  
**Decisão:** Botão "Desfazer" fica na `HistoryPanel` (coluna lateral), como no layout original.  
**Motivo:** Contexto visual — o undo está ao lado do log de comandos, deixando claro que desfaz o último comando listado.

---

## ✅ DEC-008 — `CommitCard` é somente leitura (sem amend ao clicar)

**Data:** 2026-04-12  
**Decisão:** Clicar em um commit exibe o `CommitCard` com hash, data, autor e mensagem — sem abrir o dialog de edição.  
**Motivo:** Separação de intenções: criar commit é uma ação, inspecionar é outra. Amend pode ser feature de fase futura.

---

## ✅ DEC-009 — Animações: CSS transitions puras

**Data:** 2026-04-12  
**Decisão:** Usar apenas as `transition` e `animation` já presentes no `styles.css`. Nenhuma lib de animação (motion, animejs) adicionada.  
**Motivo:** Zero dependência extra. As transições existentes (pulse no commit selecionado, slideIn no card) são suficientes para o MVP.

---

## ✅ DEC-010 — Persistência: apenas em memória (sem localStorage)

**Data:** 2026-04-12  
**Decisão:** `InMemoryRepositoryStore` não persiste em `localStorage`. Estado reinicia ao recarregar.  
**Motivo:** Escopo do MVP: o app é uma ferramenta de ensino interativo, não um editor persistente. Pode ser adicionado na Fase 2 como `LocalStorageRepositoryStore` implementando `IRepositoryStore`.

---

## ✅ DEC-011 — Testes com Vitest: postergado

**Data:** 2026-04-12  
**Decisão:** Nenhum teste automatizado na Fase 1.  
**Motivo:** A Clean Architecture facilita testes futuros (Use Cases são funções puras sem I/O), mas o MVP prioriza a migração funcional. Vitest pode ser adicionado sem reestruturação.

---

## ✅ DEC-012 — `dist/` no `.gitignore`

**Data:** 2026-04-12  
**Decisão:** Manter `dist/` fora do controle de versão.  
**Motivo:** O build de produção é gerado via `vite build` no pipeline de deploy (GitHub Pages / Netlify). Não faz sentido versionar artefatos gerados.
