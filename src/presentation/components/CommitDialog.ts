import { ptBR } from '../i18n/pt-BR';

const PREFIXES = ['feat:', 'fix:', 'docs:', 'chore:', 'refactor:', 'test:', 'style:', 'ci:'];

export interface CommitDialogCallbacks {
  onSave: (message: string) => void;
  onError: (message: string) => void;
}

export class CommitDialog {
  private dialogEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private activePrefix = 'feat:';

  constructor(private readonly callbacks: CommitDialogCallbacks) {}

  mount(container: HTMLElement): void {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.buildHTML();
    this.dialogEl = wrapper.firstElementChild as HTMLElement;
    container.appendChild(this.dialogEl);
    this.inputEl = this.dialogEl.querySelector<HTMLInputElement>('#commit-message-input');
    this.bindEvents();
  }

  open(): void {
    if (!this.dialogEl || !this.inputEl) return;
    this.inputEl.value = '';
    this.dialogEl.classList.remove('hidden');
    this.inputEl.focus();
  }

  close(): void {
    this.dialogEl?.classList.add('hidden');
  }

  private buildHTML(): string {
    const t = ptBR.commitDialog;
    const prefixButtons = PREFIXES.map((p, i) =>
      `<button class="prefix-btn${i === 0 ? ' active' : ''}" data-prefix="${p}">${p}</button>`,
    ).join('');

    return `
      <div id="commit-dialog" class="modal-overlay hidden">
        <div class="modal-content">
          <div class="modal-title">${t.title}</div>
          <div class="modal-label">${t.quickDefaults}</div>
          <div class="modal-prefixes">${prefixButtons}</div>
          <div class="modal-label">${t.placeholder}</div>
          <input id="commit-message-input" class="modal-input" type="text" placeholder="Descreva a mudança..." />
          <div class="modal-actions">
            <button id="btn-cancel-message" class="btn btn-secondary">${t.cancel}</button>
            <button id="btn-save-message" class="btn btn-primary">${t.save}</button>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.dialogEl || !this.inputEl) return;

    this.dialogEl.querySelector('#btn-save-message')?.addEventListener('click', () => this.save());
    this.dialogEl.querySelector('#btn-cancel-message')?.addEventListener('click', () => this.close());

    this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') this.save();
    });

    this.dialogEl.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.dialogEl) this.close();
    });

    this.dialogEl.querySelectorAll<HTMLButtonElement>('.prefix-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dialogEl!.querySelectorAll('.prefix-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activePrefix = btn.dataset['prefix'] ?? '';
        if (this.inputEl) {
          this.inputEl.focus();
        }
      });
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !this.dialogEl?.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  private save(): void {
    const suffix = (this.inputEl?.value ?? '').trim();
    if (!suffix) {
      this.callbacks.onError(ptBR.errors.emptyMessage);
      return;
    }
    const message = `${this.activePrefix} ${suffix}`;
    this.callbacks.onSave(message);
    this.close();
  }
}
