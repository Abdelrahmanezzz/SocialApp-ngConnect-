import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Post, Comment, CommentRequest, PostRequest } from '../../../core/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  @Input() post!: Post;
  @Input() currentUser: User | null = null;

  private postService = inject(PostService);
  private router = inject(Router);

  // Post state
  showOptions = signal(false);
  isEditing = signal(false);
  isUpdating = signal(false);
  editBody = signal('');

  // Like state
  isLiking = signal(false);

  // Comment state
  showComments = signal(false);
  comments = signal<Comment[]>([]);
  newComment = signal('');
  isLoadingComments = signal(false);
  isAddingComment = signal(false);

  // Comment edit/delete state
  activeCommentOptions = signal<string | null>(null);
  editingCommentId = signal<string | null>(null);
  editCommentContent = signal('');
  isUpdatingComment = signal(false);

  // ─── Post actions ─────────────────────────────────────────────

  viewPost() {
    this.router.navigate(['/main/post', this.post._id]);
  }

  toggleLike() {
    if (this.isLiking()) return;

    const wasLiked = this.post.isLiked;
    const userId = this.currentUser?._id;

    // Optimistic update
    this.post.isLiked = !wasLiked;
    if (this.post.isLiked && userId) {
      this.post.likes = [...this.post.likes, userId];
      this.post.likesCount = this.post.likesCount + 1;
    } else {
      this.post.likes = this.post.likes.filter((id) => id !== userId);
      this.post.likesCount = Math.max(0, this.post.likesCount - 1);
    }

    this.isLiking.set(true);
    this.postService
      .toggleLike(this.post._id)
      .pipe(finalize(() => this.isLiking.set(false)))
      .subscribe({
        next: (res: any) => {
          const updated = res?.data?.post ?? res?.data ?? null;
          if (updated) {
            this.post.likes = updated.likes;
            this.post.likesCount = updated.likesCount;
            this.post.isLiked = updated.isLiked;
          }
        },
        error: () => {
          // Revert optimistic update
          this.post.isLiked = wasLiked;
          if (wasLiked && userId) {
            this.post.likes = [...this.post.likes, userId];
            this.post.likesCount = this.post.likesCount + 1;
          } else {
            this.post.likes = this.post.likes.filter((id) => id !== userId);
            this.post.likesCount = Math.max(0, this.post.likesCount - 1);
          }
        },
      });
  }

  onEditPost() {
    this.showOptions.set(false);
    this.editBody.set(this.post.body);
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editBody.set('');
  }

  saveEdit() {
    if (!this.editBody().trim() || this.isUpdating()) return;

    const data: PostRequest = { body: this.editBody() };

    this.isUpdating.set(true);
    this.postService
      .updatePost(this.post._id, data)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res: any) => {
          const updated = res?.data?.post ?? res?.data ?? null;
          this.post.body = updated?.body ?? this.editBody();
          this.isEditing.set(false);
          this.editBody.set('');
        },
        error: () => {},
      });
  }

  onDeletePost() {
    this.showOptions.set(false);
    this.postService.deletePost(this.post._id).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  // ─── Comment actions ───────────────────────────────────────────

  toggleComments() {
    if (this.showComments()) {
      this.showComments.set(false);
      return;
    }

    this.showComments.set(true);

    if (this.comments().length > 0) return;

    this.isLoadingComments.set(true);
    this.postService
      .getPostComments(this.post._id)
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

  addComment() {
    if (!this.newComment().trim() || this.isAddingComment()) return;

    const data: CommentRequest = { content: this.newComment() };

    this.isAddingComment.set(true);
    this.postService
      .createComment(this.post._id, data)
      .pipe(finalize(() => this.isAddingComment.set(false)))
      .subscribe({
        next: (res: any) => {
          const newComment = res?.data?.comment ?? res?.data ?? null;
          if (newComment) {
            this.comments.update((prev) => [newComment, ...prev]);
            this.post.commentsCount = this.post.commentsCount + 1;
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
    if (!this.editCommentContent().trim() || this.isUpdatingComment()) return;

    const data: CommentRequest = { content: this.editCommentContent() };

    this.isUpdatingComment.set(true);
    this.postService
      .updateComment(this.post._id, commentId, data)
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
    this.activeCommentOptions.set(null);
    this.postService.deleteComment(this.post._id, commentId).subscribe({
      next: () => {
        this.comments.update((prev) => prev.filter((c) => c._id !== commentId));
        this.post.commentsCount = Math.max(0, this.post.commentsCount - 1);
      },
      error: () => {},
    });
  }
}
