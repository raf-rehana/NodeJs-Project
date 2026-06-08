import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private confirmSubject = new Subject<{ message: string, resolve: (value: boolean) => void }>();
  confirmState$ = this.confirmSubject.asObservable();

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ message, resolve });
    });
  }

  alert(message: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.confirmSubject.next({ message, resolve: (val: any) => resolve() });
    });
  }
}
