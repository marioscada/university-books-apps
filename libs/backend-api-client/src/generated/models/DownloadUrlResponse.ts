/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DownloadUrlResponse = {
  /**
   * Pre-signed S3 URL for downloading the book
   */
  downloadUrl: string;
  /**
   * When the URL expires (ISO 8601)
   */
  expiresAt: string;
  /**
   * Seconds until URL expires
   */
  expiresIn: number;
  /**
   * Suggested filename for download
   */
  fileName: string;
  /**
   * File size in bytes
   */
  fileSize: number;
  /**
   * MIME type (e.g., application/pdf)
   */
  contentType: string;
};

