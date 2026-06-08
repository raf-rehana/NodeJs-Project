import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, ServiceCategory } from '../models/service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogueService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/categories`);
  }

  getServices(categoryId?: string): Observable<Service[]> {
    const url = categoryId ? `${this.apiUrl}/services?categoryId=${categoryId}` : `${this.apiUrl}/services`;
    return this.http.get<Service[]>(url);
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`);
  }

  getPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subscriptions`);
  }
}
