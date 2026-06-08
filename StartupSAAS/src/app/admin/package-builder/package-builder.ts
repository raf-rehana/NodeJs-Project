import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../core/services/modal.service';

interface SubscriptionPackage {
  id?: string | number;
  name: string;
  price: number;
  features: string[];
  recommended: boolean;
  badge: string;
  tagline: string;
  accent: string;
  accentLight: string;
  icon: string;
  currency: string;
  period: string;
}

@Component({
  selector: 'app-package-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-builder.html',
  styleUrl: './package-builder.css'
})
export class PackageBuilderComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly modalService = inject(ModalService);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  public packages = signal<SubscriptionPackage[]>([]);
  public showModal = signal(false);
  public isEditing = signal(false);
  public activePackage = signal<SubscriptionPackage>(this.getEmptyPackage());

  ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.http.get<SubscriptionPackage[]>(this.apiUrl).subscribe(data => this.packages.set(data));
  }

  getEmptyPackage(): SubscriptionPackage {
    return {
      name: '', price: 100000, features: ['Core Component 1'],
      recommended: false, badge: 'NEW', tagline: '',
      accent: '#0f172a', accentLight: '#f1f5f9', icon: 'bi-box-seam',
      currency: 'BDT', period: '/one-time'
    };
  }

  openAddModal() {
    this.activePackage.set(this.getEmptyPackage());
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEditModal(pkg: SubscriptionPackage) {
    this.activePackage.set(JSON.parse(JSON.stringify(pkg)));
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  updateField(field: keyof SubscriptionPackage, value: any) {
    this.activePackage.update(p => ({ ...p, [field]: value }));
    if (field === 'accent') {
      this.activePackage.update(p => ({ ...p, accentLight: p.accent + '15' }));
    }
  }

  updateFeature(index: number, value: string) {
    this.activePackage.update(p => {
      const f = [...p.features];
      f[index] = value;
      return { ...p, features: f };
    });
  }

  addFeature() {
    this.activePackage.update(p => ({ ...p, features: [...p.features, 'New capability'] }));
  }

  removeFeature(index: number) {
    this.activePackage.update(p => {
      const f = [...p.features];
      f.splice(index, 1);
      return { ...p, features: f };
    });
  }

  enforceSingleRecommended(pkg: SubscriptionPackage) {
    if (pkg.recommended) {
      this.packages().forEach(p => {
        if (p.id !== pkg.id) {
          p.recommended = false;
          if (p.id) this.http.put(`${this.apiUrl}/${p.id}`, p).subscribe();
        }
      });
    }
  }

  savePackage() {
    const pkg = this.activePackage();
    if (this.isEditing() && pkg.id) {
      this.http.put(`${this.apiUrl}/${pkg.id}`, pkg).subscribe(() => {
        this.enforceSingleRecommended(pkg);
        this.loadPackages();
        this.closeModal();
      });
    } else {
      this.http.post<SubscriptionPackage>(this.apiUrl, pkg).subscribe(res => {
        this.enforceSingleRecommended(res);
        this.loadPackages();
        this.closeModal();
      });
    }
  }

  async deletePackage(pkg: SubscriptionPackage) {
    if (!pkg.id) return;
    const confirmed = await this.modalService.confirm(`Decommission package cluster "${pkg.name}"?`);
    if (confirmed) {
      this.http.delete(`${this.apiUrl}/${pkg.id}`).subscribe(() => {
        this.loadPackages();
      });
    }
  }
}
