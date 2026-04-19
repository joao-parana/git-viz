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
  private emptyEl: HTMLElement | null = null;

  constructor(private readonly callbacks: HistoryPanelCallbacks) {}

  mount(container: HTMLElement): void {
    container.classList.add('history-panel');
    container.innerHTML = this.buildHTML();
    this.listEl = container.querySelector<HTMLElement>('#history-list');
    this.emptyEl = container.querySelector<HTMLElement>('#history-empty');
    container.querySelector('#btn-undo')?.addEventListener('click', () => {
      this.callbacks.onUndo();
    });
  }

  update(entries: CommandEntry[]): void {
    if (!this.listEl || !this.emptyEl) return;

    if (entries.length === 0) {
      this.listEl.style.display = 'none';
      this.emptyEl.style.display = 'flex';
      return;
    }

    this.emptyEl.style.display = 'none';
    this.listEl.style.display = 'block';
    this.listEl.innerHTML = entries
      .map(
        (h, i) => `
        <div class="history-item">
          <div class="history-item-row">
            <span class="history-item-num">#${i + 1}</span>
            <span class="history-item-time">${new Date(h.ts).toLocaleTimeString('pt-BR')}</span>
          </div>
          <div class="history-item-cmd">${escapeHtml(h.command)}</div>
          <div class="history-item-desc">${escapeHtml(h.description)}</div>
        </div>
      `,
      )
      .join('');
  }

  private buildHTML(): string {
    const t = ptBR.history;
    return `
      <div class="history-header">
        <span class="history-title">${t.title}</span>
        <button id="btn-undo" class="btn btn-danger btn-sm">↩ ${t.undo}</button>
      </div>
      <div id="history-list" class="history-list" style="display:none"></div>
      <div id="history-empty" class="history-empty">
        <div class="history-empty-icon">[ ]</div>
        <div class="history-empty-text">Nenhuma ação ainda</div>
        <div class="history-empty-sub">Execute um comando para ver o histórico aqui.</div>
      </div>
    `;
  }
}
