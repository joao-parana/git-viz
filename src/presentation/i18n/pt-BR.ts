export const ptBR = {
  toolbar: {
    status: "HEAD →",
    stats: {
      commits: "Commits:",
      branches: "Branches:",
    },
    addCommit: "Adicionar Commit",
    branchPlaceholder: "nome-da-branch",
    createBranch: "Criar Branch",
    checkoutLabel: "Mudar para",
    checkoutButton: "Ir",
    mergeLabel: "Mesclar de",
    mergeButton: "Mesclar",
    reset: "Resetar",
  },
  commitDialog: {
    title: "Mensagem do Commit",
    placeholder: "Ex: feat: adiciona tela de login",
    quickDefaults: "Prefixos rápidos:",
    save: "Salvar",
    cancel: "Cancelar",
  },
  history: {
    title: "Histórico de Comandos",
    undo: "Desfazer",
  },
  commitCard: {
    commit: "Commit",
    branch: "Branch",
    author: "Autor",
    date: "Data",
    message: "Mensagem",
    parents: "Parents",
    noParents: "(nenhum)",
  },
  hints: {
    main: "Clique em um commit para ver detalhes. Use a barra de ferramentas para criar e mesclar branches.",
  },
  errors: {
    emptyMessage: "Por favor, informe uma mensagem de commit.",
    branchExists: "Esta branch já existe.",
    branchNotFound: "Branch não encontrada.",
    selfMerge: "Não é possível mesclar uma branch com ela mesma.",
  },
  commands: {
    addCommit: (msg: string) => `git commit -m '${msg}'`,
    createBranch: (name: string) => `git branch ${name}`,
    checkout: (name: string) => `git checkout ${name}`,
    merge: (src: string) => `git merge ${src}`,
    reset: "git init",
  },
  descriptions: {
    addCommit: "Registra mudanças no histórico.",
    createBranch: "Cria uma nova branch a partir do tip atual.",
    checkout: "Muda a branch atual (HEAD).",
    merge: "Mescla mudanças na branch atual.",
  },
};
