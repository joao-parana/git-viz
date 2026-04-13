import { ptBR } from '../i18n/pt-BR';

const DEFAULT_PREFIXES = ['fix: ', 'feat: ', 'docs: ', 'refactor: ', 'chore: ', 'test: '];

export interface CommitDialogCallbacks {
  onSave: (message: string) => void;
}

export class CommitDialog {
  private dialogEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;

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
    const prefixButtons = DEFAULT_PREFIXES.map(p => {
      const label = p.replace(': ', '');
      return `<button class="default-btn" data-message="${p}">${label}</button>`;
    }).join('');

    return `
      <div id="commit-dialog" class="modal hidden">
        <div class="modal-content">
          <h2>${t.title}</h2>
          <input id="commit-message-input" type="text" placeholder="${t.placeholder}" />
          <div class="default-messages">
            <p>${t.quickDefaults}</p>
            <div class="default-buttons">${prefixButtons}</div>
          </div>
          <div class="modal-buttons">
            <button id="btn-save-message" class="primary">${t.save}</button>
            <button id="btn-cancel-message" class="secondary">${t.cancel}</button>
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

    this.dialogEl.querySelectorAll<HTMLButtonElement>('.default-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prefix = btn.dataset['message'] ?? '';
        if (this.inputEl) {
          this.inputEl.value = prefix;
          this.inputEl.focus();
          this.inputEl.setSelectionRange(prefix.length, prefix.length);
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
    const message = (this.inputEl?.value ?? '').trim();
    if (!message) {
      alert(ptBR.errors.emptyMessage);
      return;
    }
    this.callbacks.onSave(message);
    this.close();
  }
}
