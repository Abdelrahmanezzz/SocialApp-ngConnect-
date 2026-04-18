import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, Comment, CommentRequest } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private authService = inject(AuthService);

  currentUser = this.authService.user;

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoadingPost = signal(false);
  isLoadingComments = signal(false);
  isLiking = signal(false);
  isAddingComment = signal(false);
  isUpdatingComment = signal(false);
  newComment = signal('');
  editingCommentId = signal<string | null>(null);
  editCommentContent = signal('');
  activeCommentOptions = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.router.navigate(['/main/feed']);
      return;
    }
    this.loadPost(postId);
    this.loadComments(postId);
  }

  loadPost(postId: string) {
    this.isLoadingPost.set(true);
    this.postService
      .getPost(postId)
      .pipe(finalize(() => this.isLoadingPost.set(false)))
      .subscribe({
        next: (res: any) => {
          const post = res?.data?.post ?? res?.data ?? null;
          this.post.set(post);
        },
        error: () => {
          this.errorMessage.set('Failed to load post.');
        },
      });
  }

  loadComments(postId: string) {
    this.isLoadingComments.set(true);
    this.postService
      .getPostComments(postId)
      .pipe(finalize(() => this.isLoadingComments.set(false)))
      .subscribe({
        next: (res: any) => {
          this.comments.set(res?.data?.comments ?? res?.data ?? []);
        },
        error: () => {
          this.comments.set([]);
        },
      });
  }

  toggleLike() {
    const post = this.post();
    if (!post || this.isLiking()) return;

    const wasLiked = post.isLiked;
    const userId = this.currentUser()?._id;

    post.isLiked = !wasLiked;
    if (post.isLiked && userId) {
      post.likes = [...post.likes, userId];
      post.likesCount = post.likesCount + 1;
    } else {
      post.likes = post.likes.filter((id) => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    }
    this.post.set({ ...post });

    this.isLiking.set(true);
    this.postService
      .toggleLike(post._id)
      .pipe(finalize(() => this.isLiking.set(false)))
      .subscribe({
        next: (res: any) => {
          const updated = res?.data?.post ?? res?.data ?? null;
          if (updated) {
            this.post.set({ ...post, ...updated });
          }
        },
        error: () => {
          // Revert
          post.isLiked = wasLiked;
          if (wasLiked && userId) {
            post.likes = [...post.likes, userId];
            post.likesCount = post.likesCount + 1;
          } else {
            post.likes = post.likes.filter((id) => id !== userId);
            post.likesCount = Math.max(0, post.likesCount - 1);
          }
          this.post.set({ ...post });
        },
      });
  }

  addComment() {
    const post = this.post();
    if (!post || !this.newComment().trim() || this.isAddingComment()) return;

    const data: CommentRequest = { content: this.newComment() };

    this.isAddingComment.set(true);
    this.postService
      .createComment(post._id, data)
      .pipe(finalize(() => this.isAddingComment.set(false)))
      .subscribe({
        next: (res: any) => {
          const newComment = res?.data?.comment ?? res?.data ?? null;
          if (newComment) {
            this.comments.update((prev) => [newComment, ...prev]);
            this.post.set({ ...post, commentsCount: post.commentsCount + 1 });
          }
          this.newComment.set('');
        },
        error: () => {},
      });
  }

  toggleCommentOptions(commentId: string) {
    this.activeCommentOptions.update((prev) => (prev === commentId ? null : commentId));
  }

  onEditComment(comment: Comment) {
    this.activeCommentOptions.set(null);
    this.editingCommentId.set(comment._id);
    this.editCommentContent.set(comment.content);
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
    this.editCommentContent.set('');
  }

  saveEditComment(commentId: string) {
    const post = this.post();
    if (!post || !this.editCommentContent().trim() || this.isUpdatingComment()) return;

    const data: CommentRequest = { content: this.editCommentContent() };

    this.isUpdatingComment.set(true);
    this.postService
      .updateComment(post._id, commentId, data)
      .pipe(finalize(() => this.isUpdatingComment.set(false)))
      .subscribe({
        next: (res: any) => {
          const updated = res?.data?.comment ?? res?.data ?? null;
          this.comments.update((prev) =>
            prev.map((c) =>
              c._id === commentId
                ? { ...c, content: updated?.content ?? this.editCommentContent() }
                : c,
            ),
          );
          this.editingCommentId.set(null);
          this.editCommentContent.set('');
        },
        error: () => {},
      });
  }

  onDeleteComment(commentId: string) {
    const post = this.post();
    if (!post) return;

    this.activeCommentOptions.set(null);
    this.postService.deleteComment(post._id, commentId).subscribe({
      next: () => {
        this.comments.update((prev) => prev.filter((c) => c._id !== commentId));
        this.post.set({
          ...post,
          commentsCount: Math.max(0, post.commentsCount - 1),
        });
      },
      error: () => {},
    });
  }

  goBack() {
    this.router.navigate(['/main/feed']);
  }
}
