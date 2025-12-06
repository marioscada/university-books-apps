/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PresignedUrlResponse = {
  /**
   * Unique document identifier
   */
  documentId: string;
  /**
   * Presigned URL for uploading the document
   */
  uploadUrl: string;
  /**
   * URL expiration time in seconds
   */
  expiresIn: number;
};

