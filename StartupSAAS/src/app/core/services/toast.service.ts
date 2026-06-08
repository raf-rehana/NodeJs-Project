import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  private show(message: string, type: Toast['type'], icon: string): void {
    const id = ++this.counter;
    this.toasts.update(current => [...current, { id, message, type, icon }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(message: string): void { this.show(message, 'success', 'bi-check-circle-fill'); }
  error(message: string): void   { this.show(message, 'error',   'bi-x-circle-fill'); }
  warning(message: string): void { this.show(message, 'warning', 'bi-exclamation-triangle-fill'); }
  info(message: string): void    { this.show(message, 'info',    'bi-info-circle-fill'); }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
