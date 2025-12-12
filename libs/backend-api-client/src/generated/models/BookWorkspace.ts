/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateCustomizations } from './TemplateCustomizations';
import type { WorkspaceStatus } from './WorkspaceStatus';
export type BookWorkspace = {
  /**
   * Unique book identifier
   */
  bookId: string;
  /**
   * Book title
   */
  title: string;
  /**
   * Book subtitle
   */
  subtitle?: string;
  /**
   * Primary author name
   */
  author: string;
  /**
   * CloudFront URL for cover image
   */
  coverImageUrl: string;
  /**
   * Book category
   */
  category: string;
  /**
   * Writing progress (0-100)
   */
  progressPercentage?: number;
  /**
   * Total words written
   */
  wordsWritten?: number;
  /**
   * Target word count goal
   */
  targetWordCount: number;
  /**
   * Current chapter being worked on
   */
  currentChapter?: number;
  /**
   * Total chapters planned
   */
  totalChapters: number;
  /**
   * Last edit timestamp
   */
  lastEditedAt: string;
  /**
   * Estimated completion date
   */
  estimatedCompletionDate?: string;
  /**
   * Template reference
   */
  templateId?: string;
  /**
   * Template version (e.g., v1.0.0)
   */
  templateVersion?: string;
  templateCustomizations?: TemplateCustomizations;
  workflowStatus?: WorkspaceStatus;
  /**
   * User IDs of reviewers
   */
  reviewers?: Array<string>;
  /**
   * User ID who approved
   */
  approvedBy?: string;
  /**
   * Approval timestamp
   */
  approvedAt?: string;
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

