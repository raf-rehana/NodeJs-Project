import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private returnUrl: string | null = null;

  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string | null {
    const url = this.returnUrl;
    this.returnUrl = null; // Clear after reading
    return url;
  }
}
