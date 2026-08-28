export type ApiPagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T = unknown> = {
  data?: T;
  message: string;
  method?: string;
  paginate?: ApiPagination;
  path?: string;
  statusCode?: number;
  timestamp?: string;
};
