/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
export type RegisterResponse = (MessageResponse & {
  /**
   * Unique user identifier
   */
  userId: string;
  /**
   * User email address
   */
  email: string;
  /**
   * Whether email verification is required
   */
  emailVerificationRequired: boolean;
});

