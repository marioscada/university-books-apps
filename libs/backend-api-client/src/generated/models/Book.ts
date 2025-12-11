/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookCategory } from './BookCategory';
import type { BookFileFormat } from './BookFileFormat';
import type { BookLanguage } from './BookLanguage';
import type { BookStatus } from './BookStatus';
export type Book = {
  /**
   * Unique book identifier
   */
  bookId: string;
  /**
   * Book title
   */
  title: string;
  /**
   * Book subtitle
   */
  subtitle?: string;
  /**
   * Primary author name
   */
  author: string;
  /**
   * Co-authors list
   */
  coAuthors?: Array<string>;
  /**
   * Short description for list view (max 200 chars)
   */
  descriptionShort: string;
  /**
   * Full description for detail view (max 2000 chars)
   */
  descriptionFull: string;
  category: BookCategory;
  /**
   * Sub-category (e.g., Mystery, History)
   */
  subCategory?: string;
  /**
   * Tags for search and filtering
   */
  tags?: Array<string>;
  /**
   * ISBN-10 or ISBN-13
   */
  isbn?: string;
  /**
   * Publisher name
   */
  publisher?: string;
  /**
   * Publication date (YYYY-MM-DD)
   */
  publishedDate: string;
  /**
   * Edition information
   */
  edition?: string;
  language?: BookLanguage;
  /**
   * Number of pages
   */
  pages: number;
  fileFormat?: BookFileFormat;
  /**
   * File size in bytes
   */
  fileSize: number;
  /**
   * S3 key for PDF file
   */
  fileKey: string;
  /**
   * S3 key for cover image
   */
  coverImageKey: string;
  /**
   * CloudFront URL for cover image
   */
  coverImageUrl: string;
  /**
   * S3 keys for preview page images
   */
  previewPagesKeys?: Array<string>;
  status?: BookStatus;
  /**
   * Whether book is available for download
   */
  isAvailable?: boolean;
  /**
   * Whether book is free (for future monetization)
   */
  isFree?: boolean;
  /**
   * Price in EUR cents (0 = free)
   */
  price?: number;
  /**
   * Total download count
   */
  downloadCount?: number;
  /**
   * Total view count
   */
  viewCount?: number;
  /**
   * Average rating (0-5)
   */
  rating?: number;
  /**
   * Total review count
   */
  reviewCount?: number;
  /**
   * When book was published
   */
  publishedAt?: string;
  /**
   * User who uploaded the book
   */
  uploadedBy: string;
  /**
   * GSI1 partition key (BOOKS#CATEGORY#{category})
   */
  GSI1PK?: string;
  /**
   * GSI1 sort key (createdAt for date sorting)
   */
  GSI1SK?: string;
  /**
   * GSI2 partition key (BOOKS#AUTHOR#{author})
   */
  GSI2PK?: string;
  /**
   * GSI2 sort key (title for alphabetical sorting)
   */
  GSI2SK?: string;
  /**
   * ISO 8601 timestamp
   */
  createdAt: string;
  /**
   * ISO 8601 timestamp
   */
  updatedAt: string;
  /**
   * Tenant identifier
   */
  tenantId: string;
  /**
   * User identifier
   */
  userId: string;
};

