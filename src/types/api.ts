/**
 * Standard error response matching the Spring Boot default error format.
 * Source: Spring Boot DefaultErrorAttributes
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

/**
 * Paginated response matching Spring Boot's Page<T> structure.
 * Source: org.springframework.data.domain.Page
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
