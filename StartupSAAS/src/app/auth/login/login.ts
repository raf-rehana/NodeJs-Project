import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RedirectService } from '../../core/services/redirect.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  returnUrl = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private redirectService: RedirectService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
    this.returnUrl.set(this.route.snapshot.queryParams['returnUrl'] || '');
  }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail && savedPassword) {
      this.form.patchValue({
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const emailVal = this.email?.value;
    const passwordVal = this.password?.value;
    const rememberMeVal = this.form.get('rememberMe')?.value;

    if (rememberMeVal) {
      localStorage.setItem('remembered_email', emailVal);
      localStorage.setItem('remembered_password', passwordVal);
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
    }

    this.auth.checkEmail(emailVal).pipe(
      switchMap(exists => {
        if (!exists) {
          this.error.set('Authentication failed. Identity not found in registry.');
          this.loading.set(false);
          return EMPTY;
        }
        return this.auth.login(emailVal, passwordVal);
      })
    ).subscribe({
      next: (res) => {
        const role = res.user.role;
        const storedReturnUrl = this.redirectService.getReturnUrl();
        const finalRoute = this.returnUrl() || storedReturnUrl || '/client';

        let targetRoute = finalRoute;
        if (!this.returnUrl() && !storedReturnUrl) {
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') targetRoute = '/admin/dashboard';
          else if (role === 'EMPLOYEE') targetRoute = '/employee/summary';
          else targetRoute = '/client/dashboard';
        }

        this.router.navigateByUrl(targetRoute).catch(err => {
          this.error.set('Routing package error: ' + err.message);
          this.loading.set(false);
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message || 'Invalid cryptographic credentials.');
        this.loading.set(false);
      }
    });
  }
}
