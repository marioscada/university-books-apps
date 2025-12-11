/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivateTemplateResponse } from '../models/ActivateTemplateResponse';
import type { CloneTemplateRequest } from '../models/CloneTemplateRequest';
import type { CloneTemplateResponse } from '../models/CloneTemplateResponse';
import type { CreateTemplateRequest } from '../models/CreateTemplateRequest';
import type { CreateTemplateResponse } from '../models/CreateTemplateResponse';
import type { DeactivateTemplateResponse } from '../models/DeactivateTemplateResponse';
import type { DeleteTemplateResponse } from '../models/DeleteTemplateResponse';
import type { ListTemplatesResponse } from '../models/ListTemplatesResponse';
import type { RetireTemplateResponse } from '../models/RetireTemplateResponse';
import type { UpdateTemplateRequest } from '../models/UpdateTemplateRequest';
import type { UpdateTemplateResponse } from '../models/UpdateTemplateResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TemplatesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Create evaluation template
   * Create a new AI evaluation template with prompts and rubric configuration
   * @returns CreateTemplateResponse Template created successfully
   * @throws ApiError
   */
  public postV1Templates({
    requestBody,
  }: {
    requestBody?: CreateTemplateRequest,
  }): CancelablePromise<CreateTemplateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/templates',
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
   * List evaluation templates
   * Retrieve all templates with pagination. Filter by status (active/inactive/retired).
   * @returns ListTemplatesResponse Templates list retrieved
   * @throws ApiError
   */
  public getV1Templates(): CancelablePromise<ListTemplatesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/templates',
      errors: {
        401: `Unauthorized - Invalid or expired token`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Get template details
   * Retrieve complete metadata and configuration for a specific template
   * @returns CreateTemplateResponse Template details retrieved
   * @throws ApiError
   */
  public getV1Templates1({
    templateId,
  }: {
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<CreateTemplateResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/templates/{templateId}',
      path: {
        'templateId': templateId,
      },
      errors: {
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Update template
   * Update template configuration. Creates new version if template is active.
   * @returns UpdateTemplateResponse Template updated successfully
   * @throws ApiError
   */
  public putV1Templates({
    templateId,
    requestBody,
  }: {
    /**
     * Template ID
     */
    templateId: string,
    requestBody?: UpdateTemplateRequest,
  }): CancelablePromise<UpdateTemplateResponse> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/v1/templates/{templateId}',
      path: {
        'templateId': templateId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Delete template
   * Soft delete template. Only inactive templates can be deleted.
   * @returns DeleteTemplateResponse Template deleted successfully
   * @throws ApiError
   */
  public deleteV1Templates({
    templateId,
  }: {
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<DeleteTemplateResponse> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/v1/templates/{templateId}',
      path: {
        'templateId': templateId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Activate template
   * Make template available for use in evaluations
   * @returns ActivateTemplateResponse Template activated successfully
   * @throws ApiError
   */
  public postV1TemplatesActivate({
    templateId,
  }: {
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<ActivateTemplateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/templates/{templateId}/activate',
      path: {
        'templateId': templateId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Deactivate template
   * Disable template from being used in new evaluations
   * @returns DeactivateTemplateResponse Template deactivated successfully
   * @throws ApiError
   */
  public postV1TemplatesDeactivate({
    templateId,
  }: {
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<DeactivateTemplateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/templates/{templateId}/deactivate',
      path: {
        'templateId': templateId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Clone template
   * Create a copy of an existing template with a new name
   * @returns CloneTemplateResponse Template cloned successfully
   * @throws ApiError
   */
  public postV1TemplatesClone({
    templateId,
    requestBody,
  }: {
    /**
     * Template ID
     */
    templateId: string,
    requestBody?: CloneTemplateRequest,
  }): CancelablePromise<CloneTemplateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/templates/{templateId}/clone',
      path: {
        'templateId': templateId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Retire template
   * Mark template as retired. Retired templates cannot be reactivated.
   * @returns RetireTemplateResponse Template retired successfully
   * @throws ApiError
   */
  public postV1TemplatesRetire({
    templateId,
  }: {
    /**
     * Template ID
     */
    templateId: string,
  }): CancelablePromise<RetireTemplateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/templates/{templateId}/retire',
      path: {
        'templateId': templateId,
      },
      errors: {
        400: `Bad Request - Invalid input`,
        401: `Unauthorized - Invalid or expired token`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }
}
