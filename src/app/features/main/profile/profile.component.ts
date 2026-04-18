import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';
import { PostComponent } from '../../../shared/components/post/post.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostComponent, RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);
  userPosts = signal<Post[]>([]);
  isLoading = signal(false);
  isUploadingPhoto = signal(false);
  activeTab = signal<'posts' | 'about' | 'friends'>('posts');

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserPosts();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        // API returns { data: { user: {...} } }
        const user = res?.data?.user ?? res?.data ?? null;
        if (user) {
          this.currentUser.set(user);
          // Also update the auth service signal
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      error: () => {},
    });
  }

  loadUserPosts() {
    const user = this.authService.user();
    if (!user) return;

    this.isLoading.set(true);
    this.authService
      .getUserPosts(user._id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          // API returns { data: { posts: [...] } }
          this.userPosts.set(res?.data?.posts ?? res?.data ?? []);
        },
        error: () => {
          this.userPosts.set([]);
        },
      });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploadingPhoto.set(true);

    this.authService
      .uploadPhoto(file)
      .pipe(finalize(() => this.isUploadingPhoto.set(false)))
      .subscribe({
        next: () => {
          // Reload profile to get updated photo
          this.loadProfile();
        },
        error: () => {},
      });
  }
}
