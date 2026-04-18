import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentUser = this.authService.user;
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res: any) => {
        // API might return { data: { unreadCount: N } }
        this.unreadCount.set(res?.data?.unreadCount ?? res?.data ?? 0);
      },
      error: () => {
        this.unreadCount.set(0);
      },
    });
  }

  logout() {
    this.authService.signout();
  }
}
