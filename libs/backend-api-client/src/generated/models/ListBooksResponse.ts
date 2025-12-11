/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AvailableFilters } from './AvailableFilters';
import type { BookListItem } from './BookListItem';
import type { Pagination } from './Pagination';
export type ListBooksResponse = {
  /**
   * List of books
   */
  books: Array<BookListItem>;
  pagination: Pagination;
  filters: AvailableFilters;
};

