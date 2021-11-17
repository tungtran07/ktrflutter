import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base-component';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@routes/admin/admin.service';
import { PostService } from '@routes/admin/pages/post/post.service';
import { debounceTime, distinctUntilChanged, finalize, map, throttleTime } from 'rxjs/operators';
import { categoryColumn } from './post.collumn';
import { environment } from '@src/environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import marked from 'marked';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent extends BaseComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  categories: any[];
  posts: any[];
  selectedCategory: any;
  isLoadPost = false;
  isUploading = false;
  isVisibleCategoryModal = false;
  isVisiblePostModal = false;
  previewVisible = false;
  categoryColumn = categoryColumn(this);
  imageUrl: string;
  categoryValues: any;
  postValues: any;
  postForm: FormGroup;
  defaultPageSize = 20;
  postUrlPrefix = '/posts/';
  selectedTab = 0;
  infoUpload;
  urlUpload;
  listUpload = [];
  previewImage;
  screenType = '8plus';
  fullTextSearch = new FormControl();
  pageSizeOptions = [10, 20, 30, 40];
  categoryPagination = {
    currentPage: 1,
    total: 1,
    pageSize: this.defaultPageSize
  };
  postPagination = {
    currentPage: 1,
    total: 1,
    pageSize: this.defaultPageSize
  };

  constructor(
      protected translate: TranslateService,
      protected service: PostService,
      protected message: NzMessageService,
      protected route: ActivatedRoute,
      protected adminService: AdminService,
      private sanitized: DomSanitizer,
      private fb: FormBuilder,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
    super.onInit();
    this.buildForm();
    this.getPostCategories();
    this.getPosts();
    this.searchPostValueChange();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onPageChanged(type: 'category' | 'post', data: any): void {
    const { pageSize, pageIndex } = data;
    if (type === 'category') {
      const payload = {
        page: pageIndex,
        size: pageSize,
      };
      this.getPostCategories(payload);
    } else {
      const payload = {
        page: pageIndex,
        size: pageSize,
        filter: JSON.stringify({
          categoryId: this.selectedCategory?.id || '',
          fullTextSearch: this.fullTextSearch.value
        })
      };
      this.getPosts(payload);
    }
  }

  onSelectCategory(item: any): void {
    this.imageUrl = '';
    if (this.selectedCategory && this.selectedCategory.id === item.id) {
      this.selectedCategory = null;
      if (!this.fullTextSearch.value) {
        this.getPosts();
      } else {
        this.fullTextSearch.setValue('');
      }
    } else {
      this.selectedCategory = item;
      if (!this.fullTextSearch.value) {
        this.getPostByCategory(item.id);
      } else {
        this.fullTextSearch.setValue('');
      }
    }
  }

  onSavePostCategory(form: any): void {
    const { value, valid } = form;
    if (valid) {
      const payload = {
        ...value,
        id: this.categoryValues?.id || '',
        cover: this.imageUrl || ''
      };
      if (!this.categoryValues) {
        this.service.createPostCategory(payload).subscribe(rs => {
          this.message.success('Thêm mới thành công.');
          this.selectedCategory = null;
          this.getPostCategories();
        });
      } else {
        this.service.updatePostCategory(payload).subscribe(rs => {
          this.message.success('Cập nhật thành công.');
          this.selectedCategory = null;
          this.getPostCategories();
        });
      }
    }
    this.isVisibleCategoryModal = false;
  }

  onClosePostCategoryModal(): void {
    this.isVisibleCategoryModal = false;
    this.imageUrl = '';
  }

  onAddCategory(): void {
    this.imageUrl = '';
    this.categoryValues = null;
    this.isVisibleCategoryModal = true;
  }

  onEditCategory(item: any): void {
    this.imageUrl = item.cover;
    this.categoryValues = item;
    this.isVisibleCategoryModal = true;
  }

  onAddPost(): void {
    this.postForm.reset();
    this.f.createdOnDate.setValue(this.today);
    this.imageUrl = '';
    this.postValues = null;
    this.isVisiblePostModal = true;
  }

  onClosePost(): void {
    this.isVisiblePostModal = false;
    this.selectedTab = 0;
    this.imageUrl = '';
  }

  onSavePost(): void {
    const { controls, value, valid } = this.postForm;
    if (valid) {
      const payload = {
        ...value,
        thumbnail: this.imageUrl || ''
      };
      if (!this.postValues) {
        this.service.createPost(payload).subscribe(rs => {
          this.message.success('Thêm mới thành công.');
          if (this.selectedCategory) {
            this.getPostByCategory(this.selectedCategory.id);
          } else {
            this.getPosts();
          }
        });
      } else {
        this.service.updatePost(payload).subscribe(rs => {
          this.message.success('Cập nhật thành công.');
          if (this.selectedCategory) {
            this.getPostByCategory(this.selectedCategory.id);
          } else {
            this.getPosts();
          }
        });
      }
      this.isVisiblePostModal = false;
    } else {
      for (const i in controls) {
        if (controls.hasOwnProperty(i)) {
          controls[i].markAsTouched();
          controls[i].updateValueAndValidity();
        }
      }
    }
  }

  onEditPost(item: any): void {
    this.imageUrl = item.thumbnail;
    this.postValues = {...item, categoryId: item.category.id};
    this.postForm.patchValue(this.postValues);
    this.service.getAttachmentTemplate({id: item.id}).subscribe(rs => {
      this.infoUpload = rs[0];
      this.urlUpload = `${environment.adminApiUrl}/api/v1/core/nodes/upload/physical/blob?destinationPhysicalPath=${this.infoUpload.prefix}`;
    });
    this.getAttachments();
    this.isVisiblePostModal = true;
  }

  onChangePostStatus(item: any): void {
    const payload = {
      id: item.id,
      status: item.publishStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    };
    this.service.updatePostStatus(payload).subscribe(rs => {
      this.message.success('Cập nhật thành công.');
      if (this.selectedCategory) {
        this.getPostByCategory(this.selectedCategory.id);
      } else {
        this.getPosts();
      }
    });
  }

  private buildForm(): void {
    this.postForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      categoryId: ['', Validators.required],
      summary: [''],
      content: [''],
      createdOnDate: []
    });
  }

  private getAttachments(): void {
    this.service.getAttachments(this.postValues.id).subscribe(({data: attachments}) => {
      this.listUpload = [];
      attachments?.map(attach => {
        this.listUpload.push({
          uid: attach.id,
          name: this.formatDate(attach.createdOnDate) + ' - ' + attach.docTypeName,
          status: 'done',
          url: attach?.file
        });
      });
    });
  }

  private getPostCategories(payload?: any): void {
    if (!payload) {
      payload = {
        page: 1,
        size: this.defaultPageSize,
      };
    }
    this.isLoading = true;
    this.service.getPostCategories(payload).pipe(finalize(() => this.isLoading = false)).subscribe(rs => {
      if (rs?.data) {
        this.categories = rs.data.content;
        this.categoryPagination.pageSize = rs.data.size;
        this.categoryPagination.currentPage = rs.data.page;
        this.categoryPagination.total = rs.data.totalElements;
        this.selectedCategory = null;
      }
    });
  }

  private getPosts(payload?: any): void {
    if (!payload) {
      payload = {
        page: 1,
        size: this.defaultPageSize,
      };
    }
    this.isLoadPost = true;
    this.service.getAllPosts(payload).pipe(finalize(() => this.isLoadPost = false)).subscribe(rs => {
      if (rs?.data) {
        this.posts = rs.data.content;
        this.postPagination.pageSize = rs.data.size;
        this.postPagination.currentPage = rs.data.page;
        this.postPagination.total = rs.data.totalElements;
      }
    });
  }

  private getPostByCategory(id): void {
    const payload = {
      page: 1,
      size: this.defaultPageSize,
      filter: JSON.stringify({
        categoryId: id
      })
    };
    this.getPosts(payload);
  }

  private searchPostValueChange(): void {
    this.sub = this.fullTextSearch.valueChanges
        .pipe(
            debounceTime(300),
            throttleTime(300),
            distinctUntilChanged()
        )
        .subscribe(value => {
            const payload = {
              page: 1,
              size: this.defaultPageSize,
              filter: JSON.stringify({
                categoryId: this.selectedCategory?.id || '',
                fullTextSearch: value
              })
            };
            this.getPosts(payload);
        });
  }

  get content(): any {
    return this.sanitized.bypassSecurityTrustHtml(
        marked(this.postForm.get('content').value || '').replaceAll('<img', '<img style="max-width: 100%"')
    );
  }

  get f(): any {
    return this.postForm.controls;
  }

  get today(): Date {
    return new Date();
}

  get categoryName(): string {
    return this.categories.find(i => i.id === this.f.categoryId.value)?.title || '';
  }

  handleUpload(data): void {
    if (data.type === 'success') {
      this.isUploading = true;
      this.service.uploadAttachment(this.postValues.id, {...this.infoUpload, file: data.file.response.data.physicalPath})
          .pipe(finalize(() => this.isUploading = false))
          .subscribe((res) => {
            this.getAttachments();
            this.message.success(res.message);
          });
    }
  }

  handlePreview = async (file: NzUploadFile) => {
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  }

  handleRemove = (file: NzUploadFile) => {
    this.service
        .deleteAttachment(this.postValues.id, file.uid)
        .subscribe(res => {
          this.getAttachments();
          this.message.success(res.message);
        }, () => false);
  }

  handleDownload = (file: NzUploadFile) => {
    window.open(file.url);
  }

  customReq = (item) => {
    this.isUploading = true;
    return this.service.uploadFileBlobPhysical(item.file).subscribe(
        response => {
          if (response.code === 200) {
            this.isUploading = false;
            this.imageUrl =  environment.adminApiUrl + '/StaticFiles/' + response.data.physicalPath;
          }
        },
        error => {
          console.error(error);
        },
    );
  }

  getErrorMessage(control: any): string {
    if (control.errors.required) {
      return 'components.Form.rulesRequired';
    }
    return 'Không hợp lệ!';
  }

  get postUrl(): string {
    return this.postUrlPrefix + this.postValues.id;
  }

  generateImageUrl(url): string {
    return `![image](${url})`;
  }
}
