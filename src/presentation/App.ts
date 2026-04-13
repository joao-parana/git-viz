import { InMemoryRepositoryStore } from '../infrastructure/store/InMemoryRepositoryStore';
import { SvgGraphRenderer } from '../infrastructure/renderer/SvgGraphRenderer';
import { AddCommitUseCase } from '../application/use-cases/AddCommitUseCase';
import { CreateBranchUseCase } from '../application/use-cases/CreateBranchUseCase';
import { CheckoutBranchUseCase } from '../application/use-cases/CheckoutBranchUseCase';
import { MergeBranchUseCase } from '../application/use-cases/MergeBranchUseCase';
import { ResetRepositoryUseCase } from '../application/use-cases/ResetRepositoryUseCase';
import { UndoUseCase } from '../application/use-cases/UndoUseCase';
import { Toolbar } from './components/Toolbar';
import { CommitDialog } from './components/CommitDialog';
import { CommitCard } from './components/CommitCard';
import { HistoryPanel, type CommandEntry } from './components/HistoryPanel';
import { ptBR } from './i18n/pt-BR';

export class App {
  private readonly store = new InMemoryRepositoryStore();
  private readonly renderer: SvgGraphRenderer;

  private readonly addCommitUC: AddCommitUseCase;
  private readonly createBranchUC: CreateBranchUseCase;
  private readonly checkoutUC: CheckoutBranchUseCase;
  private readonly mergeUC: MergeBranchUseCase;
  private readonly resetUC: ResetRepositoryUseCase;
  private readonly undoUC: UndoUseCase;

  private readonly toolbar: Toolbar;
  private readonly commitDialog: CommitDialog;
  private readonly commitCard: CommitCard;
  private readonly historyPanel: HistoryPanel;

  private selectedCommitId: string | null = null;
  private commandLog: CommandEntry[] = [];

  constructor() {
    const svgEl = document.getElementById('graph') as unknown as SVGSVGElement;
    const graphContainer = document.getElementById('graph-container') as HTMLElement;

    this.renderer = new SvgGraphRenderer(svgEl, graphContainer, {
      onCommitClick: (id) => this.onCommitSelected(id),
      onBackgroundClick: () => this.onBackgroundClick(),
    });

    this.addCommitUC = new AddCommitUseCase(this.store);
    this.createBranchUC = new CreateBranchUseCase(this.store);
    this.checkoutUC = new CheckoutBranchUseCase(this.store);
    this.mergeUC = new MergeBranchUseCase(this.store);
    this.resetUC = new ResetRepositoryUseCase(this.store);
    this.undoUC = new UndoUseCase(this.store);

    this.commitDialog = new CommitDialog({
      onSave: (message) => this.executeAddCommit(message),
    });

    this.commitCard = new CommitCard();

    this.toolbar = new Toolbar({
      onAddCommit: () => this.commitDialog.open(),
      onCreateBranch: (name) => this.executeCreateBranch(name),
      onCheckout: (branchName) => this.executeCheckout(branchName),
      onMerge: (sourceBranchName) => this.executeMerge(sourceBranchName),
      onReset: () => this.executeReset(),
    });

    this.historyPanel = new HistoryPanel({
      onUndo: () => this.executeUndo(),
    });
  }

  mount(): void {
    const toolbarRoot = document.getElementById('toolbar-root')!;
    const historyRoot = document.getElementById('history-root')!;
    const graphContainer = document.getElementById('graph-container')!;
    const hintEl = document.getElementById('hint-text');
    const modalRoot = document.getElementById('modal-root')!;

    this.toolbar.mount(toolbarRoot);
    this.commitCard.mount(graphContainer);
    this.historyPanel.mount(historyRoot);
    this.commitDialog.mount(modalRoot);

    if (hintEl) hintEl.textContent = ptBR.hints.main;

    this.executeReset();
  }

  private refresh(): void {
    const repo = this.store.getState();
    this.renderer.render(repo, this.selectedCommitId);
    this.toolbar.update(repo);
    this.historyPanel.update(this.commandLog);

    if (this.selectedCommitId) {
      const commit = repo.commits.find(c => c.id === this.selectedCommitId);
      if (commit) {
        const pos = this.renderer.getCommitClientPosition(this.selectedCommitId);
        this.commitCard.show(commit, pos ?? undefined);
      } else {
        this.commitCard.hide();
        this.selectedCommitId = null;
      }
    } else {
      this.commitCard.hide();
    }
  }

  private log(command: string, description: string): void {
    this.commandLog.push({ command, description, ts: Date.now() });
  }

  private onCommitSelected(commitId: string): void {
    this.selectedCommitId = commitId;
    const repo = this.store.getState();
    const commit = repo.commits.find(c => c.id === commitId);
    if (!commit) return;
    this.renderer.render(repo, commitId);
    this.renderer.centerOnCommit(commitId);
    const pos = this.renderer.getCommitClientPosition(commitId);
    this.commitCard.show(commit, pos ?? undefined);
  }

  private onBackgroundClick(): void {
    this.selectedCommitId = null;
    this.commitCard.hide();
    this.renderer.render(this.store.getState(), null);
  }

  private executeAddCommit(message: string): void {
    this.addCommitUC.execute({ message });
    this.log(ptBR.commands.addCommit(message), ptBR.descriptions.addCommit);
    this.selectedCommitId = null;
    this.refresh();
  }

  private executeCreateBranch(name: string): void {
    try {
      this.createBranchUC.execute({ name });
      this.log(ptBR.commands.createBranch(name), ptBR.descriptions.createBranch);
      this.refresh();
    } catch (_e) {
      alert(ptBR.errors.branchExists);
    }
  }

  private executeCheckout(branchName: string): void {
    this.checkoutUC.execute({ branchName });
    this.log(ptBR.commands.checkout(branchName), ptBR.descriptions.checkout);
    this.refresh();
  }

  private executeMerge(sourceBranchName: string): void {
    try {
      this.mergeUC.execute({ sourceBranchName });
      this.log(ptBR.commands.merge(sourceBranchName), ptBR.descriptions.merge);
      this.refresh();
    } catch (_e) {
      alert(ptBR.errors.selfMerge);
    }
  }

  private executeReset(): void {
    this.commandLog = [];
    this.selectedCommitId = null;
    this.resetUC.execute();
    this.refresh();
  }

  private executeUndo(): void {
    const success = this.undoUC.execute();
    if (success) {
      this.commandLog.pop();
      this.selectedCommitId = null;
      this.refresh();
    }
  }
}
