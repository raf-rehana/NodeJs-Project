import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private readonly _loading = signal(false);
  readonly isLoading = this._loading.asReadonly();

  show(): void {
    this._loading.set(++this.count > 0);
  }

  hide(): void {
    if (--this.count <= 0) {
      this.count = 0;
      this._loading.set(false);
    }
  }
}
