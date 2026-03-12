import React from 'react';
import { ArrowLeft, User, Mail, Calendar, ChevronRight } from 'lucide-react';
import { formatPhoneNumber } from '../../services/utils';

interface SubscriberListViewProps {
    title: string;
    data: any[];
    onBack: () => void;
    onEdit: (contact: any) => void;
}

export const SubscriberListView: React.FC<SubscriberListViewProps> = ({ title, data, onBack, onEdit }) => {
    return (
        <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white rounded-full transition-colors border border-transparent hover:border-gray-200 dark:border-gray-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Managing {data.length} total subscribers</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Subscriber Name</th>
                            <th className="px-6 py-4">Email Address</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Contact</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {data.map((contact) => (
                            <tr 
                                key={contact.id} 
                                onClick={() => onEdit(contact)}
                                className="hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                            <User size={14} />
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{contact.name || contact.companyName || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-200 transition-colors">
                                    {contact.email || '—'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20 uppercase">Active</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {contact.lastContactDate || 'Never'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 dark:text-gray-400 group-hover:text-blue-400 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400 italic">
                                    No subscribers found in this list.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};