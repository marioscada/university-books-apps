/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterRequest = {
  /**
   * User email address
   */
  email: string;
  /**
   * User password (min 12 chars, uppercase, lowercase, number, special char)
   */
  password: string;
  /**
   * User first name
   */
  givenName: string;
  /**
   * User last name
   */
  familyName: string;
  /**
   * User phone number in E.164 format (optional)
   */
  phoneNumber?: string;
};

