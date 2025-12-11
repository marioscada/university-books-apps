/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultipartInitiateResponse = {
  /**
   * Unique document identifier
   */
  documentId: string;
  /**
   * Multipart upload ID
   */
  uploadId: string;
  /**
   * Total number of parts
   */
  totalParts: number;
  /**
   * Size of each part in bytes
   */
  partSize: number;
};

