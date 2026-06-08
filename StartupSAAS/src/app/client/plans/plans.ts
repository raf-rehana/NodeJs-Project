import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { RequestService } from '../../core/services/request.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.html',
  styleUrl: './plans.css',
})
export class PlansComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(RequestService);
  private readonly notificationService = inject(NotificationService);

  public config = signal({
    projectName: '',
    projectType: 'Web Application',
    timeline: '1-3 Months',
    budget: 'BDT 50,000 - BDT 100,000',
    targetAudience: '',
    existingBranding: 'No',
    keyFeatures: '',
    description: ''
  });

  public loading = signal(false);

  updateConfig(field: string, value: string) {
    this.config.update(c => ({ ...c, [field]: value }));
  }

  submitConfig() {
    const user = this.authService.currentUser();
    if (!user) {
      this.toastService.error('Authentication required to submit proposals.');
      return;
    }

    const currentConfig = this.config();

    if (!currentConfig.projectName || !currentConfig.description) {
      this.toastService.warning('Critical fields missing. Please complete the package brief.');
      return;
    }

    this.loading.set(true);
    
    const clientNotes = `Timeline: ${currentConfig.timeline}\n` +
                        `Budget Range: ${currentConfig.budget}\n` +
                        `Target Audience: ${currentConfig.targetAudience}\n` +
                        `Existing Branding? ${currentConfig.existingBranding}\n` +
                        `Core Features: ${currentConfig.keyFeatures}\n\n` +
                        `Abstract: ${currentConfig.description}`;

    const proposalPayload = {
      userId: user.id,
      clientEmail: user.email,
      serviceName: currentConfig.projectName,
      categoryName: currentConfig.projectType,
      status: 'PROPOSAL_PENDING' as const,
      priority: 'NORMAL' as const,
      clientNotes: clientNotes,
      createdAt: new Date().toISOString(),
      progress: 0
    };

    this.requestService.submit(proposalPayload).subscribe({
      next: () => {
        this.loading.set(false);
        
        // Broadcast telemetry to Admins
        const alertMsg = `A new custom package proposal "${currentConfig.projectName}" has been registered by ${user.name || 'Client'}.`;
        this.notificationService.create({ userId: 10151, title: 'New Custom Package', message: alertMsg, type: 'INFO' }).subscribe();
        this.notificationService.create({ userId: 10141, title: 'New Custom Package', message: alertMsg, type: 'INFO' }).subscribe();

        this.toastService.success('Package Proposal Registered Successfully.');
        this.router.navigate(['/client/requested-projects']);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastService.error('Transmission failed.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }
}
