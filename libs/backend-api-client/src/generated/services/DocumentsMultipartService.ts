/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MultipartAbortRequest } from '../models/MultipartAbortRequest';
import type { MultipartAbortResponse } from '../models/MultipartAbortResponse';
import type { MultipartCompleteRequest } from '../models/MultipartCompleteRequest';
import type { MultipartCompleteResponse } from '../models/MultipartCompleteResponse';
import type { MultipartInitiateRequest } from '../models/MultipartInitiateRequest';
import type { MultipartInitiateResponse } from '../models/MultipartInitiateResponse';
import type { MultipartPartUrlRequest } from '../models/MultipartPartUrlRequest';
import type { MultipartPartUrlResponse } from '../models/MultipartPartUrlResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DocumentsMultipartService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Initiate multipart upload
   * Start a multipart upload for large files (>5MB). Returns uploadId and metadata.
   * @returns MultipartInitiateResponse Multipart upload initiated
   * @throws ApiError
   */
  public postV1DocumentsMultipartInitiate({
    requestBody,
  }: {
    requestBody?: MultipartInitiateRequest,
  }): CancelablePromise<MultipartInitiateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/documents/multipart/initiate',
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
   * Get presigned URL for upload part
   * Generate presigned URL for uploading a specific part of a multipart upload
   * @returns MultipartPartUrlResponse Presigned URL generated for part
   * @throws ApiError
   */
  public postV1DocumentsMultipartPartUrl({
    requestBody,
  }: {
    requestBody?: MultipartPartUrlRequest,
  }): CancelablePromise<MultipartPartUrlResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/documents/multipart/part-url',
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
  /**
   * Complete multipart upload
   * Finalize multipart upload by combining all parts. Creates document metadata record.
   * @returns MultipartCompleteResponse Multipart upload completed
   * @throws ApiError
   */
  public postV1DocumentsMultipartComplete({
    requestBody,
  }: {
    requestBody?: MultipartCompleteRequest,
  }): CancelablePromise<MultipartCompleteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/documents/multipart/complete',
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
  /**
   * Abort multipart upload
   * Cancel an in-progress multipart upload and clean up uploaded parts
   * @returns MultipartAbortResponse Multipart upload aborted
   * @throws ApiError
   */
  public postV1DocumentsMultipartAbort({
    requestBody,
  }: {
    requestBody?: MultipartAbortRequest,
  }): CancelablePromise<MultipartAbortResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/documents/multipart/abort',
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
