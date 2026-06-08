import { Component, HostListener, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    @if (!chatSvc.chatOpen() && authSvc.isClient()) {
      <button class="chat-trigger-btn shadow-lg" (click)="openChat()">
        <i class="bi bi-chat-dots-fill fs-4"></i>
      </button>
    }

    @if (chatSvc.chatOpen() && authSvc.isClient()) {
      <div class="chat-widget shadow-lg">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-white rounded-circle d-flex align-items-center justify-content-center text-dark shadow-sm" style="width: 36px; height: 36px;">
              <i class="bi bi-headset"></i>
            </div>
            <div>
              <div class="fw-bold lh-1 mb-1">Support Protocol</div>
              <div class="small text-white text-opacity-75 d-flex align-items-center gap-2">
                @if (isOnline) { 
                  <span class="d-inline-block bg-success rounded-circle" style="width: 8px; height: 8px;"></span> Online
                } @else {
                  <span class="d-inline-block bg-secondary rounded-circle" style="width: 8px; height: 8px;"></span> Offline
                }
              </div>
            </div>
          </div>
          <button class="btn btn-link text-white text-opacity-75 hover-text-white p-0 border-0" (click)="closeChat()" title="Close Window">
            <i class="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <!-- Chat Body -->
        <div class="chat-body">
          <div class="messages-container" #messagesContainer>
            <div class="text-center mb-4">
              <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle rounded-pill small px-3">End-to-End Encrypted Session</span>
            </div>

            @for (message of chatSvc.messages(); track message.id) {
              <div class="message-wrapper d-flex flex-column mb-3" [ngClass]="message.type === 'client' ? 'align-items-end' : 'align-items-start'">
                <div class="small text-secondary mb-1 px-1 fw-bold" style="font-size: 0.7rem;">
                  {{ getSenderName(message) }} • {{ formatTime(message.timestamp) }}
                </div>
                <div class="message-bubble" 
                     [ngClass]="message.type === 'client' ? 'client-message' : 'system-message'">
                  {{ message.message }}
                </div>
              </div>
            }
          </div>

          @if (isTyping) {
            <div class="typing-indicator small text-secondary fst-italic px-4 py-2 bg-light border-top border-secondary-subtle">
              {{ typingUser }} is transmitting data...
            </div>
          }

          <div class="chat-input p-3 bg-white border-top border-secondary-subtle">
            <div class="input-group bg-light rounded-pill border border-secondary-subtle p-1 overflow-hidden shadow-sm">
              <input 
                type="text" 
                class="form-control border-0 bg-transparent shadow-none px-3 py-2 small" 
                placeholder="Initialize transmission..."
                [(ngModel)]="newMessage"
                (keydown.enter)="sendMessage()"
                (input)="onTyping()"
                (focus)="isTyping = false"
              >
              <button class="btn btn-dark rounded-circle d-flex align-items-center justify-content-center p-0 m-1 transition-all" 
                      style="width: 36px; height: 36px;"
                      (click)="sendMessage()" 
                      [disabled]="!newMessage.trim()">
                <i class="bi bi-send-fill small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
    .chat-trigger-btn { position: fixed; bottom: 30px; right: 30px; width: 64px; height: 64px; background: #212529; color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 999; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .chat-trigger-btn:hover { transform: scale(1.1); background: #000; }
    
    .chat-widget { position: fixed; bottom: 30px; right: 30px; width: 380px; height: 560px; background: #f8f9fa; border-radius: 20px; z-index: 1000; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(0,0,0,0.1); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .chat-header { background: #212529; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    
    .chat-body { flex: 1; display: flex; flex-direction: column; background: #f8f9fa; overflow: hidden; }
    
    .messages-container { flex: 1; overflow-y: auto; padding: 20px; }
    
    .message-bubble { padding: 12px 16px; border-radius: 16px; max-width: 85%; font-size: 0.9rem; line-height: 1.5; word-wrap: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
    
    .client-message { background: #212529; color: white; border-bottom-right-radius: 4px; }
    
    .system-message { background: white; color: #212529; border: 1px solid #e9ecef; border-bottom-left-radius: 4px; }
    
    .form-control::placeholder { color: #adb5bd; }
    `
  ]
})
export class ChatWidgetComponent {
  @HostListener('document:keydown.escape')
  onEscapeKey() { this.closeChat(); }

  public readonly authSvc = inject(AuthService);
  public readonly chatSvc = inject(ChatService);

  newMessage = '';
  isOnline = false;
  isTyping = false;
  typingUser = '';
  typingTimeout: any;

  constructor() {
    effect(() => {
      const user = this.authSvc.currentUser();
      if (user) {
        this.chatSvc.authenticateUser({
          id: user.id,
          name: user.name || (user.role === 'CLIENT' ? 'Client' : 'Support Agent'),
          role: user.role.toLowerCase() as 'client' | 'employee' | 'admin',
          online: true
        });
      }
    });

    effect(() => {
      const msgs = this.chatSvc.messages();
      this.scrollToBottom();
    });

    effect(() => {
      this.isOnline = !!this.chatSvc.currentUser();
    });
    
    effect(() => {
      if (this.chatSvc.chatOpen()) {
        setTimeout(() => {
          this.scrollToBottom();
          const input = document.querySelector('.input-group input') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
    });
  }

  closeChat() { this.chatSvc.toggleChat(false); }
  openChat()  { this.chatSvc.toggleChat(true); }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatSvc.sendMessage(this.newMessage);
      this.newMessage = '';
      this.isTyping = false;
      this.typingUser = '';
    }
  }

  onTyping() {
    if (this.newMessage.trim()) {
      this.isTyping = true;
      this.typingUser = this.authSvc.isClient() ? 'Client' : 'Support Agent';
      
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
        this.typingUser = '';
      }, 3000);

      this.chatSvc.sendTypingIndicator();
    }
  }

  getSenderName(message: ChatMessage): string {
    if (message.type === 'client') return message.clientName || 'Client';
    if (message.type === 'employee') return message.employeeName || 'Support Agent';
    return 'System';
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
