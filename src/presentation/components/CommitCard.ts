import type { Commit } from '../../domain/entities/Commit';
import { ptBR } from '../i18n/pt-BR';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] ?? ch),
  );
}

export class CommitCard {
  private cardEl: HTMLElement | null = null;

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
      ? commit.parentIds.map(p => `<code>${escapeHtml(p)}</code>`).join(', ')
      : t.noParents;

    this.cardEl.innerHTML = `
      <div><strong>${t.commit}</strong> <code>${escapeHtml(commit.id)}</code></div>
      <div class="meta">${t.branch}: <code>${escapeHtml(commit.branchName)}</code></div>
      <div class="meta">${t.author}: <span>${escapeHtml(commit.author)}</span></div>
      <div class="meta">${t.date}: <span>${escapeHtml(date)}</span></div>
      <div class="meta">${t.message}: <span>${escapeHtml(commit.message)}</span></div>
      <div class="meta">${t.parents}: ${parents}</div>
    `;

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
