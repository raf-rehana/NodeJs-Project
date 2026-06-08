import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="message">
      <div class="custom-modal">
        <div class="modal-header">
          <h5 class="m-0 fw-bold">Confirm Action</h5>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light rounded-pill px-4 fw-bold" (click)="onRespond(false)">Cancel</button>
          <button class="btn btn-primary rounded-pill px-4 fw-bold" (click)="onRespond(true)">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; backdrop-filter: blur(2px); }
    .custom-modal { background: white; padding: 25px; border-radius: 16px; width: 400px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: scaleIn 0.2s ease-out; }
    .modal-header { margin-bottom: 15px; border-bottom: none; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class ConfirmModalComponent {
  message: string | null = null;
  private resolveFn: ((value: boolean) => void) | null = null;

  constructor(private modalService: ModalService) {
    this.modalService.confirmState$.subscribe(state => {
      this.message = state.message;
      this.resolveFn = state.resolve;
    });
  }

  onRespond(value: boolean) {
    if (this.resolveFn) {
      this.resolveFn(value);
    }
    this.message = null;
    this.resolveFn = null;
  }
}
