/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AuthenticationService } from './services/AuthenticationService';
import { BooksService } from './services/BooksService';
import { BooksChaptersService } from './services/BooksChaptersService';
import { BooksCollaboratorsService } from './services/BooksCollaboratorsService';
import { BooksPublishingService } from './services/BooksPublishingService';
import { BooksWorkspaceService } from './services/BooksWorkspaceService';
import { DocumentsService } from './services/DocumentsService';
import { DocumentsMultipartService } from './services/DocumentsMultipartService';
import { TemplatesService } from './services/TemplatesService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
  public readonly authentication: AuthenticationService;
  public readonly books: BooksService;
  public readonly booksChapters: BooksChaptersService;
  public readonly booksCollaborators: BooksCollaboratorsService;
  public readonly booksPublishing: BooksPublishingService;
  public readonly booksWorkspace: BooksWorkspaceService;
  public readonly documents: DocumentsService;
  public readonly documentsMultipart: DocumentsMultipartService;
  public readonly templates: TemplatesService;
  public readonly request: BaseHttpRequest;
  constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'https://api-dev.aiplatform.com',
      VERSION: config?.VERSION ?? '1.0.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.authentication = new AuthenticationService(this.request);
    this.books = new BooksService(this.request);
    this.booksChapters = new BooksChaptersService(this.request);
    this.booksCollaborators = new BooksCollaboratorsService(this.request);
    this.booksPublishing = new BooksPublishingService(this.request);
    this.booksWorkspace = new BooksWorkspaceService(this.request);
    this.documents = new DocumentsService(this.request);
    this.documentsMultipart = new DocumentsMultipartService(this.request);
    this.templates = new TemplatesService(this.request);
  }
}

