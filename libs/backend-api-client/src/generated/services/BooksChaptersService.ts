/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Chapter } from '../models/Chapter';
import type { UpsertChapterRequest } from '../models/UpsertChapterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BooksChaptersService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * List book chapters
   * Retrieve all chapters for a book in order. Returns chapter metadata and content.
   * @returns any Chapters retrieved successfully
   * @throws ApiError
   */
  public getV1BooksChapters({
    bookId,
  }: {
    /**
     * Book ID
     */
    bookId: string,
  }): CancelablePromise<{
    bookId: string;
    chapters: Array<Chapter>;
    totalChapters: number;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books/{bookId}/chapters',
      path: {
        'bookId': bookId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Create or update chapter
   * Upsert a chapter for a book. Creates if not exists, updates if exists. Auto-calculates word count.
   * @returns Chapter Chapter created/updated successfully
   * @throws ApiError
   */
  public postV1BooksChapters({
    bookId,
    requestBody,
  }: {
    /**
     * Book ID
     */
    bookId: string,
    requestBody?: UpsertChapterRequest,
  }): CancelablePromise<Chapter> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/books/{bookId}/chapters',
      path: {
        'bookId': bookId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
}
