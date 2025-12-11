/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookCategory } from './BookCategory';
import type { BookFileFormat } from './BookFileFormat';
export type BookListItem = {
  bookId: string;
  title: string;
  author: string;
  descriptionShort: string;
  coverImageUrl: string;
  category: BookCategory;
  publishedDate: string;
  pages: number;
  rating: number;
  downloadCount: number;
  fileFormat: BookFileFormat;
  fileSize: number;
};

