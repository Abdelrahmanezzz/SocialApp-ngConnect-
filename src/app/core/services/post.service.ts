import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comment, PostRequest, CommentRequest, FeedQueryParams } from '../models/post.model';
import { StandardResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly baseUrl = 'https://route-posts.routemisr.com/posts';

  private http = inject(HttpClient);

  getAllPosts(): Observable<StandardResponse<Post[]>> {
    return this.http.get<StandardResponse<Post[]>>(this.baseUrl);
  }

  getFeed(query: FeedQueryParams = {}): Observable<StandardResponse<Post[]>> {
    const { page = 1, limit = 10 } = query;

    const params = new HttpParams().set('only', 'following').set('page', page).set('limit', limit);

    return this.http.get<StandardResponse<Post[]>>(`${this.baseUrl}/feed`, { params });
  }

  getPost(postId: string): Observable<StandardResponse<Post>> {
    return this.http.get<StandardResponse<Post>>(`${this.baseUrl}/${postId}`);
  }

  createPost(data: PostRequest): Observable<StandardResponse<Post>> {
    const formData = new FormData();
    formData.append('body', data.body);
    if (data.image) {
      formData.append('image', data.image);
    }
    return this.http.post<StandardResponse<Post>>(this.baseUrl, formData);
  }

  updatePost(postId: string, data: PostRequest): Observable<StandardResponse<Post>> {
    const formData = new FormData();
    formData.append('body', data.body);
    if (data.image) {
      formData.append('image', data.image);
    }
    return this.http.put<StandardResponse<Post>>(`${this.baseUrl}/${postId}`, formData);
  }

  deletePost(postId: string): Observable<StandardResponse<null>> {
    return this.http.delete<StandardResponse<null>>(`${this.baseUrl}/${postId}`);
  }

  toggleLike(postId: string): Observable<StandardResponse<Post>> {
    return this.http.put<StandardResponse<Post>>(`${this.baseUrl}/${postId}/like`, {});
  }

  toggleBookmark(postId: string): Observable<StandardResponse<Post>> {
    return this.http.put<StandardResponse<Post>>(`${this.baseUrl}/${postId}/bookmark`, {});
  }

  sharePost(postId: string, body: string): Observable<StandardResponse<Post>> {
    return this.http.post<StandardResponse<Post>>(`${this.baseUrl}/${postId}/share`, { body });
  }

  getPostLikes(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Observable<StandardResponse<any[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<StandardResponse<any[]>>(`${this.baseUrl}/${postId}/likes`, { params });
  }

  getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<StandardResponse<Comment[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<StandardResponse<Comment[]>>(`${this.baseUrl}/${postId}/comments`, {
      params,
    });
  }

  createComment(postId: string, data: CommentRequest): Observable<StandardResponse<Comment>> {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }
    return this.http.post<StandardResponse<Comment>>(
      `${this.baseUrl}/${postId}/comments`,
      formData,
    );
  }

  updateComment(
    postId: string,
    commentId: string,
    data: CommentRequest,
  ): Observable<StandardResponse<Comment>> {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }
    return this.http.put<StandardResponse<Comment>>(
      `${this.baseUrl}/${postId}/comments/${commentId}`,
      formData,
    );
  }

  deleteComment(postId: string, commentId: string): Observable<StandardResponse<null>> {
    return this.http.delete<StandardResponse<null>>(
      `${this.baseUrl}/${postId}/comments/${commentId}`,
    );
  }

  toggleCommentLike(postId: string, commentId: string): Observable<StandardResponse<Comment>> {
    return this.http.put<StandardResponse<Comment>>(
      `${this.baseUrl}/${postId}/comments/${commentId}/like`,
      {},
    );
  }

  getCommentReplies(
    postId: string,
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<StandardResponse<Comment[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<StandardResponse<Comment[]>>(
      `${this.baseUrl}/${postId}/comments/${commentId}/replies`,
      { params },
    );
  }

  createReply(
    postId: string,
    commentId: string,
    data: CommentRequest,
  ): Observable<StandardResponse<Comment>> {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }
    return this.http.post<StandardResponse<Comment>>(
      `${this.baseUrl}/${postId}/comments/${commentId}/replies`,
      formData,
    );
  }
}
