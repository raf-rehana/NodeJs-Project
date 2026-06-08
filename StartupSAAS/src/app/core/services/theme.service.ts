import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ThemeSettings {
  id?: number;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  siteName: string;
}

const DEFAULTS: ThemeSettings = {
  primaryColor: '#b07d50',
  accentColor:  '#6c757d',
  logoUrl:      '',
  fontFamily:   'Oswald, "Helvetica Neue", sans-serif',
  siteName:     'StartupSAAS',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly apiUrl = `${environment.apiUrl}/theme-settings`;
  readonly theme = signal<ThemeSettings>(DEFAULTS);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.load();
  }

  load(): void {
    this.http.get<ThemeSettings[]>(this.apiUrl).subscribe(settings => {
      const active = settings[0] ?? DEFAULTS;
      this.theme.set(active);
      this.apply(active);
    });
  }

  update(settings: ThemeSettings): ReturnType<HttpClient['put']> {
    const id = settings.id ?? '1';
    return this.http.put(`${this.apiUrl}/${id}`, { ...settings, id }).pipe(
      tap(() => {
        this.theme.set(settings);
        this.apply(settings);
      }),
    );
  }

  private apply(s: ThemeSettings): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', s.primaryColor);
    root.style.setProperty('--accent-color',  s.accentColor);
    root.style.setProperty('--font-family',   s.fontFamily);
    document.title = s.siteName;
  }
}
