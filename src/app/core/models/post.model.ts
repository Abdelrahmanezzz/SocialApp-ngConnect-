import { User } from './user.model';

export interface TopComment {
  _id: string;
  content: string;
  commentCreator: Pick<User, '_id' | 'name' | 'username' | 'photo'>;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  id: string;
  body: string;
  image?: string;
  privacy: 'public' | 'private' | 'friends';
  user: Pick<User, '_id' | 'name' | 'username' | 'photo'>;
  sharedPost: Post | null;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  topComment: TopComment | null;
  isShare: boolean;
  bookmarked: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  image?: string;
  commentCreator: Pick<User, '_id' | 'name' | 'username' | 'photo'>;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  body: string;
  image?: File;
}

export interface CommentRequest {
  content: string;
  image?: File;
}

export interface FeedQueryParams {
  page?: number;
  limit?: number;
}