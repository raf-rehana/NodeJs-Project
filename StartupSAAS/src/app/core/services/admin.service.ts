import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../models/user';
import { Service } from '../models/service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(role?: string): Observable<User[]> {
    const url = role ? `${this.api}/users?role=${role}` : `${this.api}/users`;
    return this.http.get<User[]>(url);
  }

  addUser(user: Partial<User>): Observable<User> {
    return this.getUsers().pipe(
      switchMap(users => {
        const max = Math.max(0, ...users.map(u => Number(u.id)).filter(n => !isNaN(n)));
        return this.http.post<User>(`${this.api}/users`, { ...user, id: max + 1 });
      }),
    );
  }

  updateUser(id: string | number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.api}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }

  addService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.api}/services`, service);
  }

  updateService(id: string | number, service: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.api}/services/${id}`, service);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.api}/services/${id}`);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/services/${id}`);
  }
}
