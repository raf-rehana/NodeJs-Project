import { Component, OnInit, ChangeDetectorRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { Service } from '../../core/models/service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogueService = inject(ServiceCatalogueService);
  private readonly requestService = inject(RequestService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  public selectedService = signal<Service | null>(null);
  public notes = signal<string>('');
  public priority = signal<string>('NORMAL');
  public loading = signal<boolean>(false);
  
  public uploadedFiles = signal<File[]>([]);
  public uploadedImages = signal<File[]>([]);
  public imagePreviews = signal<string[]>([]);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const serviceId = params['serviceId'];
      if (serviceId) {
        this.catalogueService.getServiceById(serviceId.toString()).subscribe(data => {
          this.selectedService.set(data);
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }

  onRequiredDocSelected(event: any, docName: string) {
    const file = event.target.files[0];
    if (file) {
      const blob = file.slice(0, file.size, file.type);
      const newFile = new File([blob], `${docName} - ${file.name}`, { type: file.type });
      this.uploadedFiles.update(files => [...files, newFile]);
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.update(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

  isDocumentUploaded(docName: string): boolean {
    return this.uploadedFiles().some(f => f.name.toLowerCase().includes(docName.toLowerCase()));
  }

  submit() {
    const service = this.selectedService();
    if (!service) {
      this.toastService.error('Error: No service selected.');
      return;
    }
    const user = this.authService.currentUser();
    if (!user) {
      this.toastService.error('Error: Authentication required.');
      this.router.navigate(['/login']);
      return;
    }

    if (service.requiredDocuments) {
      const missing = service.requiredDocuments
        .filter(d => d.isMandatory && !this.isDocumentUploaded(d.docName));
      
      if (missing.length > 0) {
        this.toastService.warning('Mandatory documents missing: ' + missing.map(m => m.docName).join(', '));
        return;
      }
    }

    this.loading.set(true);
    
    // Simulating file upload to cloud storage
    const allFiles = [...this.uploadedFiles(), ...this.uploadedImages()];
    const mockDocuments = allFiles.map((file) => ({
      id: Math.floor(Math.random() * 1000000),
      name: file.name,
      url: `assets/docs/${file.name}`, // Mock URL
      uploadedAt: new Date().toISOString()
    }));

    const requestData = {
      userId: user.id,
      clientEmail: user.email,
      serviceId: service.id,
      serviceName: service.name,
      categoryName: service.categoryName,
      status: 'PENDING' as const,
      priority: this.priority() as 'NORMAL' | 'HIGH',
      clientNotes: this.notes(),
      progress: 0,
      createdAt: new Date().toISOString(),
      documents: mockDocuments
    };

    this.requestService.submit(requestData).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.router.navigate(['/client/payments'], {
          queryParams: {
            serviceId: service.id,
            serviceName: service.name,
            requestId: res.id,
            amount: service.price
          }
        });
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastService.error('Network failure during submission.');
      }
    });
  }
}
