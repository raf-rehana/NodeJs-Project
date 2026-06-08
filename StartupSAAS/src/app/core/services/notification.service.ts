import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { Notification } from '../models/notification';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = `${environment.apiUrl}/notifications`;
  readonly unreadCount = signal(0);

  constructor(private http: HttpClient) {}

  // Fetches by both numeric and string userId to handle legacy ID inconsistencies in the DB.
  getAll(userId: number): Observable<Notification[]> {
    const byNum$ = this.http.get<Notification[]>(`${this.api}?userId=${Number(userId)}`).pipe(catchError(() => of([])));
    const byStr$ = this.http.get<Notification[]>(`${this.api}?userId=${String(userId)}`).pipe(catchError(() => of([])));

    return forkJoin([byNum$, byStr$]).pipe(
      map(([byNum, byStr]) => {
        const seen = new Set(byNum.map(n => n.id));
        return [...byNum, ...byStr.filter(n => !seen.has(n.id))];
      }),
      tap(n => this.unreadCount.set(n.filter(x => !x.isRead).length)),
    );
  }

  markRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.api}/${id}`, { isRead: true });
  }

  markAllRead(userId: number): Observable<Notification[]> {
    return this.getAll(userId).pipe(
      switchMap(notifications => {
        const unread = notifications.filter(n => !n.isRead);
        return unread.length ? forkJoin(unread.map(n => this.markRead(n.id))) : of([]);
      }),
    );
  }

  create(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.api, {
      ...notification,
      userId: Number(notification.userId),
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }
}
