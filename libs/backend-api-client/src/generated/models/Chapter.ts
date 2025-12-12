/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChapterStatus } from './ChapterStatus';
export type Chapter = {
  /**
   * Book identifier
   */
  bookId: string;
  /**
   * Chapter number (1-indexed)
   */
  chapterNumber: number;
  /**
   * Chapter title
   */
  title: string;
  /**
   * Chapter content (Markdown or HTML)
   */
  content: string;
  /**
   * Word count
   */
  wordCount: number;
  status?: ChapterStatus;
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

