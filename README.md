# Git Viz

Visualizador interativo de Git para aprender conceitos de versionamento de forma visual — commits, branches, merges e HEAD — com animações simples e interface em Português Brasileiro.

---

## Instalação

### Sem build (versão atual — JavaScript vanilla)

```bash
git clone https://github.com/seu-usuario/git-viz.git
cd git-viz
```

Abra `index.html` diretamente no browser, ou use um servidor estático local:

```bash
# Python
python3 -m http.server
# → acesse http://localhost:8000

# Node.js
npx serve .
# → acesse http://localhost:3000
```

### Com build (versão TypeScript + Vite — em migração)

```bash
npm install
npm run dev      # dev server em http://localhost:5173
npm run build    # gera dist/ para deploy
```

---

## Como usar

A interface tem uma barra de ferramentas no topo e o grafo de commits no centro.

### Ações principais

| Ação | O que faz |
|---|---|
| **Adicionar Commit** | Cria um novo commit na branch atual (HEAD) |
| **Criar Branch** | Cria uma nova branch a partir do commit atual |
| **Mudar para** | Faz checkout em outra branch (move o HEAD) |
| **Mesclar de** | Faz merge de outra branch na branch atual |
| **Resetar** | Volta ao estado inicial com `master` e 1 commit |
| **Desfazer** | Reverte a última ação |

### Interagindo com o grafo

- **Clique em um commit** para ver detalhes (ID, mensagem, parents, branch)
- O commit selecionado fica destacado visualmente
- Cada branch tem uma cor única e consistente
- O indicador `(HEAD)` mostra em qual branch você está

---

## Exemplos de casos de uso

### Fluxo básico: commit em sequência

```
1. Abra o app → master com 1 commit inicial
2. Clique "Adicionar Commit" três vezes
   → Você vê a linha do tempo crescendo para a direita
```

### Criar e trabalhar em uma feature branch

```
1. Digite "feature/login" no campo de branch → "Criar Branch"
2. Clique "Mudar para" → selecione feature/login
3. Adicione 2 commits (você está na feature branch)
4. Clique "Mudar para" → volte para master
5. Clique "Mesclar de" → selecione feature/login
   → Um merge commit aparece unindo as duas linhas
```

### Simular múltiplas features em paralelo

```
1. Crie "feature/auth" e adicione commits
2. Volte para master, crie "feature/dashboard"
3. Adicione commits em cada branch alternando o checkout
   → O grafo mostra as linhas paralelas claramente
```

### Explorar o histórico

```
1. Realize várias ações (commits, branches, merges)
2. O painel lateral "Histórico de Comandos" mostra os comandos Git equivalentes
3. Use "Desfazer" para voltar passo a passo
```

---

## Deploy

Qualquer hosting estático funciona:

```bash
# GitHub Pages: aponte para a raiz do repositório (ou dist/ após build)
# Netlify / Vercel: arraste a pasta ou conecte o repositório
# S3: copie os arquivos para o bucket com acesso público
```

---

## Documentação

- [`SPEC.md`](./SPEC.md) — especificação técnica e roadmap completo
- [`docs/spec-driven-guide.md`](./docs/spec-driven-guide.md) — como desenvolver este projeto com Spec-Driven Development e Claude Desktop
