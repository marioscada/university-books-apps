/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultipartPartUrlRequest = {
  /**
   * Unique document identifier
   */
  documentId: string;
  /**
   * Multipart upload ID from initiate response
   */
  uploadId: string;
  /**
   * Part number (1-based)
   */
  partNumber: number;
};

