import { ptBR } from '../i18n/pt-BR';

export interface CommandEntry {
  command: string;
  description: string;
  ts: number;
}

export interface HistoryPanelCallbacks {
  onUndo: () => void;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] ?? ch),
  );
}

export class HistoryPanel {
  private listEl: HTMLElement | null = null;

  constructor(private readonly callbacks: HistoryPanelCallbacks) {}

  mount(container: HTMLElement): void {
    container.innerHTML = this.buildHTML();
    this.listEl = container.querySelector<HTMLElement>('#history-list');
    container.querySelector('#btn-undo')?.addEventListener('click', () => {
      this.callbacks.onUndo();
    });
  }

  update(entries: CommandEntry[]): void {
    if (!this.listEl) return;
    this.listEl.innerHTML = entries
      .map(
        (h, i) => `
        <div class="history-item">
          <div class="meta">
            <span>#${i + 1}</span>
            <span>${new Date(h.ts).toLocaleTimeString('pt-BR')}</span>
          </div>
          <div class="command"><code>${escapeHtml(h.command)}</code></div>
          <div class="meta">${escapeHtml(h.description)}</div>
        </div>
      `,
      )
      .join('');
  }

  private buildHTML(): string {
    const t = ptBR.history;
    return `
      <h2>${t.title}</h2>
      <div class="history-controls">
        <button id="btn-undo" class="secondary">${t.undo}</button>
      </div>
      <div id="history-list" class="history-list"></div>
    `;
  }
}
