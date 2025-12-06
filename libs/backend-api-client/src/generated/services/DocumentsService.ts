/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentMetadata } from '../models/DocumentMetadata';
import type { PresignedUrlRequest } from '../models/PresignedUrlRequest';
import type { PresignedUrlResponse } from '../models/PresignedUrlResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DocumentsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Generate presigned URL for document upload
   * Creates a presigned S3 URL for direct document upload
   * @returns PresignedUrlResponse Presigned URL generated
   * @throws ApiError
   */
  public postV1DocumentsPresignedUrl({
    requestBody,
  }: {
    requestBody?: PresignedUrlRequest,
  }): CancelablePromise<PresignedUrlResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/documents/presigned-url',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Get document metadata
   * Retrieve metadata for a specific document
   * @returns DocumentMetadata Document metadata retrieved
   * @throws ApiError
   */
  public getV1Documents({
    documentId,
  }: {
    /**
     * Document ID
     */
    documentId: string,
  }): CancelablePromise<DocumentMetadata> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/documents/{documentId}',
      path: {
        'documentId': documentId,
      },
      errors: {
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
}
