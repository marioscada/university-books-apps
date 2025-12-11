/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultipartPartUrlResponse = {
  /**
   * Presigned URL for uploading this part
   */
  uploadUrl: string;
  /**
   * Part number
   */
  partNumber: number;
  /**
   * URL expiration time in seconds
   */
  expiresIn: number;
};

