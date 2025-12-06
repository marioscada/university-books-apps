/**
 * Document Domain Model
 *
 * Represents a document in the application domain.
 * Contains business logic, validation, and computed properties.
 *
 * Difference from API types:
 * - DocumentMetadata (generated): Raw API response
 * - Document (this class): Business model with logic
 */

import type { DocumentMetadata, DocumentStatus } from '@university-books/backend-api-client';

export class Document {
  constructor(
    public readonly id: string,
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly fileSize: number,
    public readonly status: DocumentStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tenantId: string,
    public readonly userId: string
  ) {}

  /**
   * Create Document from API DocumentMetadata
   */
  static fromApiMetadata(metadata: DocumentMetadata): Document {
    return new Document(
      metadata.documentId,
      metadata.fileName,
      metadata.fileType,
      metadata.fileSize,
      metadata.status,
      new Date(metadata.createdAt),
      new Date(metadata.updatedAt),
      metadata.tenantId,
      metadata.userId
    );
  }

  /**
   * Check if document is uploaded
   */
  get isUploaded(): boolean {
    return this.status === 'UPLOADED';
  }

  /**
   * Check if document is processing
   */
  get isProcessing(): boolean {
    return this.status === 'PROCESSING';
  }

  /**
   * Check if document failed
   */
  get isFailed(): boolean {
    return this.status === 'FAILED';
  }

  /**
   * Get human-readable file size
   */
  get fileSizeFormatted(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get file extension
   */
  get fileExtension(): string {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if file is PDF
   */
  get isPdf(): boolean {
    return this.fileType === 'application/pdf' || this.fileExtension === 'pdf';
  }

  /**
   * Check if file is image
   */
  get isImage(): boolean {
    return this.fileType.startsWith('image/');
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  get createdAtRelative(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return this.createdAt.toLocaleDateString();
  }

  /**
   * Serialize to API format
   */
  toApiMetadata(): DocumentMetadata {
    return {
      documentId: this.id,
      fileName: this.fileName,
      fileType: this.fileType,
      fileSize: this.fileSize,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tenantId: this.tenantId,
      userId: this.userId,
    };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      fileName: this.fileName,
      fileType: this.fileType,
      fileSize: this.fileSize,
      fileSizeFormatted: this.fileSizeFormatted,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tenantId: this.tenantId,
      userId: this.userId,
    };
  }
}
