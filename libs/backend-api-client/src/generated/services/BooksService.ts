/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Book } from '../models/Book';
import type { BookCategory } from '../models/BookCategory';
import type { DownloadUrlResponse } from '../models/DownloadUrlResponse';
import type { ListBooksResponse } from '../models/ListBooksResponse';
import type { SortBy } from '../models/SortBy';
import type { SortOrder } from '../models/SortOrder';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BooksService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * List books with pagination and filters
   * Retrieve a paginated list of books with optional filters for category, author, and search. Includes pagination metadata and available filter options.
   * @returns ListBooksResponse Books list retrieved successfully
   * @throws ApiError
   */
  public getV1Books({
    page = '1',
    limit = '20',
    category,
    author,
    search,
    sortBy,
    sortOrder,
    status,
  }: {
    /**
     * Page number (1-indexed)
     */
    page?: string,
    /**
     * Items per page (max 100)
     */
    limit?: string,
    /**
     * Filter by category
     */
    category?: BookCategory,
    /**
     * Filter by author (exact match)
     */
    author?: string,
    /**
     * Search in title and author (partial match)
     */
    search?: string,
    /**
     * Sort field
     */
    sortBy?: SortBy,
    /**
     * Sort direction
     */
    sortOrder?: SortOrder,
    /**
     * Filter by status (default: PUBLISHED only)
     */
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  }): CancelablePromise<ListBooksResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books',
      query: {
        'page': page,
        'limit': limit,
        'category': category,
        'author': author,
        'search': search,
        'sortBy': sortBy,
        'sortOrder': sortOrder,
        'status': status,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Get book details
   * Retrieve complete metadata for a specific book. Increments view count asynchronously.
   * @returns Book Book details retrieved successfully
   * @throws ApiError
   */
  public getV1Books1({
    bookId,
  }: {
    /**
     * Book ID
     */
    bookId: string,
  }): CancelablePromise<Book> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books/{bookId}',
      path: {
        'bookId': bookId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        403: `Forbidden - Insufficient permissions`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Get download URL for book PDF
   * Generate a presigned S3 URL for downloading the book PDF. URL expires in 1 hour. Increments download count and records analytics event.
   * @returns DownloadUrlResponse Download URL generated successfully
   * @throws ApiError
   */
  public getV1BooksDownload({
    bookId,
  }: {
    /**
     * Book ID
     */
    bookId: string,
  }): CancelablePromise<DownloadUrlResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books/{bookId}/download',
      path: {
        'bookId': bookId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        403: `Forbidden - Insufficient permissions`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
}
