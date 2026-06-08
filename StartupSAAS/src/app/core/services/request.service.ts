import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { ServiceRequest } from '../models/service-request';
import { environment } from '../../../environments/environment';
import { ServiceCatalogueService } from './service-catalogue';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly api = `${environment.apiUrl}/service-requests`;
  private readonly catalogue = inject(ServiceCatalogueService);

  constructor(private http: HttpClient) {}

  getMyRequests(userId: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.api}?userId:contains=${userId}`).pipe(
      switchMap(reqs => this.mapServiceNames(reqs))
    );
  }

  getAll(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(this.api).pipe(
      switchMap(reqs => this.mapServiceNames(reqs))
    );
  }

  getById(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.api}/${id}`).pipe(
      switchMap(req => this.mapServiceNames([req]).pipe(map(reqs => reqs[0])))
    );
  }

  private mapServiceNames(requests: ServiceRequest[]): Observable<ServiceRequest[]> {
    return this.catalogue.getServices().pipe(
      map(services => requests.map(req => {
        const svc = services.find(s => String(s.id) === String(req.serviceId));
        return {
          ...req,
          serviceName: req.serviceName || (svc ? svc.name : 'Unknown Service'),
          categoryName: req.categoryName || (svc ? svc.categoryName : 'Uncategorized')
        } as ServiceRequest;
      }))
    );
  }

  submit(data: Partial<ServiceRequest>): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.api, data);
  }

  update(id: number, payload: Partial<ServiceRequest>): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.api}/${id}`, payload);
  }

  assignTo(requestId: number, employeeId: number): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.api}/${requestId}`, {
      assignedTo: employeeId,
    });
  }
}
