import { Gender } from './auth.model';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  username: string;
  dateOfBirth: string;
  gender: Gender;
  photo: string;
  cover: string;
  bio?: string;
  bookmarks: string[];
  bookmarksCount: number;
  followers: string[];
  followersCount: number;
  following: string[];
  followingCount: number;
  createdAt: string;
  passwordChangedAt?: string;
}
