import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="toast-item toast-{{ toast.type }}">
          <div class="d-flex align-items-center gap-3">
            <i class="bi {{ toast.icon }} toast-icon"></i>
            <span class="toast-message flex-grow-1">{{ toast.message }}</span>
            <button class="toast-close" (click)="toastSvc.dismiss(toast.id)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="toast-progress"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px; right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast-item {
      display: block;
      border-radius: 14px;
      padding: 14px 18px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.18);
      animation: slideIn 0.3s ease;
      overflow: hidden;
      position: relative;
      backdrop-filter: blur(8px);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-success { background: #16a34a; color: #fff; }
    .toast-error   { background: #dc2626; color: #fff; }
    .toast-warning { background: #d97706; color: #fff; }
    .toast-info    { background: var(--primary-color); color: #fff; }
    .toast-icon    { font-size: 1.2rem; flex-shrink: 0; }
    .toast-message { font-size: 0.9rem; font-weight: 500; line-height: 1.4; }
    .toast-close {
      background: rgba(255,255,255,0.2);
      border: none; color: white;
      border-radius: 6px;
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      font-size: 0.75rem; transition: background 0.2s;
    }
    .toast-close:hover { background: rgba(255,255,255,0.35); }
    .toast-progress {
      position: absolute;
      bottom: 0; left: 0;
      height: 3px;
      background: rgba(255,255,255,0.45);
      border-radius: 0 0 14px 14px;
      animation: progress 4s linear forwards;
      width: 100%;
    }
    @keyframes progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `],
})
export class ToastComponent {
  protected readonly toastSvc = inject(ToastService);
}
