/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
export type ForgotPasswordResponse = (MessageResponse & {
  /**
   * Details about where the verification code was sent
   */
  codeDeliveryDetails: {
    /**
     * Masked email/phone where code was sent (e.g., a***@example.com)
     */
    destination: string;
    /**
     * Delivery medium used
     */
    deliveryMedium: 'EMAIL' | 'SMS';
  };
});

