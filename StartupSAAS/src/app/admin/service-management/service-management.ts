import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { Service } from '../../core/models/service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-management.html'
})
export class ServiceManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly catalogueService = inject(ServiceCatalogueService);
  private readonly modalService = inject(ModalService);

  public services = signal<Service[]>([]);
  public categories = signal<any[]>([]);
  
  public showForm = signal(false);
  public isEditing = signal(false);
  public activeService = signal<any>(this.getEmptyService());

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.catalogueService.getCategories().subscribe(cats => this.categories.set(cats));
    this.catalogueService.getServices().subscribe(srvs => this.services.set(srvs));
  }

  getEmptyService() {
    return {
      name: '', categoryId: '', categoryName: '', price: 0,
      priceType: 'FIXED', deliveryDays: '', description: '',
      isActive: true, link: '/client/payments'
    };
  }

  openAdd() {
    this.activeService.set(this.getEmptyService());
    this.isEditing.set(false);
    this.showForm.set(true);
  }

  editService(service: Service) {
    this.activeService.set({ ...service });
    this.isEditing.set(true);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.activeService.set(this.getEmptyService());
  }

  updateField(field: string, value: any) {
    this.activeService.update(s => ({ ...s, [field]: value }));
    if (field === 'categoryId') {
      const cat = this.categories().find(c => String(c.id) === String(value));
      if (cat) this.activeService.update(s => ({ ...s, categoryName: cat.name }));
    }
  }

  addService() {
    this.adminService.addService(this.activeService()).subscribe(() => {
      this.loadData();
      this.cancelEdit();
    });
  }

  updateService() {
    // Assuming adminService.updateService exists, otherwise use requestService or HTTP put
    const payload = this.activeService();
    this.adminService.updateService(payload.id, payload).subscribe(() => {
      this.loadData();
      this.cancelEdit();
    });
  }

  async deleteService(id: string | number) {
    const confirmed = await this.modalService.confirm('Decommission this service tier?');
    if (confirmed) {
      this.adminService.deleteService(Number(id)).subscribe(() => this.loadData());
    }
  }
}
