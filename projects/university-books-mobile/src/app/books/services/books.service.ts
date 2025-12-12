import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Book,
  ListBooksResponse,
  DownloadUrlResponse,
  BookCategory,
  SortBy,
  SortOrder,
} from '@university-books/backend-api-client';
import { environment } from '../../../environments/environment';

/**
 * Service for managing books operations
 *
 * Uses Angular HttpClient for API calls with type-safe interfaces
 * from auto-generated OpenAPI client
 */
@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/v1/books`;

  /**
   * Total count of books available
   * Updated automatically when listBooks() is called
   */
  public readonly totalBooksCount = signal<number>(0);

  /**
   * List books with pagination and filters
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Observable with books list, pagination and filters
   */
  listBooks(params?: {
    page?: string;
    limit?: string;
    category?: BookCategory;
    author?: string;
    search?: string;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }): Observable<ListBooksResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.author) httpParams = httpParams.set('author', params.author);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<ListBooksResponse>(this.baseUrl, { params: httpParams }).pipe(
      tap((response) => {
        // Update total count from pagination metadata
        if (response.pagination?.total !== undefined) {
          this.totalBooksCount.set(response.pagination.total);
        }
      })
    );
  }

  /**
   * Get book details by ID
   *
   * @param bookId - Book identifier
   * @returns Observable with complete book metadata
   */
  getBookDetails(bookId: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${bookId}`);
  }

  /**
   * Get presigned download URL for book PDF
   *
   * @param bookId - Book identifier
   * @returns Observable with download URL and metadata
   */
  getDownloadUrl(bookId: string): Observable<DownloadUrlResponse> {
    return this.http.get<DownloadUrlResponse>(`${this.baseUrl}/${bookId}/download`);
  }

  /**
   * Download book PDF to device
   *
   * Opens download URL in new window/tab
   *
   * @param bookId - Book identifier
   * @returns Promise that resolves when download starts
   */
  async downloadBook(bookId: string): Promise<void> {
    const downloadData = await this.getDownloadUrl(bookId).toPromise();

    if (downloadData?.downloadUrl) {
      window.open(downloadData.downloadUrl, '_blank');
    } else {
      throw new Error('Download URL not available');
    }
  }
}
