/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoginResponse = {
  /**
   * Success message
   */
  message: string;
  /**
   * JWT access token for API authentication
   */
  accessToken: string;
  /**
   * JWT ID token containing user claims
   */
  idToken: string;
  /**
   * Refresh token for obtaining new access tokens
   */
  refreshToken: string;
  /**
   * Access token expiration time in seconds
   */
  expiresIn: number;
  /**
   * Token type (always Bearer)
   */
  tokenType: 'Bearer';
};

