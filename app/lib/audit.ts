export type AuditEvent = {
  event: string;
  proposalId?: string;
  productId?: string;
  details?: Record<string, unknown>;
  timestamp: number;
};

const auditLog: AuditEvent[] = [];

export function recordAuditEvent(
  event: string,
  data: Omit<AuditEvent, "event" | "timestamp"> = {}
) {
  const entry: AuditEvent = {
    event,
    ...data,
    timestamp: Date.now(),
  };

  auditLog.push(entry);

  console.log("AUDIT EVENT:", entry);

  return entry;
}

export function getAuditLog() {
  return [...auditLog];
}