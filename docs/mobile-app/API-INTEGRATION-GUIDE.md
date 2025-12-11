# Frontend Integration Example - Type-Safe API Client

This document shows how to use auto-generated types in your Angular/Ionic frontend.

## 📦 Import Generated Types

```typescript
// libs/auth/src/lib/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { paths } from '../generated/api-types';

// Extract types for specific endpoints
type LoginRequest = paths['/v1/auth/login']['post']['requestBody']['content']['application/json'];

type LoginResponse =
  paths['/v1/auth/login']['post']['responses']['200']['content']['application/json'];

type RefreshRequest =
  paths['/v1/auth/refresh']['post']['requestBody']['content']['application/json'];

type RefreshResponse =
  paths['/v1/auth/refresh']['post']['responses']['200']['content']['application/json'];

type ErrorResponse =
  paths['/v1/auth/login']['post']['responses']['400']['content']['application/json'];
```

## 🔐 Auth Service Implementation

```typescript
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password
   * ✅ Fully typed request and response
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/v1/auth/login`, credentials);
  }

  /**
   * Refresh access token
   * ✅ Fully typed request and response
   */
  refreshToken(request: RefreshRequest): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/v1/auth/refresh`, request);
  }

  /**
   * Logout and revoke all tokens
   * ✅ No request body, typed response
   */
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/v1/auth/logout`, {});
  }

  /**
   * Get current user profile from JWT token
   * ✅ NEW: Returns user info decoded from access token
   * ✅ No database query - extracts from JWT claims
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/v1/auth/me`);
  }
}

// Add type for user profile response
type UserProfile = paths['/v1/auth/me']['get']['responses']['200']['content']['application/json'];
```

## 📄 Document Service Example

```typescript
// libs/documents/src/lib/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { paths } from '../../../../auth/src/lib/generated/api-types';

type PresignedUrlRequest =
  paths['/v1/documents/presigned-url']['post']['requestBody']['content']['application/json'];

type PresignedUrlResponse =
  paths['/v1/documents/presigned-url']['post']['responses']['200']['content']['application/json'];

type DocumentMetadata =
  paths['/v1/documents/{documentId}']['get']['responses']['200']['content']['application/json'];

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Generate presigned URL for document upload
   * ✅ Request: { fileName, fileType, fileSize }
   * ✅ Response: { documentId, uploadUrl, expiresIn }
   */
  getPresignedUrl(request: PresignedUrlRequest): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.apiUrl}/v1/documents/presigned-url`,
      request
    );
  }

  /**
   * Get document metadata by ID
   * ✅ Path parameter typed
   * ✅ Response fully typed
   */
  getDocumentMetadata(documentId: string): Observable<DocumentMetadata> {
    return this.http.get<DocumentMetadata>(`${this.apiUrl}/v1/documents/${documentId}`);
  }

  /**
   * Upload file using presigned URL
   * @param file - File to upload
   * @returns Upload progress and completion
   */
  async uploadDocument(file: File): Promise<DocumentMetadata> {
    // 1. Get presigned URL
    const presignedData = await this.getPresignedUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }).toPromise();

    // 2. Upload to S3
    await fetch(presignedData.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // 3. Get metadata
    return this.getDocumentMetadata(presignedData.documentId).toPromise();
  }
}
```

## 📋 Template Service Example

```typescript
// libs/templates/src/lib/services/template.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { paths } from '../../../../auth/src/lib/generated/api-types';

type CreateTemplateRequest =
  paths['/v1/templates']['post']['requestBody']['content']['application/json'];

type Template = paths['/v1/templates']['post']['responses']['201']['content']['application/json'];

type ListTemplatesResponse =
  paths['/v1/templates']['get']['responses']['200']['content']['application/json'];

type UpdateTemplateRequest =
  paths['/v1/templates/{templateId}']['put']['requestBody']['content']['application/json'];

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create new evaluation template
   * ✅ Request: { name, description?, criteria[] }
   * ✅ Response: Full template object
   */
  createTemplate(request: CreateTemplateRequest): Observable<Template> {
    return this.http.post<Template>(`${this.apiUrl}/v1/templates`, request);
  }

  /**
   * List templates with optional filters
   * ✅ Query parameters typed
   * ✅ Response: { templates[], lastEvaluatedKey? }
   */
  listTemplates(options?: {
    status?: 'DRAFT' | 'ACTIVE' | 'RETIRED' | 'ARCHIVED';
    limit?: number;
    lastEvaluatedKey?: string;
  }): Observable<ListTemplatesResponse> {
    let params = new HttpParams();

    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.lastEvaluatedKey) {
      params = params.set('lastEvaluatedKey', options.lastEvaluatedKey);
    }

    return this.http.get<ListTemplatesResponse>(`${this.apiUrl}/v1/templates`, {
      params,
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/v1/templates/${templateId}`);
  }

  /**
   * Update template
   * ✅ Only DRAFT templates can be updated
   */
  updateTemplate(templateId: string, request: UpdateTemplateRequest): Observable<Template> {
    return this.http.put<Template>(`${this.apiUrl}/v1/templates/${templateId}`, request);
  }

  /**
   * Activate template (DRAFT → ACTIVE)
   */
  activateTemplate(templateId: string): Observable<Template> {
    return this.http.post<Template>(`${this.apiUrl}/v1/templates/${templateId}/activate`, {});
  }

  /**
   * Clone template for versioning
   */
  cloneTemplate(templateId: string, newName?: string): Observable<Template> {
    return this.http.post<Template>(`${this.apiUrl}/v1/templates/${templateId}/clone`, {
      name: newName,
    });
  }

  /**
   * Archive template (soft delete)
   */
  deleteTemplate(templateId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/v1/templates/${templateId}`);
  }
}
```

## 🎯 Component Usage Example

```typescript
// apps/mobile/src/app/pages/login/login.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@libs/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async login() {
    this.loading = true;

    try {
      // ✅ TypeScript knows exact shape of request
      const response = await this.authService
        .login({
          username: this.username,
          password: this.password,
        })
        .toPromise();

      // ✅ TypeScript knows exact shape of response
      console.log('Login successful:', {
        expiresIn: response.expiresIn,
        tokenType: response.tokenType,
      });

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('idToken', response.idToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Navigate to home
      this.router.navigate(['/home']);
    } catch (error: any) {
      // ✅ Error response is also typed
      const message = error.error?.error || 'Login failed';
      const toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    } finally {
      this.loading = false;
    }
  }
}
```

## 🔄 Auto-Refresh Token Example

```typescript
// libs/auth/src/lib/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add access token to requests
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 Unauthorized, try to refresh token
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        // ✅ TypeScript knows refreshToken request/response types
        return this.authService.refreshToken({ refreshToken }).pipe(
          switchMap((response) => {
            this.isRefreshing = false;

            // Store new tokens
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('idToken', response.idToken);

            this.refreshTokenSubject.next(response.accessToken);

            // Retry original request with new token
            return next.handle(this.addToken(request, response.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            // Refresh failed, logout user
            this.authService.logout().subscribe();
            return throwError(() => error);
          })
        );
      }
    }

    // Wait for token refresh to complete
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token!)))
    );
  }
}
```

## ✅ Type Safety Benefits

### Before (Manual Types)

```typescript
// ❌ Manual interface definition
interface LoginRequest {
  username: string;
  password: string;
}

// ❌ No guarantee it matches backend
interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ❌ Manual maintenance required
// ❌ Can get out of sync with backend
```

### After (Auto-Generated)

```typescript
// ✅ Automatically generated from backend
import { paths } from '../generated/api-types';

type LoginRequest = paths['/v1/auth/login']['post']['requestBody']['content']['application/json'];

type LoginResponse =
  paths['/v1/auth/login']['post']['responses']['200']['content']['application/json'];

// ✅ Always in sync with backend
// ✅ Update backend → regenerate → frontend breaks at compile time
// ✅ Zero manual maintenance
```

## 🎨 IDE Autocomplete

When you type `response.`, your IDE will show:

```typescript
response.
  ├─ accessToken: string
  ├─ idToken: string
  ├─ refreshToken: string
  ├─ expiresIn: number
  ├─ tokenType: "Bearer"
  └─ message: string
```

**All typed and auto-completed! 🎉**

## 🔄 Update Workflow

When backend API changes:

```bash
# ========================================
# BACKEND (ai-platform-university-books)
# ========================================

# 1. Backend developer updates Zod schema
cd ~/ai-platform-university-books
vim lib/api/v1/schemas/auth/login.schema.ts

# 2. Regenerate OpenAPI spec and types
npm run generate:all

# This generates:
# - dist/openapi.json (OpenAPI 3.1.0 spec)
# - Copies api-types.ts to frontend if path is configured

# ========================================
# FRONTEND (university-books-apps)
# ========================================

# 3. Pull latest backend changes
cd ~/university-books-apps

# 4. Regenerate frontend types from updated OpenAPI spec
# Option A: If backend auto-copied types
npm install  # Types are ready to use

# Option B: Manual regeneration (if needed)
npm run generate:types
# This runs: openapi-typescript ../ai-platform-university-books/dist/openapi.json \
#            -o libs/auth/src/lib/generated/api-types.ts

# 5. Frontend breaks at compile time if changes are incompatible
# Example: Backend renamed "username" → "email"
ng build
# Output: error TS2339: Property 'username' does not exist on type 'LoginRequest'

# 6. Fix frontend code
# Replace all "username" references with "email"
# IDE will show all errors - fix them one by one

# 7. Build succeeds - no runtime surprises! ✅
ng build --configuration=production
```

## 🔧 Type Generation Commands

### Backend Commands (ai-platform-university-books)

```bash
# Generate OpenAPI spec from Zod schemas
npm run generate:openapi

# Generate TypeScript types for frontend
npm run generate:types

# Generate both (recommended)
npm run generate:all

# Validate OpenAPI spec
npx swagger-cli validate dist/openapi.json

# View OpenAPI spec in browser
npx serve dist
# Open: http://localhost:3000/openapi.json
```

### Frontend Commands (university-books-apps)

```bash
# Regenerate types from backend OpenAPI spec
npm run generate:types

# Or manually
npx openapi-typescript ../ai-platform-university-books/dist/openapi.json \
  -o libs/auth/src/lib/generated/api-types.ts

# Verify types are correct
npm run lint
npm run build
```

## ⚡ Quick Sync Workflow

After backend changes, sync frontend types:

```bash
# 1. In backend repo - regenerate OpenAPI
cd ~/ai-platform-university-books
npm run generate:all

# 2. In frontend repo - pull new types
cd ~/university-books-apps
npm run generate:types

# 3. Fix any TypeScript errors
npm run lint --fix
npm run build

# 4. Test the changes
npm run test
npm start

# Done! Frontend is synced with backend ✅
```

## 📚 Books Service Example

```typescript
// libs/books/src/lib/services/books.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { paths } from '../../../../auth/src/lib/generated/api-types';

// Extract types for books endpoints
type ListBooksRequest = paths['/v1/books']['get']['parameters']['query'];

type ListBooksResponse =
  paths['/v1/books']['get']['responses']['200']['content']['application/json'];

type BookDetails =
  paths['/v1/books/{bookId}']['get']['responses']['200']['content']['application/json'];

type DownloadUrlResponse =
  paths['/v1/books/{bookId}/download']['get']['responses']['200']['content']['application/json'];

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * List books with pagination and filters
   * ✅ Query params: { page?, limit?, category?, author?, search?, sortBy?, sortOrder? }
   * ✅ Response: { books[], pagination, filters }
   */
  listBooks(params?: ListBooksRequest): Observable<ListBooksResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ListBooksResponse>(
      `${this.apiUrl}/v1/books`,
      { params: httpParams }
    );
  }

  /**
   * Get book details by ID
   * ✅ Path parameter typed
   * ✅ Response includes full book metadata
   */
  getBookDetails(bookId: string): Observable<BookDetails> {
    return this.http.get<BookDetails>(`${this.apiUrl}/v1/books/${bookId}`);
  }

  /**
   * Get presigned download URL for book PDF
   * ✅ Returns: { downloadUrl, expiresAt, expiresIn, fileName, fileSize, contentType }
   * ✅ URL expires in 1 hour
   */
  getDownloadUrl(bookId: string): Observable<DownloadUrlResponse> {
    return this.http.get<DownloadUrlResponse>(
      `${this.apiUrl}/v1/books/${bookId}/download`
    );
  }

  /**
   * Download book PDF to device
   * @param bookId - Book identifier
   * @returns Promise that resolves when download starts
   */
  async downloadBook(bookId: string): Promise<void> {
    // 1. Get presigned URL
    const downloadData = await this.getDownloadUrl(bookId).toPromise();

    // 2. Download file (opens in browser or triggers download)
    window.open(downloadData.downloadUrl, '_blank');

    // Alternative: Download with progress tracking
    // const response = await fetch(downloadData.downloadUrl);
    // const blob = await response.blob();
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = downloadData.fileName;
    // a.click();
    // URL.revokeObjectURL(url);
  }
}
```

## 📱 Books Component Example

```typescript
// apps/mobile/src/app/books/books.component.ts
import { Component, OnInit } from '@angular/core';
import { BooksService } from '@libs/books';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-books',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Library</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="showFilters()">
            <ion-icon name="filter"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Search bar -->
      <ion-toolbar>
        <ion-searchbar
          [(ngModel)]="searchQuery"
          (ionChange)="onSearchChange()"
          placeholder="Search books...">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Category filters -->
      <ion-segment [(ngModel)]="selectedCategory" (ionChange)="onCategoryChange()">
        <ion-segment-button value="">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button
          *ngFor="let category of availableCategories"
          [value]="category">
          <ion-label>{{ category }}</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Books list -->
      <ion-list>
        <ion-item
          *ngFor="let book of books"
          [routerLink]="['/books', book.bookId]"
          button>
          <ion-thumbnail slot="start">
            <img [src]="book.coverImageUrl" [alt]="book.title">
          </ion-thumbnail>

          <ion-label>
            <h2>{{ book.title }}</h2>
            <p>{{ book.author }}</p>
            <ion-note>
              {{ book.pages }} pages • {{ book.rating }}⭐ •
              {{ book.downloadCount }} downloads
            </ion-note>
          </ion-label>

          <ion-button
            slot="end"
            fill="clear"
            (click)="downloadBook(book.bookId, $event)">
            <ion-icon name="download"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Pagination -->
      <ion-infinite-scroll
        *ngIf="pagination?.hasNext"
        (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  availableCategories: string[] = [];
  pagination: any;

  selectedCategory = '';
  searchQuery = '';
  currentPage = 1;

  constructor(
    private booksService: BooksService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  async loadBooks(append = false) {
    const loading = await this.loadingCtrl.create({
      message: 'Loading books...'
    });
    await loading.present();

    try {
      const response = await this.booksService.listBooks({
        page: this.currentPage,
        limit: 20,
        category: this.selectedCategory || undefined,
        search: this.searchQuery || undefined,
        sortBy: 'recent',
        sortOrder: 'desc'
      }).toPromise();

      if (append) {
        this.books = [...this.books, ...response.books];
      } else {
        this.books = response.books;
      }

      this.pagination = response.pagination;
      this.availableCategories = response.filters.categories;
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to load books',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  async loadMore(event: any) {
    this.currentPage++;
    await this.loadBooks(true);
    event.target.complete();
  }

  async downloadBook(bookId: string, event: Event) {
    event.stopPropagation();

    const loading = await this.loadingCtrl.create({
      message: 'Preparing download...'
    });
    await loading.present();

    try {
      await this.booksService.downloadBook(bookId);

      const toast = await this.toastCtrl.create({
        message: 'Download started!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to download book',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  showFilters() {
    // Show filter modal
  }
}
```

## 🔑 Key Features of Books Integration

### Type Safety
- ✅ All request parameters auto-validated by TypeScript
- ✅ Response shapes guaranteed to match backend
- ✅ Compilation errors if backend changes

### Pagination
```typescript
// Frontend automatically handles pagination
const response = await booksService.listBooks({ page: 2, limit: 20 });

// Response includes:
// - books: BookListItem[]
// - pagination: { page, limit, total, totalPages, hasNext, hasPrevious }
// - filters: { categories[], authors[] }
```

### Filtering & Search
```typescript
// Filter by category
booksService.listBooks({ category: 'FICTION' });

// Filter by author
booksService.listBooks({ author: 'Umberto Eco' });

// Search in title and author
booksService.listBooks({ search: 'rosa' });

// Combine filters
booksService.listBooks({
  category: 'FICTION',
  search: 'guerra',
  sortBy: 'popular',
  sortOrder: 'desc'
});
```

### Secure Downloads
```typescript
// Get presigned S3 URL (expires in 1 hour)
const downloadData = await booksService.getDownloadUrl(bookId).toPromise();

// downloadData contains:
// - downloadUrl: "https://s3.amazonaws.com/..."
// - expiresAt: "2025-12-09T23:45:25Z"
// - expiresIn: 3600 (seconds)
// - fileName: "il-nome-della-rosa-umberto-eco.pdf"
// - fileSize: 15728640 (bytes)
// - contentType: "application/pdf"
```

## 📚 Best Practices

1. **Always regenerate types after backend changes**
2. **Never modify `api-types.ts` manually**
3. **Use type aliases for readability**
4. **Handle all response types (200, 400, 401, 500)**
5. **Test with invalid data to verify validation**
6. **Cache book lists to reduce API calls**
7. **Show download progress for large PDFs**
8. **Handle expired download URLs gracefully**

---

## 🆕 Latest Backend Updates (December 2025)

### New Endpoints

#### 1. **GET /v1/auth/me** - Get Current User Profile

Returns user information extracted from JWT token (no database query).

```typescript
// Type definition
type UserProfile = paths['/v1/auth/me']['get']['responses']['200']['content']['application/json'];

// Usage
const userProfile = await authService.getCurrentUser().toPromise();

// Response structure:
// {
//   sub: string;           // User ID (UUID)
//   email: string;         // User email
//   username: string;      // Username
//   tenantId?: string;     // Tenant ID (if multi-tenant)
//   role?: string;         // User role
//   iat: number;           // Token issued at (timestamp)
//   exp: number;           // Token expires at (timestamp)
// }
```

**Use Cases:**
- Display user info in navigation/profile
- Check user permissions
- Verify token validity
- Get tenant context

**Example Component:**

```typescript
@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card *ngIf="user">
        <ion-card-header>
          <ion-card-title>{{ user.username }}</ion-card-title>
          <ion-card-subtitle>{{ user.email }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>User ID</ion-label>
              <ion-note slot="end">{{ user.sub }}</ion-note>
            </ion-item>
            <ion-item *ngIf="user.role">
              <ion-label>Role</ion-label>
              <ion-note slot="end">{{ user.role }}</ion-note>
            </ion-item>
            <ion-item *ngIf="user.tenantId">
              <ion-label>Tenant</ion-label>
              <ion-note slot="end">{{ user.tenantId }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Token Expires</ion-label>
              <ion-note slot="end">{{ user.exp * 1000 | date:'short' }}</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class ProfilePage implements OnInit {
  user?: UserProfile;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      this.user = await this.authService.getCurrentUser().toPromise();
    } catch (error) {
      console.error('Failed to load user profile', error);
    }
  }
}
```

### Updated Type Generation Workflow

The backend has been updated with improved type generation:

1. **New Schema Location**: `lib/api/v1/schemas/` (versioned structure)
2. **Consolidated Documentation**: See `docs/development/TYPE-GENERATION.md` in backend repo
3. **Improved OpenAPI Generation**: Better error messages and validation

### Migration Steps

If you're using older generated types:

```bash
# 1. Pull latest backend changes
cd ~/ai-platform-university-books
git pull origin master

# 2. Clean old generated files
rm -rf dist/

# 3. Rebuild and regenerate
npm install
npm run build
npm run generate:all

# 4. Update frontend types
cd ~/university-books-apps
npm run generate:types

# 5. Fix any TypeScript errors
npm run lint
npm run build

# 6. Test all endpoints
npm run test
```

### Breaking Changes

None in this update! All existing endpoints remain backward compatible.

### New Features Available

✅ `/v1/auth/me` - Get user profile from JWT
✅ Improved error messages in OpenAPI spec
✅ Better TypeScript type inference
✅ Updated documentation with examples

---

## 📖 Documentation Links

- **Backend Type Generation**: `~/ai-platform-university-books/docs/development/TYPE-GENERATION.md`
- **Backend API Reference**: `~/ai-platform-university-books/docs/06-api/REFERENCE.md`
- **Refactoring History**: `~/ai-platform-university-books/docs/development/REFACTORING-HISTORY.md`

---

**Last Updated**: December 11, 2025
**Backend Version**: 2.0.0
**Frontend Version**: Compatible with backend 2.0.0+

**Enjoy type-safe development! 🚀**
