/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Criterion } from './Criterion';
export type UpdateTemplateRequest = {
  /**
   * Template name
   */
  name?: string;
  /**
   * Template description
   */
  description?: string;
  /**
   * Evaluation criteria
   */
  criteria?: Array<Criterion>;
};

