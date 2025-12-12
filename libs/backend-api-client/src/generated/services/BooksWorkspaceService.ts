/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookWorkspace } from '../models/BookWorkspace';
import type { UpdateWorkspaceProgress } from '../models/UpdateWorkspaceProgress';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BooksWorkspaceService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get book workspace
   * Retrieve workspace metadata for a book including progress tracking and template customizations.
   * @returns BookWorkspace Workspace retrieved successfully
   * @throws ApiError
   */
  public getV1BooksWorkspace({
    bookId,
  }: {
    /**
     * Book ID
     */
    bookId: string,
  }): CancelablePromise<BookWorkspace> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books/{bookId}/workspace',
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
   * Update workspace progress
   * Update writing progress, word count, and workflow status for a book workspace.
   * @returns BookWorkspace Workspace updated successfully
   * @throws ApiError
   */
  public putV1BooksWorkspace({
    bookId,
    requestBody,
  }: {
    /**
     * Book ID
     */
    bookId: string,
    requestBody?: UpdateWorkspaceProgress,
  }): CancelablePromise<BookWorkspace> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/v1/books/{bookId}/workspace',
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
