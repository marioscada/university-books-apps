/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { ChangePasswordResponse } from '../models/ChangePasswordResponse';
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { ForgotPasswordResponse } from '../models/ForgotPasswordResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { LogoutResponse } from '../models/LogoutResponse';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import type { RefreshTokenResponse } from '../models/RefreshTokenResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { ResetPasswordResponse } from '../models/ResetPasswordResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Login with email and password
   * Authenticate user with Cognito and return JWT tokens
   * @returns LoginResponse Login successful
   * @throws ApiError
   */
  public postV1AuthLogin({
    requestBody,
  }: {
    requestBody?: LoginRequest,
  }): CancelablePromise<LoginResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/login',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Refresh access token
   * Obtain new access and ID tokens using refresh token
   * @returns RefreshTokenResponse Token refresh successful
   * @throws ApiError
   */
  public postV1AuthRefresh({
    requestBody,
  }: {
    requestBody?: RefreshTokenRequest,
  }): CancelablePromise<RefreshTokenResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/refresh',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Logout (revoke tokens)
   * Performs GlobalSignOut to revoke all user tokens
   * @returns LogoutResponse Logout successful
   * @throws ApiError
   */
  public postV1AuthLogout(): CancelablePromise<LogoutResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/logout',
      errors: {
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Register new user
   * Creates a new user account in Cognito User Pool
   * @returns RegisterResponse Registration successful
   * @throws ApiError
   */
  public postV1AuthRegister({
    requestBody,
  }: {
    requestBody?: RegisterRequest,
  }): CancelablePromise<RegisterResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/register',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        409: `Conflict - User already exists`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Request password reset
   * Sends a verification code to user email for password reset
   * @returns ForgotPasswordResponse Password reset code sent
   * @throws ApiError
   */
  public postV1AuthForgotPassword({
    requestBody,
  }: {
    requestBody?: ForgotPasswordRequest,
  }): CancelablePromise<ForgotPasswordResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/forgot-password',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        429: `Too Many Requests`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Reset password with code
   * Verifies reset code and sets new password
   * @returns ResetPasswordResponse Password reset successful
   * @throws ApiError
   */
  public postV1AuthResetPassword({
    requestBody,
  }: {
    requestBody?: ResetPasswordRequest,
  }): CancelablePromise<ResetPasswordResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/reset-password',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        404: `Not Found`,
        429: `Too Many Requests`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Change password (authenticated)
   * Allows authenticated users to change their password
   * @returns ChangePasswordResponse Password changed successfully
   * @throws ApiError
   */
  public postV1AuthChangePassword({
    requestBody,
  }: {
    requestBody?: ChangePasswordRequest,
  }): CancelablePromise<ChangePasswordResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/auth/change-password',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        403: `Forbidden - Insufficient permissions`,
        429: `Too Many Requests`,
        500: `Internal Server Error`,
      },
    });
  }
}
