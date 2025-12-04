/**
 * API Service
 *
 * Centralized service for all HTTP requests to the University Books backend.
 * Implements Angular best practices:
 * - Uses HttpClient with typed responses
 * - Proper error handling with retry logic
 * - RxJS operators for async operations
 * - Environment-based configuration
 *
 * @see https://angular.dev/guide/http
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ============================================================================
// Response Types
// ============================================================================

export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  pagesCount?: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// API Service
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.baseUrl;
  private readonly requestTimeout = environment.api.timeout;
  private readonly retryAttempts = environment.api.retryAttempts;

  /**
   * Generic GET request with error handling and retry logic
   */
  private get<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.get<T>(url).pipe(
      timeout(this.requestTimeout),
      retry({
        count: this.retryAttempts,
        delay: (error, retryCount) => {
          // Exponential backoff: 1s, 2s, 4s...
          const delayMs = Math.pow(2, retryCount - 1) * environment.api.retryDelay;
          return timer(delayMs);
        },
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST request with error handling
   */
  private post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.post<T>(url, body).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Generic PUT request with error handling
   */
  private put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.put<T>(url, body).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Generic DELETE request with error handling
   */
  private delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.delete<T>(url).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  // ==========================================================================
  // Document APIs
  // ==========================================================================

  /**
   * Get presigned URL for document upload
   */
  getPresignedUrl(fileName: string, fileType: string): Observable<{ uploadUrl: string; documentId: string }> {
    return this.post('/v1/documents/presigned-url', {
      fileName,
      fileType,
    });
  }

  /**
   * Get document metadata by ID
   */
  getDocument(documentId: string): Observable<Document> {
    return this.get<Document>(`/v1/documents/${documentId}`);
  }

  /**
   * Initiate multipart upload for large files
   */
  initiateMultipartUpload(
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Observable<{ uploadId: string; documentId: string }> {
    return this.post('/v1/documents/multipart/initiate', {
      fileName,
      fileSize,
      mimeType,
    });
  }

  /**
   * Complete multipart upload
   */
  completeMultipartUpload(
    documentId: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Observable<{ success: boolean }> {
    return this.post('/v1/documents/multipart/complete', {
      documentId,
      uploadId,
      parts,
    });
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Health check endpoint to verify API connectivity
   */
  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.get('/v1/health');
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  /**
   * Centralized error handler with detailed logging
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server error: ${error.status} - ${error.message}`;

      // Log specific error codes
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized: Please check your API key';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to access this resource';
          break;
        case 404:
          errorMessage = 'Not found: The requested resource does not exist';
          break;
        case 429:
          errorMessage = 'Too many requests: Please try again later';
          break;
        case 500:
          errorMessage = 'Internal server error: Please try again later';
          break;
      }
    }

    // Log to console in development
    if (environment.features.enableDebugLogging) {
      console.error('API Error:', {
        message: errorMessage,
        status: error.status,
        url: error.url,
        error: error.error,
      });
    }

    return throwError(() => new Error(errorMessage));
  }
}

/**
 * Usage in Components (with modern Angular patterns):
 *
 * @Component({
 *   selector: 'app-documents',
 *   standalone: true,
 *   template: `
 *     @if (loading()) {
 *       <p>Loading...</p>
 *     } @else if (error()) {
 *       <p>Error: {{ error() }}</p>
 *     } @else {
 *       <ul>
 *         @for (doc of documents(); track doc.id) {
 *           <li>{{ doc.fileName }}</li>
 *         }
 *       </ul>
 *     }
 *   `
 * })
 * export class DocumentsComponent {
 *   private apiService = inject(ApiService);
 *
 *   documents = signal<Document[]>([]);
 *   loading = signal(false);
 *   error = signal<string | null>(null);
 *
 *   ngOnInit() {
 *     this.loadDocuments();
 *   }
 *
 *   loadDocuments() {
 *     this.loading.set(true);
 *     this.error.set(null);
 *
 *     this.apiService.getDocument('doc-123').subscribe({
 *       next: (doc) => {
 *         this.documents.set([doc]);
 *         this.loading.set(false);
 *       },
 *       error: (err) => {
 *         this.error.set(err.message);
 *         this.loading.set(false);
 *       }
 *     });
 *   }
 * }
 */
