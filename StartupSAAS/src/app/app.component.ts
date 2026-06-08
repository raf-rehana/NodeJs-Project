import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { FooterComponent } from './shared/components/footer/footer';
import { LoadingBarComponent } from './shared/components/loading-bar/loading-bar';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget';
import { ToastComponent } from './shared/components/toast/toast';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent, SidebarComponent, FooterComponent,
    LoadingBarComponent, ChatWidgetComponent,
    ToastComponent, ConfirmModalComponent, NotificationBellComponent,
  ],
  template: `
    <div class="app-container min-vh-100 d-flex flex-column">
      <app-loading-bar></app-loading-bar>

      @if (!showSidebar()) {
        <app-navbar></app-navbar>
      }

      <app-chat-widget></app-chat-widget>
      <app-toast></app-toast>
      <app-confirm-modal></app-confirm-modal>

      <div [style.marginTop.px]="showSidebar() ? 0 : 80" class="flex-grow-1">
        @if (showSidebar()) {
          <div class="container-fluid p-0">
            <div class="row g-0">
              <div class="col-auto">
                <app-sidebar></app-sidebar>
              </div>
              <div class="col overflow-hidden d-flex flex-column min-vh-100" style="background-color: lavender;">
                <div class="bg-white border-bottom px-4 py-2 d-flex justify-content-end align-items-center shadow-sm" style="height: 60px;">
                  <div class="d-flex align-items-center gap-4">

                    <app-notification-bell></app-notification-bell>
                    @if (authService.currentUser(); as user) {
                      <div class="dropdown">
                        <button class="btn btn-light rounded-pill dropdown-toggle d-flex align-items-center gap-2 border-0"
                                type="button" data-bs-toggle="dropdown">
                          <div class="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center"
                               style="width: 32px; height: 32px; border-radius: 50%;">
                            @if (user.avatar) {
                              <img [src]="user.avatar" class="w-100 h-100 object-fit-cover" style="border-radius: 50%;">
                            } @else {
                              {{ user.name.charAt(0).toUpperCase() }}
                            }
                          </div>
                          <span class="d-none d-md-inline small fw-bold">{{ user.name }}</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 rounded-3">
                          <li><a class="dropdown-item py-2" routerLink="/client/profile"><i class="bi bi-person me-2"></i>Profile Settings</a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><button class="dropdown-item text-danger py-2" (click)="authService.logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
                        </ul>
                      </div>
                    }
                  </div>
                </div>
                <div class="p-0 flex-grow-1 overflow-auto">
                  <router-outlet></router-outlet>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <router-outlet></router-outlet>
          <app-footer></app-footer>
        }
      </div>
    </div>
  `,
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  private readonly _themeService = inject(ThemeService);

  private readonly navUrl = toSignal(
    inject(Router).events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects || (e as NavigationEnd).url),
    ),
    { initialValue: inject(Router).url },
  );

  protected readonly showSidebar = computed(() => {
    const url = this.navUrl();
    const isDashboard = url.includes('/client') || url.includes('/admin') || url.includes('/employee');
    const isGlobal    = url.includes('/service') || url.includes('/contact') || url.includes('/packages');
    return isDashboard || (isGlobal && this.authService.isLoggedIn());
  });
}
