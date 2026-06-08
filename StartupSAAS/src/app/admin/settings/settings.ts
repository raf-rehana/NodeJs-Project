import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html'
})
export class AdminSettingsComponent {
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  public settings = signal({
    platformName: 'StartupSAAS',
    supportEmail: 'support@startupsaas.io',
    supportPhone: '+880 1700 000000',
    currency: 'BDT',
    maintenanceMode: false,
  });

  public gateways = signal([
    { id: 1, name: 'bKash', description: 'Mobile banking payment', enabled: true },
    { id: 2, name: 'Nagad', description: 'Digital financial service', enabled: true },
    { id: 3, name: 'Bank Transfer', description: 'Direct bank transfer', enabled: true },
    { id: 4, name: 'SSLCommerz', description: 'Online payment gateway', enabled: false },
    { id: 5, name: 'Stripe', description: 'International card payments', enabled: false },
  ]);

  public notifications = signal([
    { id: 1, label: 'New request submitted', enabled: true },
    { id: 2, label: 'Request status changed', enabled: true },
    { id: 3, label: 'Invoice generated', enabled: true },
    { id: 4, label: 'New client registered', enabled: false },
    { id: 5, label: 'Employee assigned to task', enabled: false },
  ]);

  updateSetting(field: string, value: any) {
    this.settings.update(s => ({ ...s, [field]: value }));
  }

  updateGateway(id: number, enabled: boolean) {
    this.gateways.update(gws => gws.map(gw => gw.id === id ? { ...gw, enabled } : gw));
  }

  updateNotification(id: number, enabled: boolean) {
    this.notifications.update(notifs => notifs.map(n => n.id === id ? { ...n, enabled } : n));
  }

  saveSettings() {
    this.toastService.success('Global configuration compiled successfully.');
  }

  async clearCache() {
    const confirmed = await this.modalService.confirm('Warning: This will flush active system cache. Proceed?');
    if (confirmed) {
      this.toastService.success('System cache successfully flushed.');
    }
  }

  exportData() {
    this.toastService.success('Database export initiated via background thread. Awaiting email dispatch.');
  }
}
