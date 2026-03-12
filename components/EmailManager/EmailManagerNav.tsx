import React from 'react';
import { LayoutDashboard, Users, Mail, BarChart3, Plus, Image as ImageIcon, FileCode, List, Settings } from 'lucide-react';

interface EmailManagerNavProps {
    activeTab: string;
    activeSubTab: string;
    onTabChange: (tab: string) => void;
    onSubTabChange: (subTab: string) => void;
    isEditing?: boolean;
}

export const EmailManagerNav: React.FC<EmailManagerNavProps> = ({
    activeTab,
    activeSubTab,
    onTabChange,
    onSubTabChange,
    isEditing
}) => {
    const mainTabs = [
        { id: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'Lists', icon: <Users size={18} /> },
        { id: 'Campaigns', icon: <Mail size={18} /> },
        { id: 'Media', icon: <ImageIcon size={18} /> },
        { id: 'Templates', icon: <FileCode size={18} /> },
        { id: 'Analytics', icon: <BarChart3 size={18} /> }
    ];

    const baseCampaignTabs = [
        { id: 'All campaigns', icon: <List size={14} /> },
        { id: 'Create new', icon: <Plus size={14} /> }
    ];

    const editingCampaignTabs = [
        { id: 'Campaign Setup', icon: <Settings size={14} /> },
        { id: 'Content', icon: <FileCode size={14} /> }
    ];

    const campaignSubTabs = isEditing 
        ? [...baseCampaignTabs, ...editingCampaignTabs]
        : baseCampaignTabs;

    return (
        <div className="flex flex-col w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 z-20 transition-colors">
            {/* TIER 1: MAIN TABS */}
            <div className="flex items-center px-6 h-14 gap-8">
                {mainTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2.5 h-full px-1 border-b-2 transition-all duration-200 group ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-gray-900 dark:text-white font-bold'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <span className={`${activeTab === tab.id ? 'text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:text-gray-300'}`}>
                            {tab.icon}
                        </span>
                        <span className="text-sm tracking-tight">{tab.id}</span>
                    </button>
                ))}
            </div>

            {/* TIER 2: SUB-NAVIGATION (Campaigns Only) */}
            {activeTab === 'Campaigns' && (
                <div className="flex items-center px-6 h-10 gap-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-1 duration-200">
                    {campaignSubTabs.map((sub) => (
                        <React.Fragment key={sub.id}>
                            {sub.id === 'Campaign Setup' && <div className="h-4 w-px bg-gray-100 dark:bg-gray-700 mx-1"></div>}
                            <button
                                onClick={() => onSubTabChange(sub.id)}
                                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                    activeSubTab === sub.id
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'
                                }`}
                            >
                                {sub.icon}
                                {sub.id}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};