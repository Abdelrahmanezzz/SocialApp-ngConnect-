import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, PostRequest } from '../../../core/models/post.model';
import { PostComponent } from '../../../shared/components/post/post.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PostComponent, FormsModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  posts = signal<Post[]>([]);
  currentUser = this.authService.user;
  isLoading = signal(false);
  isPosting = signal(false);
  errorMessage = signal<string | null>(null);
  newPostBody = signal('');
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.postService
      .getFeed()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          // API returns { data: { posts: [...] } }
          const posts = res?.data?.posts ?? res?.data ?? res?.posts ?? [];
          this.posts.set(posts);
        },
        error: (err) => {
          this.posts.set([]);
          this.errorMessage.set(err.error?.message || 'Failed to load posts. Please try again.');
        },
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  createPost() {
    if (!this.newPostBody().trim() && !this.selectedFile) return;

    const data: PostRequest = {
      body: this.newPostBody(),
      ...(this.selectedFile && { image: this.selectedFile }),
    };

    this.isPosting.set(true);
    this.postService
      .createPost(data)
      .pipe(finalize(() => this.isPosting.set(false)))
      .subscribe({
        next: (res: any) => {
          const newPost = res?.data?.post ?? res?.data ?? null;
          if (newPost) {
            this.posts.update((prev) => [newPost, ...prev]);
          } else {
            this.loadPosts();
          }
          this.newPostBody.set('');
          this.selectedFile = null;
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create post. Please try again.');
        },
      });
  }
}
