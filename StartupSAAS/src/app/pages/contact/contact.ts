import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  formData = signal({
    name: '',
    email: '',
    service: 'Enterprise Package',
    message: ''
  });

  isSubmitted = signal(false);

  submitForm() {
    this.isSubmitted.set(true);
    
    setTimeout(() => {
      this.isSubmitted.set(false);
      this.formData.set({ name: '', email: '', service: 'Enterprise Package', message: '' });
    }, 5000);
  }

  updateField(field: string, value: string) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
