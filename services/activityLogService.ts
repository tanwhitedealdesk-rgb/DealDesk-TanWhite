import { supabase } from './api';
import { ActivityLog, User } from '../types';

export const activityLogService = {
    /**
     * Log a new activity, with grouping for rapid consecutive updates
     */
    logActivity: async (
        user: User | null,
        actionType: string,
        entityType: string,
        entityId: string,
        description: string,
        metadata: any = {},
        entityDisplay?: string
    ) => {
        if (!user) return;

        // Grouping logic for UPDATE actions
        if (actionType === 'UPDATE') {
            // Check if there's a recent UPDATE log for this user and entity within the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const { data: recentLogs, error: fetchError } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('action_type', 'UPDATE')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .gte('created_at', fiveMinutesAgo)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!fetchError && recentLogs && recentLogs.length > 0) {
                const recentLog = recentLogs[0];
                
                // Merge metadata
                const mergedMetadata = {
                    ...recentLog.metadata,
                    ...metadata
                };

                // Generate a new description based on merged metadata fields
                const changedFields = Object.keys(mergedMetadata);
                let newDescription = description;
                if (changedFields.length > 0) {
                    const fieldsText = changedFields.join(', ');
                    newDescription = `Updated ${fieldsText} on ${entityDisplay || entityType}`;
                }

                // Update the existing log instead of creating a new one
                const { error: updateError } = await supabase
                    .from('activity_logs')
                    .update({
                        description: newDescription,
                        metadata: mergedMetadata,
                        created_at: new Date().toISOString() // refresh the timestamp
                    })
                    .eq('id', recentLog.id);

                if (!updateError) return; // Successfully grouped
            }
        }

        const logEntry = {
            user_id: user.id,
            user_name: user.name,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            entity_display: entityDisplay || '',
            description: description,
            metadata: metadata,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('activity_logs').insert(logEntry);
        
        if (error) {
            console.error('Error logging activity:', error);
        }
    },

    /**
     * Get recent activities
     */
    getRecentActivity: async (limit: number = 20): Promise<ActivityLog[]> => {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }

        return data as ActivityLog[];
    }
};
