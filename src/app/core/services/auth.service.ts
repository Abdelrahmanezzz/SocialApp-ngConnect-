import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  SigninRequest,
  SignupRequest,
  AuthResponse,
  ChangePasswordRequest,
} from '../models/auth.model';
import { StandardResponse } from '../models/response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'https://route-posts.routemisr.com/users';

  private http = inject(HttpClient);
  private router = inject(Router);

  private userSignal = signal<User | null>(this.getUserFromLocalStorage());
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

  user = computed(() => this.userSignal());
  isLoggedIn = computed(() => !!this.tokenSignal());

  signup(data: SignupRequest): Observable<StandardResponse<AuthResponse>> {
    return this.http.post<StandardResponse<AuthResponse>>(`${this.baseUrl}/signup`, data).pipe(
      tap((response) => {
        const token = response.data?.token;
        const user = response.data?.user;
        if (token && user) {
          this.saveAuthData(token, user);
        }
      }),
    );
  }

  signin(data: SigninRequest): Observable<StandardResponse<AuthResponse>> {
    // API only accepts "email" field for both email and username
    const payload = {
      email: data.emailOrUsername,
      password: data.password,
    };

    return this.http.post<StandardResponse<AuthResponse>>(`${this.baseUrl}/signin`, payload).pipe(
      tap((response) => {
        const token = response.data?.token;
        const user = response.data?.user;
        if (token && user) {
          this.saveAuthData(token, user);
        }
      }),
    );
  }

  signout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  // API expects "password" and "newPassword" not "currentPassword"
  changePassword(data: ChangePasswordRequest): Observable<StandardResponse<AuthResponse>> {
    const payload = {
      password: data.currentPassword,
      newPassword: data.newPassword,
    };

    return this.http
      .patch<StandardResponse<AuthResponse>>(`${this.baseUrl}/change-password`, payload)
      .pipe(
        tap((response) => {
          const token = response.data?.token;
          if (token) {
            localStorage.setItem('token', token);
            this.tokenSignal.set(token);
          }
        }),
      );
  }

  uploadPhoto(photo: File): Observable<StandardResponse<User>> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.put<StandardResponse<User>>(`${this.baseUrl}/upload-photo`, formData).pipe(
      tap((response) => {
        const updatedUser = response.data;
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.userSignal.set(updatedUser);
        }
      }),
    );
  }

  getProfile(): Observable<StandardResponse<User>> {
    return this.http.get<StandardResponse<User>>(`${this.baseUrl}/profile-data`);
  }

  getUserById(userId: string): Observable<StandardResponse<User>> {
    return this.http.get<StandardResponse<User>>(`${this.baseUrl}/${userId}/profile`);
  }

  getUserPosts(userId: string): Observable<StandardResponse<any[]>> {
    return this.http.get<StandardResponse<any[]>>(`${this.baseUrl}/${userId}/posts`);
  }

  followUser(userId: string): Observable<StandardResponse<null>> {
    return this.http.put<StandardResponse<null>>(`${this.baseUrl}/${userId}/follow`, {});
  }

  getSuggestions(limit: number = 10): Observable<StandardResponse<User[]>> {
    return this.http.get<StandardResponse<User[]>>(`${this.baseUrl}/suggestions?limit=${limit}`);
  }

  getBookmarks(): Observable<StandardResponse<any[]>> {
    return this.http.get<StandardResponse<any[]>>(`${this.baseUrl}/bookmarks`);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSignal.set(token);
    this.userSignal.set(user);
  }

  private getUserFromLocalStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
