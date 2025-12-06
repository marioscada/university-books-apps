/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResetPasswordRequest = {
  /**
   * User email address
   */
  email: string;
  /**
   * Verification code received via email
   */
  code: string;
  /**
   * New password (min 12 chars, uppercase, lowercase, number, special char)
   */
  newPassword: string;
};

