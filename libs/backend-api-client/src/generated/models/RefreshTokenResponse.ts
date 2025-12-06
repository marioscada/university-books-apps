/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
export type RefreshTokenResponse = (MessageResponse & {
  /**
   * New JWT access token
   */
  accessToken: string;
  /**
   * New JWT ID token
   */
  idToken: string;
  /**
   * Token expiration time in seconds
   */
  expiresIn: number;
  /**
   * Token type (always Bearer)
   */
  tokenType: 'Bearer';
});

