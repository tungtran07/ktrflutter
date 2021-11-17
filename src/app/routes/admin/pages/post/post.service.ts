import { Injectable } from '@angular/core';
import { BaseService } from '@components/base-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '@routes/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@src/environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService extends BaseService {

  url = environment.salesApiUrl + '/api/v1';

  constructor(
      protected http: HttpClient,
      protected authService: AuthService,
      protected message: NzMessageService,
  ) {
    super(http, authService, message);
  }

  getPostCategories(payload: any): any {
    let params = new HttpParams();
    for (const key in payload) { params = params.append(key, payload[key]); }
    return this.http
        .get(`${this.url}/post-categories`, { params })
        .pipe(catchError(err => this.handleError(err)));
  }

  uploadFileBlobPhysical(file): any {
    const data = new FormData();
    data.append('file', file);
    return this.http
        .post(environment.adminApiUrl + '/api/v1/core/nodes/upload/physical/blob?destinationPhysicalPath=products', data)
        .pipe(catchError(err => this.handleError(err)));
  }

  createPostCategory(payload: any): any {
    return this.http
        .post(`${this.url}/post-categories`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  updatePostCategory(payload: any): any {
    return this.http
        .put(`${this.url}/post-categories/${payload.id}`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  getPostByCategory(categoryId: string): any {
    return this.http
        .get(`${this.url}/post-categories/${categoryId}/posts`)
        .pipe(catchError(err => this.handleError(err)));
  }

  getAllPosts(payload: any): any {
    let params = new HttpParams();
    for (const key in payload) { params = params.append(key, payload[key]); }
    return this.http
        .get(`${this.url}/posts`, { params })
        .pipe(catchError(err => this.handleError(err)));
  }

  createPost(payload: any): any {
    return this.http
        .post(`${this.url}/posts`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  updatePost(payload: any): any {
    return this.http
        .put(`${this.url}/posts/${payload.id}`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  updatePostStatus(payload: any): any {
    return this.http
        .put(`${this.url}/posts/${payload.id}/publish/${payload.status}`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  getAttachmentTemplate(payload: any): any {
    return this.http
        .get(`${this.url}/posts/${payload.id}/attachments/template`)
        .pipe(catchError(err => this.handleError(err)));
  }

  deleteAttachment(postId: string, attachmentId: string): any {
    return this.http
        .delete(`${this.url}/posts/${postId}/attachments/${attachmentId}`)
        .pipe(catchError(err => this.handleError(err)));
  }

  getAttachments(id: string): any {
    return this.http
        .get(`${this.url}/posts/${id}/attachments`)
        .pipe(catchError(err => this.handleError(err)));
  }

  uploadAttachment(id: string, payload: any): any {
    return this.http
        .post(`${this.url}/posts/${id}/attachments`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }

  uploadAttachments(id: string, payload: any): any {
    return this.http
        .post(`${this.url}/api/v1/posts/${id}/attachments/many`, payload)
        .pipe(catchError(err => this.handleError(err)));
  }
}
