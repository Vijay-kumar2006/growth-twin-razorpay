"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalAuditLogger = exports.AuditLogger = void 0;
class AuditLogger {
    constructor() {
        this.events = [];
    }
    log(type, details) {
        const event = {
            id: `evt_${Math.random().toString(36).substring(7)}`,
            timestamp: new Date().toISOString(),
            type,
            details,
        };
        this.events.push(event);
        console.log(`[AUDIT] ${type}`, JSON.stringify(details));
    }
    getEvents() {
        return [...this.events];
    }
}
exports.AuditLogger = AuditLogger;
exports.globalAuditLogger = new AuditLogger();
//# sourceMappingURL=audit-logger.js.map