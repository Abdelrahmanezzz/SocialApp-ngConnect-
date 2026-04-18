import { User } from './user.model';

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply';

export interface Notification {
  _id: string;
  type: NotificationType;
  sender: User;
  recipient: string;
  post?: string;
  comment?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  unread?: boolean;
  page?: number;
  limit?: number;
}
