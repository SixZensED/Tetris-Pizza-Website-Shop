export interface AuditLog {
  log_id: number;
  timestamp: string;
  user_id: number | null;
  username: string | null;
  action_type: string;
  details: string;
  ip_address: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalLogs: number;
}
