
import React from 'react';
import { Loader2, Send } from 'lucide-react';

interface StartCampaignButtonProps {
    onClick: () => void;
    isSending: boolean;
}

export const StartCampaignButton: React.FC<StartCampaignButtonProps> = ({ onClick, isSending }) => {
    return (
        <button 
            type="button"
            onClick={onClick}
            disabled={isSending} 
            className={`bg-blue-600 hover:bg-green-600 active:bg-green-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg text-xs font-black shadow-xl shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            START CAMPAIGN
        </button>
    );
};
