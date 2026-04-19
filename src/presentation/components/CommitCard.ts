import type { Commit } from '../../domain/entities/Commit';
import { ptBR } from '../i18n/pt-BR';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] ?? ch),
  );
}

function tagClass(branch: string): string {
  if (branch === 'HEAD') return 'tag-head';
  if (branch === 'main' || branch === 'master') return 'tag-main';
  if (branch.startsWith('feature/') || branch.startsWith('feat/')) return 'tag-feature';
  if (branch.startsWith('fix/') || branch.startsWith('hotfix/')) return 'tag-fix';
  return 'tag-main';
}

export interface CommitCardCallbacks {
  onClose: () => void;
}

export class CommitCard {
  private cardEl: HTMLElement | null = null;

  constructor(private readonly callbacks: CommitCardCallbacks) {}

  mount(container: HTMLElement): void {
    this.cardEl = document.createElement('div');
    this.cardEl.className = 'commit-card hidden';
    container.appendChild(this.cardEl);
  }

  show(commit: Commit, position?: { x: number; y: number }): void {
    if (!this.cardEl) return;
    const t = ptBR.commitCard;
    const date = new Date(commit.timestamp).toLocaleString('pt-BR');
    const parents = commit.parentIds.length
      ? commit.parentIds.map(p => `<code>${escapeHtml(p.slice(0, 7))}</code>`).join(', ')
      : t.noParents;

    const cls = tagClass(commit.branchName);

    this.cardEl.innerHTML = `
      <div class="commit-card-header">
        <code class="commit-card-id">${escapeHtml(commit.id.slice(0, 7))}</code>
        <span class="commit-card-close">✕</span>
      </div>
      <div class="commit-card-msg">${escapeHtml(commit.message)}</div>
      <div class="commit-card-meta">
        <span>${t.author}: <strong style="color:var(--text)">${escapeHtml(commit.author)}</strong></span>
        <span>${t.date}: ${escapeHtml(date)}</span>
        <span>${t.parents}: ${parents}</span>
      </div>
      <div class="commit-card-tags">
        <span class="branch-tag-html ${cls}">
          <span class="tag-dot"></span>${escapeHtml(commit.branchName)}
        </span>
      </div>
    `;

    this.cardEl.querySelector('.commit-card-close')?.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    if (position) {
      this.cardEl.style.left = `${Math.max(8, position.x + 16)}px`;
      this.cardEl.style.top = `${Math.max(8, position.y - 10)}px`;
    }

    this.cardEl.classList.remove('hidden');
  }

  hide(): void {
    this.cardEl?.classList.add('hidden');
  }
}
