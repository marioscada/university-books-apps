/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentStatus } from './DocumentStatus';
export type DocumentMetadata = {
  /**
   * Unique document identifier
   */
  documentId: string;
  /**
   * Document file name
   */
  fileName: string;
  /**
   * MIME type
   */
  fileType: string;
  /**
   * File size in bytes
   */
  fileSize: number;
  status: DocumentStatus;
  /**
   * ISO 8601 timestamp
   */
  createdAt: string;
  /**
   * ISO 8601 timestamp
   */
  updatedAt: string;
  /**
   * Tenant identifier
   */
  tenantId: string;
  /**
   * User identifier
   */
  userId: string;
};

