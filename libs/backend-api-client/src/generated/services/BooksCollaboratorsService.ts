/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddCollaboratorRequest } from '../models/AddCollaboratorRequest';
import type { Collaborator } from '../models/Collaborator';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BooksCollaboratorsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * List book collaborators
   * Retrieve all collaborators for a book with their roles and permissions.
   * @returns any Collaborators retrieved successfully
   * @throws ApiError
   */
  public getV1BooksCollaborators({
    bookId,
  }: {
    /**
     * Book ID
     */
    bookId: string,
  }): CancelablePromise<{
    bookId: string;
    collaborators: Array<Collaborator>;
    totalCount: number;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/books/{bookId}/collaborators',
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
   * Add collaborator to book
   * Grant a user access to collaborate on a book with specified role and permissions.
   * @returns Collaborator Collaborator added successfully
   * @throws ApiError
   */
  public postV1BooksCollaborators({
    bookId,
    requestBody,
  }: {
    /**
     * Book ID
     */
    bookId: string,
    requestBody?: AddCollaboratorRequest,
  }): CancelablePromise<Collaborator> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/books/{bookId}/collaborators',
      path: {
        'bookId': bookId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        409: `Conflict - Collaborator already exists`,
        500: `Internal Server Error`,
      },
    });
  }
}
