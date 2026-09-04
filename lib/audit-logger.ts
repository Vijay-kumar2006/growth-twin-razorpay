export type AuditEventType = 
  | 'INTENT_RECEIVED'
  | 'POLICY_CHECK'
  | 'QUOTE_CREATED'
  | 'APPROVAL_GRANTED'
  | 'PAYMENT_ATTEMPT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'RETRY_ATTEMPT';

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: AuditEventType;
  details: Record<string, any>;
}

export class AuditLogger {
  private events: AuditEvent[] = [];

  log(type: AuditEventType, details: Record<string, any>) {
    const event: AuditEvent = {
      id: `evt_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      type,
      details,
    };
    this.events.push(event);
    console.log(`[AUDIT] ${type}`, JSON.stringify(details));
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }
}

export const globalAuditLogger = new AuditLogger();
