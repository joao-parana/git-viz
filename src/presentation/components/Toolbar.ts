import type { GitRepository } from '../../domain/entities/Repository';
import { ptBR } from '../i18n/pt-BR';

export interface ToolbarCallbacks {
  onAddCommit: () => void;
  onCreateBranch: (name: string) => void;
  onCheckout: (branchName: string) => void;
  onMerge: (sourceBranchName: string) => void;
  onReset: () => void;
}

export class Toolbar {
  private container: HTMLElement | null = null;

  constructor(private readonly callbacks: ToolbarCallbacks) {}

  mount(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = this.buildHTML();
    this.bindEvents();
  }

  update(repo: GitRepository): void {
    if (!this.container) return;
    const q = <T extends Element>(sel: string) => this.container!.querySelector<T>(sel);

    const headBranch = q<HTMLElement>('#head-branch');
    const commitCount = q<HTMLElement>('#commit-count');
    const branchCount = q<HTMLElement>('#branch-count');
    const checkoutSelect = q<HTMLSelectElement>('#checkout-branch');
    const mergeSelect = q<HTMLSelectElement>('#merge-branch');

    if (headBranch) {
      headBranch.textContent = repo.head.branchName;
      headBranch.style.color = repo.branches[repo.head.branchName]?.color ?? 'var(--accent)';
    }
    if (commitCount) commitCount.textContent = String(repo.commits.length);
    if (branchCount) branchCount.textContent = String(Object.keys(repo.branches).length);

    if (checkoutSelect) {
      checkoutSelect.innerHTML = Object.keys(repo.branches)
        .map(b => `<option value="${b}">${b}</option>`)
        .join('');
      checkoutSelect.value = repo.head.branchName;
    }
    if (mergeSelect) {
      mergeSelect.innerHTML = Object.keys(repo.branches)
        .filter(b => b !== repo.head.branchName)
        .map(b => `<option value="${b}">${b}</option>`)
        .join('');
    }
  }

  private buildHTML(): string {
    const t = ptBR.toolbar;
    return `
      <div class="toolbar-row">
        <div class="status">${t.status} <span id="head-branch">master</span></div>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-label">${t.stats.commits}</span>
            <span id="commit-count">0</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">${t.stats.branches}</span>
            <span id="branch-count">0</span>
          </span>
        </div>
        <button id="btn-add-commit" class="primary lg">${t.addCommit}</button>
        <div class="group">
          <input id="branch-name" placeholder="${t.branchPlaceholder}" />
          <button id="btn-create-branch" class="lg">${t.createBranch}</button>
        </div>
        <div class="group">
          <label for="checkout-branch">${t.checkoutLabel}</label>
          <select id="checkout-branch"></select>
          <button id="btn-checkout" class="lg">${t.checkoutButton}</button>
        </div>
        <div class="group">
          <label for="merge-branch">${t.mergeLabel}</label>
          <select id="merge-branch"></select>
          <button id="btn-merge" class="lg">${t.mergeButton}</button>
        </div>
        <button id="btn-reset" class="secondary lg">${t.reset}</button>
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.container) return;
    const q = <T extends Element>(id: string) => this.container!.querySelector<T>(`#${id}`);

    q<HTMLButtonElement>('btn-add-commit')?.addEventListener('click', () => {
      this.callbacks.onAddCommit();
    });

    q<HTMLButtonElement>('btn-create-branch')?.addEventListener('click', () => {
      const input = q<HTMLInputElement>('branch-name');
      const name = (input?.value ?? '').trim();
      if (name) {
        this.callbacks.onCreateBranch(name);
        if (input) input.value = '';
      }
    });

    q<HTMLButtonElement>('btn-checkout')?.addEventListener('click', () => {
      const sel = q<HTMLSelectElement>('checkout-branch');
      if (sel?.value) this.callbacks.onCheckout(sel.value);
    });

    q<HTMLButtonElement>('btn-merge')?.addEventListener('click', () => {
      const sel = q<HTMLSelectElement>('merge-branch');
      if (sel?.value) this.callbacks.onMerge(sel.value);
    });

    q<HTMLButtonElement>('btn-reset')?.addEventListener('click', () => {
      this.callbacks.onReset();
    });
  }
}
