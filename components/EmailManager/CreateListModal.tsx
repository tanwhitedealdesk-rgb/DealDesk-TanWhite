
import React, { useState } from 'react';
import { X, Save, PlusCircle, Filter, Database, Tag, ShieldCheck, UserCheck, Star, Users, Loader2 } from 'lucide-react';
import { Buyer, Agent, EmailList } from '../../types';
import { generateId, getLogTimestamp } from '../../services/utils';

interface CreateListModalProps {
    onClose: () => void;
    buyers: Buyer[];
    agents: Agent[];
    onSave: (list: EmailList) => Promise<void>;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose, buyers, agents, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        source: 'buyer' as 'buyer' | 'agent',
        type: 'list' as 'list' | 'segment',
        segmentRule: 'all'
    });
    const [isSaving, setIsSaving] = useState(false);

    const buyerRules = [
        { id: 'all', label: 'All Buyers', icon: <Users size={14}/> },
        { id: 'new_lead', label: 'New Leads Only', icon: <Tag size={14}/> },
        { id: 'vetted', label: 'Vetted Buyers Only', icon: <ShieldCheck size={14}/> },
        { id: 'vip', label: 'VIP Buyers Only', icon: <Star size={14}/> },
        { id: 'repeat', label: 'Repeat Buyers Only', icon: <UserCheck size={14}/> }
    ];

    const agentRules = [
        { id: 'all', label: 'All Agents', icon: <Users size={14}/> },
        { id: 'contacted', label: 'Contacted Only', icon: <Tag size={14}/> },
        { id: 'investor_friendly', label: 'Investor Friendly Only', icon: <ShieldCheck size={14}/> },
        { id: 'closed', label: 'Closed Deals Only', icon: <Star size={14}/> }
    ];

    const rules = formData.source === 'buyer' ? buyerRules : agentRules;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;
        setIsSaving(true);
        
        try {
            const newList: EmailList = {
                id: generateId(),
                name: formData.name,
                source: formData.source,
                type: formData.type,
                segmentRule: formData.segmentRule,
                createdAt: new Date().toISOString()
            };
            
            await onSave(newList);
            onClose();
        } catch (error) {
            console.error("Failed to create list", error);
            alert("Failed to create list. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-gray-900/20">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                            <PlusCircle size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create New List</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">List Name</label>
                            <input 
                                required
                                autoFocus
                                placeholder="e.g. Hot Metro ATL Buyers"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">Source Database</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.source}
                                    onChange={e => setFormData({...formData, source: e.target.value as any})}
                                    disabled={isSaving}
                                >
                                    <option value="buyer">Buyer Database</option>
                                    <option value="agent">Agent Database</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">List Type</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    disabled={isSaving}
                                >
                                    <option value="list">Static List</option>
                                    <option value="segment">Dynamic Segment</option>
                                </select>
                            </div>
                        </div>

                        {formData.type === 'segment' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-2 block">Segment Filter Rule</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {rules.map(rule => (
                                        <button
                                            key={rule.id}
                                            type="button"
                                            onClick={() => setFormData({...formData, segmentRule: rule.id})}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium ${
                                                formData.segmentRule === rule.id
                                                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-inner'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            <div className={`${formData.segmentRule === rule.id ? 'text-blue-400' : 'text-gray-600'}`}>
                                                {rule.icon}
                                            </div>
                                            {rule.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
                        <Filter size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] text-blue-200/80 leading-relaxed font-bold">
                                {formData.type === 'segment' ? 'Live Syncing Enabled' : 'Static Population'}
                            </p>
                            <p className="text-[10px] text-blue-200/40 leading-relaxed">
                                {formData.type === 'segment' 
                                    ? 'Subscribers will be added automatically as they meet these criteria in the database.' 
                                    : 'Subscribers are manually added and will not change based on database updates. (Empty by default)'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-sm"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving || !formData.name}
                            className="flex-1 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white font-black text-sm shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save List
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};