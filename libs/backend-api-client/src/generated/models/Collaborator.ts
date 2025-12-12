/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollaboratorRole } from './CollaboratorRole';
import type { Permission } from './Permission';
export type Collaborator = {
  /**
   * Book identifier
   */
  bookId: string;
  /**
   * User identifier
   */
  userId: string;
  role: CollaboratorRole;
  /**
   * Granted permissions
   */
  permissions: Array<Permission>;
  /**
   * When collaborator was added
   */
  addedAt: string;
  /**
   * User ID who added this collaborator
   */
  addedBy: string;
  /**
   * Tenant identifier
   */
  tenantId: string;
};

