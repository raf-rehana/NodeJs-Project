import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { RequestService } from '../../core/services/request.service';
import { User } from '../../core/models/user';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.css'
})
export class EmployeeManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly requestService = inject(RequestService);
  private readonly modalService = inject(ModalService);

  public employee = signal<User[]>([]);
  public selectedEmployee = signal<User | null>(null);
  public showAddForm = signal(false);
  public workloads = signal<{ [key: string]: number }>({});
  
  public newEmployee = signal<Partial<User>>({
    name: '',
    email: '',
    password: 'demo123',
    role: 'EMPLOYEE',
    designation: 'Full Stack Developer'
  });

  ngOnInit() {
    this.loadEmployee();
  }

  loadEmployee() {
    this.adminService.getUsers('EMPLOYEE').subscribe(data => {
      this.employee.set(data);
      this.calculateWorkloads();
    });
  }

  calculateWorkloads() {
    this.requestService.getAll().subscribe(requests => {
      const w: { [key: string]: number } = {};
      requests.forEach(req => {
        if (req.assignedTo && req.status !== 'COMPLETED' && req.status !== 'REJECTED') {
          const empId = String(req.assignedTo);
          w[empId] = (w[empId] || 0) + 1;
        }
      });
      this.workloads.set(w);
    });
  }

  viewProfile(user: User) {
    this.selectedEmployee.set(user);
  }

  closeProfile() {
    this.selectedEmployee.set(null);
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
    if (this.showAddForm()) {
      this.newEmployee.set({ name: '', email: '', password: 'demo123', role: 'EMPLOYEE', designation: 'Full Stack Developer' });
    }
  }

  updateNewEmployee(field: keyof User, value: string) {
    this.newEmployee.update(e => ({ ...e, [field]: value }));
  }

  addEmployee() {
    this.adminService.addUser(this.newEmployee()).subscribe(() => {
      this.loadEmployee();
      this.showAddForm.set(false);
    });
  }

  async deleteEmployee(id: string | number) {
    const confirmed = await this.modalService.confirm('Terminate engineering resource?');
    if (confirmed) {
      this.adminService.deleteUser(Number(id)).subscribe(() => this.loadEmployee());
    }
  }
}
