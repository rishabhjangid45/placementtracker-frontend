---
name: Spring Boot API Integration
description: Automates the creation of TypeScript interfaces and Axios interceptors for Spring Boot backend endpoints. Ensures type-safe API communication with standardized error handling.
---

# Spring Boot API Integration

## Purpose

This skill ensures that every API integration between the React frontend and the Spring Boot (IntelliJ) backend follows a consistent, type-safe pattern. It automates TypeScript interface generation, Axios hook creation, and standardized error handling.

## Activation

This skill activates whenever the agent is asked to:
- Connect to a new backend API endpoint
- Create or modify an API service/hook
- Generate TypeScript types from a backend DTO or entity
- Handle API authentication or error responses
- Set up Axios interceptors or configuration

## Rules

### Axios Configuration

1. **Always** use a centralized Axios instance exported from `@/lib/api.ts`.
2. **Never** import `axios` directly in components or hooks — always use the pre-configured instance.
3. The base Axios instance must include:
   - `baseURL` from environment variable `VITE_API_BASE_URL`
   - Default `Content-Type: application/json` header
   - Request interceptor that attaches the JWT token from `localStorage`
   - Response interceptor that handles `401 Unauthorized` globally

### 401 Unauthorized Handling

**Critical**: Every Axios response interceptor MUST handle `401 Unauthorized` as follows:

```typescript
// In @/lib/api.ts response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Clear ALL auth-related data from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // 2. Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### TypeScript Interface Rules

1. **Always** create a dedicated types file at `@/types/<domain>.ts` for each backend domain (e.g., `@/types/job.ts`, `@/types/auth.ts`).
2. Interface names must match the Spring Boot DTO name exactly (e.g., `JobApplicationDTO` → `JobApplicationDTO`).
3. **Always** map Java types to TypeScript types accurately:

| Java Type              | TypeScript Type       |
|------------------------|-----------------------|
| `String`               | `string`              |
| `Long`, `Integer`      | `number`              |
| `Boolean`              | `boolean`             |
| `LocalDateTime`        | `string` (ISO format) |
| `LocalDate`            | `string` (ISO format) |
| `List<T>`              | `T[]`                 |
| `Map<K, V>`            | `Record<K, V>`        |
| `Optional<T>`          | `T \| null`           |
| `enum`                 | TypeScript `enum` or union type |
| `UUID`                 | `string`              |

4. Always include JSDoc comments on interfaces describing the source DTO.

### API Hook Structure

All API hooks must follow this exact pattern using a custom hook:

```typescript
// @/hooks/use-<domain>.ts

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for [Domain] API operations.
 * Backend source: [ControllerName].java
 */
export function use<Domain>() {
  const [state, setState] = useState<ApiState<DataType>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.get<DataType>("/api/v1/endpoint");
      setState({ data: response.data, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message ?? err.message
          : "An unexpected error occurred";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  return { ...state, fetchData };
}
```

### API File Template (`@/lib/api.ts`)

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Endpoint Naming Convention

- Use RESTful patterns: `GET /api/v1/jobs`, `POST /api/v1/jobs`, `PUT /api/v1/jobs/:id`
- Always prefix with `/api/v1/` to match Spring Boot's versioned API.
- Hook method names must reflect the HTTP verb: `fetchJobs`, `createJob`, `updateJob`, `deleteJob`.

### Error Response Type

Always define a standard error response matching the Spring Boot error format:

```typescript
// @/types/api.ts
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```
