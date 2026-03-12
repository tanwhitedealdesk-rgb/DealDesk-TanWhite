
/**
 * StartCampaignButtonLog.ts
 * Service to document the execution flow of the Start Campaign button.
 */

export interface LogEntry {
    timestamp: string;
    action: string;
    status: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
    details: string;
}

export const StartCampaignButtonLog = {
    entries: [] as LogEntry[],

    reset: () => {
        StartCampaignButtonLog.entries = [];
        console.log("--- START CAMPAIGN BUTTON LOG RESET ---");
    },

    add: (action: string, status: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING', details: string = '') => {
        const timestamp = new Date().toISOString();
        const entry: LogEntry = { timestamp, action, status, details };
        StartCampaignButtonLog.entries.push(entry);
        
        // Output to console for immediate visibility
        const icon = status === 'SUCCESS' ? '✅' : status === 'ERROR' ? '❌' : status === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`${icon} [${action}]: ${details}`);
    },

    getHistory: () => {
        return StartCampaignButtonLog.entries;
    },

    /**
     * Dumps the log to a formatted string.
     */
    dump: () => {
        return StartCampaignButtonLog.entries.map(e => `[${e.timestamp}] [${e.status}] ${e.action}: ${e.details}`).join('\n');
    }
};
