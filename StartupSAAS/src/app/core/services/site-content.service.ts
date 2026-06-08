import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SiteContent } from '../models/site-content';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly api = `${environment.apiUrl}/site-content`;

  constructor(private http: HttpClient) {}

  getSiteContent(): Observable<SiteContent | null> {
    return this.http.get<SiteContent[]>(this.api).pipe(
      map(contents => contents[0] ?? null),
      catchError(() => of(null)),
    );
  }

  getActiveContent(): Observable<SiteContent | null> {
    return this.http.get<SiteContent[]>(`${this.api}?isActive=true`).pipe(
      map(contents => contents[0] ?? null),
      catchError(() => of(null)),
    );
  }

  getSiteContentById(id: number): Observable<SiteContent | null> {
    return this.http.get<SiteContent>(`${this.api}/${id}`).pipe(
      catchError(() => of(null)),
    );
  }

  createSiteContent(content: SiteContent): Observable<SiteContent> {
    return this.http.post<SiteContent>(this.api, content);
  }

  updateSiteContent(id: string | number, content: Partial<SiteContent>): Observable<SiteContent> {
    return this.http.patch<SiteContent>(`${this.api}/${id}`, content);
  }

  updateSiteContentFull(id: string | number, content: SiteContent): Observable<SiteContent> {
    return this.http.put<SiteContent>(`${this.api}/${id}`, content);
  }

  deleteSiteContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
