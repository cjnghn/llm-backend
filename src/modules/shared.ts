export interface PaginationParams {
  offset: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
