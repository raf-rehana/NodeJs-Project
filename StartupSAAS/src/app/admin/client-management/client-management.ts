import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-management.html',
  styleUrl: './client-management.css'
})
export class ClientManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly modalService = inject(ModalService);

  public clients = signal<User[]>([]);
  public selectedUser = signal<User | null>(null);
  public showAddForm = signal(false);
  
  public newClient = signal<Partial<User>>({
    name: '',
    email: '',
    password: 'demo123',
    role: 'CLIENT'
  });

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.adminService.getUsers('CLIENT').subscribe(data => this.clients.set(data));
  }

  viewProfile(user: User) {
    this.selectedUser.set(user);
  }

  closeProfile() {
    this.selectedUser.set(null);
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
    if (this.showAddForm()) {
      this.newClient.set({ name: '', email: '', password: 'demo123', role: 'CLIENT' });
    }
  }

  updateNewClient(field: keyof User, value: string) {
    this.newClient.update(c => ({ ...c, [field]: value }));
  }

  addClient() {
    this.adminService.addUser(this.newClient()).subscribe(() => {
      this.loadClients();
      this.showAddForm.set(false);
    });
  }

  changeRole(user: User, newRole: string) {
    this.adminService.updateUser(user.id, { role: newRole as any }).subscribe(() => {
      user.role = newRole as any;
    });
  }

  async deleteClient(id: string | number) {
    const confirmed = await this.modalService.confirm('Expunge entity records permanently?');
    if (confirmed) {
      this.adminService.deleteUser(Number(id)).subscribe(() => this.loadClients());
    }
  }
}
