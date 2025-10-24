
// Unified log type that includes all possible fields from both interfaces
export interface Log {
  // Common fields
  _id: string | number;
  timestamp: string;
  
  // Fields from Log interface
  userId?: string | number | null;
  action?: string;
  details: string | Record<string, unknown> | null;
  service?: string;
  ipAddress?: string;
  level?: string;
  metadata?: {
    userName?: string;
    userEmail?: string;
    [key: string]: unknown;
  };
  
  // Fields from AuditLog interface
  log_id?: number;
  user_id?: number | null;
  username?: string | null;
  action_type?: string;
  ip_address?: string;
  
  // Allow any other properties
  [key: string]: unknown;
}
