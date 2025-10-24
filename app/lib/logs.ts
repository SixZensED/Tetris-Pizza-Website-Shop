import { Log } from "@/app/types/logs";

export interface LogsPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface LogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface LogsApiResponse {
  logs: Log[];
  pagination: LogsPagination;
  availableActions?: string[];
}

function buildQueryString(params: LogsQueryParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const stringValue = typeof value === "string" ? value.trim() : String(value);

    if (stringValue.length === 0) {
      return;
    }

    query.append(key, stringValue);
  });

  const queryString = query.toString();
  return queryString.length ? `?${queryString}` : "";
}

export async function getLogs(
  params: LogsQueryParams,
  token: string,
  init?: RequestInit,
): Promise<LogsApiResponse> {
  if (!token) {
    throw new Error("Admin token is missing. Please sign in again.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const endpoint = `${baseUrl}/api/logs${buildQueryString(params)}`;

  const response = await fetch(endpoint, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load logs (${response.status} ${response.statusText}).`,
    );
  }

  const payload = await response.json();

  const logs: Log[] = Array.isArray(payload.logs)
    ? payload.logs
    : Array.isArray(payload.data)
      ? payload.data
      : [];

  const pagination: LogsPagination =
    payload.pagination ??
    payload.meta ?? {
      total: logs.length,
      page: params.page ?? 1,
      limit: params.limit ?? logs.length ?? 0,
      pages: logs.length ? 1 : 0,
    };

  const availableActions: string[] | undefined =
    Array.isArray(payload.availableActions) && payload.availableActions.length
      ? payload.availableActions
      : undefined;

  return {
    logs,
    pagination,
    availableActions,
  };
}
