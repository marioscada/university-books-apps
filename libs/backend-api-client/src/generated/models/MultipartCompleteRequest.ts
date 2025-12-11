/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultipartCompleteRequest = {
  /**
   * Unique document identifier
   */
  documentId: string;
  /**
   * Multipart upload ID
   */
  uploadId: string;
  /**
   * Array of uploaded parts with ETags
   */
  parts: Array<{
    /**
     * Part number
     */
    partNumber: number;
    /**
     * ETag from S3 upload response
     */
    eTag: string;
  }>;
};

