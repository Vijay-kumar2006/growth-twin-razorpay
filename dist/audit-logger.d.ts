export type AuditEventType = 'INTENT_RECEIVED' | 'POLICY_CHECK' | 'QUOTE_CREATED' | 'APPROVAL_GRANTED' | 'PAYMENT_ATTEMPT' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'RETRY_ATTEMPT';
export interface AuditEvent {
    id: string;
    timestamp: string;
    type: AuditEventType;
    details: Record<string, any>;
}
export declare class AuditLogger {
    private events;
    log(type: AuditEventType, details: Record<string, any>): void;
    getEvents(): AuditEvent[];
}
export declare const globalAuditLogger: AuditLogger;
//# sourceMappingURL=audit-logger.d.ts.map