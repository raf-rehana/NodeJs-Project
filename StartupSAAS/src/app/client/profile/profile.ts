import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { LocationService, Country, LocationNode } from '../../core/services/location.service';
import { User } from '../../core/models/user';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastService = inject(ToastService);

  user = signal<User | null>(null);
  countries = signal<Country[]>([]);
  selectedCountry = signal<Country | null>(null);
  
  divisions = signal<LocationNode[]>([]);
  districts = signal<LocationNode[]>([]);
  thanas = signal<LocationNode[]>([]);
  
  selectedDivision = signal<string>('');
  selectedDistrict = signal<string>('');
  selectedThana = signal<string>('');
  
  phoneNumber = signal<string>('');
  village = signal<string>('');
  
  loading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  currentPlan = signal<string | null>(null);
  newPassword = '';

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    this.user.set(currentUser ? { ...currentUser } : null);
    this.countries.set(this.locationService.getCountries());
    
    if (this.user()) {
      this.parseUserAddress();
      this.loadUserSubscription();
    } else {
      const defaultCountry = this.countries().find(c => c.name === 'Bangladesh') || this.countries()[0];
      this.selectedCountry.set(defaultCountry);
    }

    this.loadHierarchy();
  }

  updateUserField(field: keyof User, value: any): void {
    const u = this.user();
    if (u) {
      this.user.set({ ...u, [field]: value });
    }
  }

  updateSelectedCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.selectedDivision.set('');
    this.selectedDistrict.set('');
    this.selectedThana.set('');
    this.loadHierarchy();
  }

  updateDivision(divisionName: string): void {
    this.selectedDivision.set(divisionName);
    const division = this.divisions().find(d => d.name === divisionName);
    this.districts.set(division ? (division.children || []) : []);
    
    if (this.selectedDistrict() && !this.districts().find(d => d.name === this.selectedDistrict())) {
      this.selectedDistrict.set('');
    }
    
    if (this.selectedDistrict()) {
      this.updateDistrict(this.selectedDistrict());
    } else {
      this.thanas.set([]);
    }
  }

  updateDistrict(districtName: string): void {
    this.selectedDistrict.set(districtName);
    const district = this.districts().find(d => d.name === districtName);
    this.thanas.set(district ? (district.children || []) : []);
    
    if (this.selectedThana() && !this.thanas().find(t => t.name === this.selectedThana())) {
      this.selectedThana.set('');
    }
  }

  private parseUserAddress(): void {
    const u = this.user();
    if (!u) return;
    
    if (u.phone) {
      const parts = u.phone.split(' ');
      if (parts.length > 1) {
        this.selectedCountry.set(this.countries().find(c => c.code === parts[0]) || null);
        this.phoneNumber.set(parts.slice(1).join(' '));
      }
    }

    if (u.division) this.selectedDivision.set(u.division);
    if (u.district) this.selectedDistrict.set(u.district);
    if (u.policeStation) this.selectedThana.set(u.policeStation);

    if (u.address) {
      const parts = u.address.split(', ');
      if (parts.length >= 2) {
        this.village.set(parts[0]);
        this.selectedCountry.set(this.countries().find(c => c.name === parts[parts.length - 1]) || this.selectedCountry());
      }
    }
  }

  private loadUserSubscription(): void {
    const u = this.user();
    if (!u) return;
    
    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        const userPayments = payments
          .filter(p => p.clientId === u.id && (p.status === 'PAID' || p.status === 'PENDING'))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
        if (userPayments.length > 0) {
          this.currentPlan.set(userPayments[0].item);
        }
      }
    });
  }

  private loadHierarchy(): void {
    const countryName = this.selectedCountry()?.name || '';
    this.locationService.getHierarchy(countryName).subscribe({
      next: (data) => {
        this.divisions.set(data);
        if (this.selectedDivision()) {
          this.updateDivision(this.selectedDivision());
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File is too large. Max 5MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_SIZE = 400;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        const u = this.user();
        if (u) {
          this.user.set({ ...u, avatar: compressedBase64 });
          this.toastService.info('New photo selected. Save changes to apply.');
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    const u = this.user();
    if (!u) return;
    
    this.loading.set(true);

    const parts = [
      this.village(),
      this.selectedCountry()?.name
    ].filter(Boolean);
    
    const updatedUser: User = {
      ...u,
      address: parts.join(', '),
      division: this.selectedDivision(),
      district: this.selectedDistrict(),
      policeStation: this.selectedThana(),
      phone: `${this.selectedCountry()?.code} ${this.phoneNumber()}`
    };

    if (this.newPassword && this.newPassword.trim() !== '') {
      updatedUser.password = this.newPassword;
    }
    
    this.user.set(updatedUser);
    
    this.authService.updateProfile(updatedUser).subscribe({
      next: () => {
        this.loading.set(false);
        this.isEditMode.set(false);
        this.toastService.success('Profile updated successfully!');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Error updating profile.');
      }
    });
  }

  toggleEdit(): void {
    this.isEditMode.set(!this.isEditMode());
    if (!this.isEditMode()) {
      const currentUser = this.authService.currentUser();
      this.user.set(currentUser ? { ...currentUser } : null);
      this.parseUserAddress();
    }
  }
}
