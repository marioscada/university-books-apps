/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentStatus } from './DocumentStatus';
export type MultipartCompleteResponse = {
  /**
   * Unique document identifier
   */
  documentId: string;
  status: DocumentStatus;
  /**
   * Success message
   */
  message: string;
};

