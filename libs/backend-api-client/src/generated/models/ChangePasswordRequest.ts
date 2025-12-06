/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ChangePasswordRequest = {
  /**
   * User current password
   */
  currentPassword: string;
  /**
   * New password (min 12 chars, uppercase, lowercase, number, special char)
   */
  newPassword: string;
};

