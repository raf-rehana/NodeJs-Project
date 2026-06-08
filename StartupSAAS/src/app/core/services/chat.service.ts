import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: number;
  clientId?: string;
  clientName?: string;
  employeeId?: string;
  employeeName?: string;
  message: string;
  timestamp: string;
  type: 'client' | 'employee' | 'system';
}

export interface ChatUser {
  id: number;
  name: string;
  role: 'client' | 'employee' | 'admin';
  online: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly socket: Socket;

  readonly messages       = signal<ChatMessage[]>([]);
  readonly onlineClients  = signal<ChatUser[]>([]);
  readonly onlineEmployees = signal<ChatUser[]>([]);
  readonly currentUser    = signal<ChatUser | null>(null);
  readonly chatOpen       = signal(false);

  toggleChat(open: boolean): void { this.chatOpen.set(open); }

  constructor(private http: HttpClient) {
    this.socket = io(environment.backendUrl, { withCredentials: true });
    this.bindSocketEvents();
  }

  private bindSocketEvents(): void {
    this.socket.on('new-message', (msg: ChatMessage) =>
      this.messages.update(prev => [...prev, msg]),
    );
    this.socket.on('client-joined',  () => this.refreshOnlineClients());
    this.socket.on('client-left',    () => this.refreshOnlineClients());
    this.socket.on('employee-joined', () => this.refreshOnlineEmployees());
    this.socket.on('employee-left',   () => this.refreshOnlineEmployees());
  }

  authenticateUser(user: ChatUser): void {
    this.currentUser.set(user);
    if (user.role === 'client') {
      this.socket.emit('authenticate-client', { clientId: user.id, clientName: user.name });
    } else {
      this.socket.emit('authenticate-employee', { employeeId: user.id, employeeName: user.name });
    }
  }

  sendMessage(message: string, targetUserId?: string): void {
    if (!message.trim() || !this.socket.connected) return;
    const user = this.currentUser();
    if (!user) return;

    if (user.role === 'client') {
      this.socket.emit('client-message', { message });
    } else {
      this.socket.emit('employee-message', { message, clientId: targetUserId });
    }
  }

  sendTypingIndicator(): void {
    const user = this.currentUser();
    if (!user) return;
    if (user.role === 'client') this.socket.emit('client-typing', {});
    else this.socket.emit('employee-typing', {});
  }

  clearMessages(): void { this.messages.set([]); }

  disconnect(): void { this.socket.disconnect(); }

  private refreshOnlineClients(): void {
    this.http.get<ChatUser[]>(`${environment.apiUrl}/chat/online-clients`).subscribe(
      clients => this.onlineClients.set(clients),
    );
  }

  private refreshOnlineEmployees(): void {
    this.http.get<ChatUser[]>(`${environment.apiUrl}/chat/online-employees`).subscribe(
      employees => this.onlineEmployees.set(employees),
    );
  }
}
