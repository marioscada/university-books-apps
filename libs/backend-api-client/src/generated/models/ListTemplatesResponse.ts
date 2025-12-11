/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Template } from './Template';
export type ListTemplatesResponse = {
  /**
   * Array of templates
   */
  templates: Array<Template>;
  /**
   * Pagination token for next page
   */
  lastEvaluatedKey?: string;
};

