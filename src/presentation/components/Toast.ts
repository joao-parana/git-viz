export type ToastType = "success" | "error" | "warning";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ] ?? ch,
  );
}

export class Toast {
  private container: HTMLElement | null = null;

  mount(): void {
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  }

  show(type: ToastType, message: string): void {
    if (!this.container) return;
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-dot"></div>
      <div class="toast-msg">${escapeHtml(message)}</div>
      <span class="toast-x">✕</span>
    `;
    el.querySelector(".toast-x")?.addEventListener("click", () => el.remove());
    this.container.appendChild(el);
    setTimeout(() => {
      el.classList.add("hiding");
      setTimeout(() => el.remove(), 200);
    }, 3500);
  }
}
