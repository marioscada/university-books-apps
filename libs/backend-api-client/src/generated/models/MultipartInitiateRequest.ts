/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultipartInitiateRequest = {
  /**
   * Document file name
   */
  fileName: string;
  /**
   * MIME type
   */
  contentType: string;
  /**
   * Total file size in bytes
   */
  fileSize: number;
  /**
   * Part size in bytes (5MB-100MB, default 10MB)
   */
  partSize?: number;
};

