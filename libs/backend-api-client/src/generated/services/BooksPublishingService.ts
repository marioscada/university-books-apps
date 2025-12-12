/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublishBookRequest } from '../models/PublishBookRequest';
import type { PublishBookResponse } from '../models/PublishBookResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BooksPublishingService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Publish book as new version
   * Create an immutable published snapshot of the book. Auto-increments version (v001 → v002). Atomic transaction ensures consistency.
   * @returns PublishBookResponse Book published successfully
   * @throws ApiError
   */
  public postV1BooksPublish({
    bookId,
    requestBody,
  }: {
    /**
     * Book ID
     */
    bookId: string,
    requestBody?: PublishBookRequest,
  }): CancelablePromise<PublishBookResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/books/{bookId}/publish',
      path: {
        'bookId': bookId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        409: `Conflict - Publish conflict, retry recommended`,
        500: `Internal Server Error`,
      },
    });
  }
}
