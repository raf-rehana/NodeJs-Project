import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeSettings } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-settings.html',
  styleUrl: './theme-settings.css'
})
export class ThemeSettingsComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);

  public isSaving = signal(false);
  public uploadError = signal('');
  public isDragOver = signal(false);

  public settings = signal<ThemeSettings>({
    primaryColor: '#b07d50',
    accentColor: '#6c757d',
    fontFamily: "'Inter', sans-serif",
    siteName: 'StartupSAAS',
    logoUrl: ''
  });

  public primaryPresets = [
    '#0f172a', '#1e293b', '#4f46e5', '#2563eb', '#0891b2', '#059669', '#16a34a', '#d97706', '#dc2626', '#e11d48'
  ];
  public accentPresets = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'
  ];
  public fontOptions = [
    { label: 'Inter (Modern & Clean)', value: "'Inter', sans-serif" },
    { label: 'Roboto (Google Standard)', value: "'Roboto', sans-serif" },
    { label: 'Poppins (Geometric)', value: "'Poppins', sans-serif" },
    { label: 'Outfit (Tech & Startup)', value: "'Outfit', sans-serif" },
    { label: 'Open Sans (Highly Legible)', value: "'Open Sans', sans-serif" },
    { label: 'Plus Jakarta Sans (Premium)', value: "'Plus Jakarta Sans', sans-serif" }
  ];

  public previewCards = [
    { icon: 'bi-rocket-takeoff', title: 'Launch Fast', text: 'Deploy your instance rapidly' },
    { icon: 'bi-shield-check', title: 'Secure Vault', text: 'Military-grade encryption' },
    { icon: 'bi-graph-up-arrow', title: 'Scale Infinitely', text: 'Elastic compute package' }
  ];

  ngOnInit() {
    this.settings.set({ ...this.themeService.theme() });
  }

  updateSetting(field: keyof ThemeSettings, value: string) {
    this.settings.update(s => ({ ...s, [field]: value }));
    this.applyLivePreview();
  }

  applyLivePreview() {
    const s = this.settings();
    document.documentElement.style.setProperty('--primary-color', s.primaryColor);
    document.documentElement.style.setProperty('--accent-color', s.accentColor);
    document.documentElement.style.setProperty('--font-family', s.fontFamily);
  }

  saveSettings() {
    this.isSaving.set(true);
    this.themeService.update(this.settings()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.success('Theme package globally deployed.');
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.error('Deployment failed.');
      }
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      this.uploadError.set('Payload exceeds 2MB limit.');
      return;
    }
    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml)/)) {
      this.uploadError.set('Invalid signature. Only PNG/JPG/SVG accepted.');
      return;
    }
    this.uploadError.set('');
    const reader = new FileReader();
    reader.onload = (e) => {
      this.updateSetting('logoUrl', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.updateSetting('logoUrl', '');
  }
}
