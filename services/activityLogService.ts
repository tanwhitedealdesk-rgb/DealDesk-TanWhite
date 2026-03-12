import { supabase } from './api';
import { ActivityLog, User } from '../types';

export const activityLogService = {
    /**
     * Log a new activity
     */
    logActivity: async (
        user: User | null,
        actionType: string,
        entityType: string,
        entityId: string,
        description: string,
        metadata: any = {}
    ) => {
        if (!user) return;

        const logEntry = {
            user_id: user.id,
            user_name: user.name,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
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
