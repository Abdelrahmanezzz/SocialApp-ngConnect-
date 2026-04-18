import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StandardResponse } from '../models/response.model';
import { Notification, NotificationQueryParams } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly baseUrl = 'https://route-posts.routemisr.com/notifications';

  private http = inject(HttpClient);

  getNotifications(
    query: NotificationQueryParams = {},
  ): Observable<StandardResponse<Notification[]>> {
    const { unread = false, page = 1, limit = 20 } = query;

    const params = new HttpParams().set('unread', unread).set('page', page).set('limit', limit);

    return this.http.get<StandardResponse<Notification[]>>(this.baseUrl, {
      params,
    });
  }

  getUnreadCount(): Observable<StandardResponse<{ unreadCount: number }>> {
    return this.http.get<StandardResponse<{ unreadCount: number }>>(`${this.baseUrl}/unread-count`);
  }

  markAsRead(notificationId: string): Observable<StandardResponse<Notification>> {
    return this.http.patch<StandardResponse<Notification>>(
      `${this.baseUrl}/${notificationId}/read`,
      {},
    );
  }

  markAllAsRead(): Observable<StandardResponse<null>> {
    return this.http.patch<StandardResponse<null>>(`${this.baseUrl}/read-all`, {});
  }
}
