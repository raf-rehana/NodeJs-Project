import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, switchMap } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly _user = signal<User | null>(this.rehydrate());

  readonly currentUser  = this._user.asReadonly();
  readonly isSuperAdmin = computed(() => this._user()?.role === 'SUPER_ADMIN');
  readonly isAdmin      = computed(() => this._user()?.role === 'ADMIN');
  readonly isEmployee   = computed(() => this._user()?.role === 'EMPLOYEE');
  readonly isClient     = computed(() => this._user()?.role === 'CLIENT');

  constructor(private http: HttpClient, private router: Router) {
    const cached = this._user();
    if (cached) {
      this.http.get<User>(`${this.apiUrl}/users/${cached.id}`).subscribe({
        next: fresh => this.persist({ user: fresh, token: this.getToken()! }),
        error: () => this.logout(),
      });
    }
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`).pipe(
      map(users => users.length > 0),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`).pipe(
      map(users => {
        if (!users.length) throw new Error('Invalid credentials');
        const user = users[0]!;
        return { user, token: `mock-jwt-token-${user.id}` };
      }),
      tap(res => this.persist(res)),
    );
  }

  register(data: Partial<User>): Observable<AuthResponse> {
    return this.getAllUsers().pipe(
      switchMap(users => {
        const max = Math.max(0, ...users.map(u => Number(u.id)).filter(n => !isNaN(n)));
        return this.http.post<User>(`${this.apiUrl}/users`, {
          ...data, role: 'CLIENT', id: String(max + 1),
        });
      }),
      map(user => ({ user, token: `mock-jwt-token-${user.id}` })),
      tap(res => this.persist(res)),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this._user();
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.role === role;
  }

  updateProfile(user: User): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${user.id}`, user).pipe(
      tap(updated => {
        if (this._user()?.id === updated.id) this.persist({ user: updated, token: this.getToken()! });
      }),
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  private rehydrate(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._user.set(res.user);
  }
}
