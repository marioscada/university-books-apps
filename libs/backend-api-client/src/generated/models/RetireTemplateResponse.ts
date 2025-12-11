/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Criterion } from './Criterion';
import type { TemplateStatus } from './TemplateStatus';
export type RetireTemplateResponse = {
  /**
   * Unique template identifier
   */
  templateId: string;
  /**
   * Template name
   */
  name: string;
  /**
   * Template description
   */
  description?: string;
  /**
   * Evaluation criteria
   */
  criteria: Array<Criterion>;
  status: TemplateStatus;
  /**
   * Template version number
   */
  version: number;
  /**
   * User who created the template
   */
  createdBy: string;
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

