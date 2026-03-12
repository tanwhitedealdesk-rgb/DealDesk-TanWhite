import React, { useState } from 'react';
import { X, Save, User, Mail, Loader2, CheckCircle } from 'lucide-react';

interface EditSubscriberModalProps {
    contact: any;
    type: 'buyer' | 'agent';
    onClose: () => void;
    onSave: (updatedContact: any) => Promise<void>;
}

export const EditSubscriberModal: React.FC<EditSubscriberModalProps> = ({ contact, type, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: contact.name || contact.companyName || '',
        email: contact.email || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updated = { ...contact };
            if (type === 'buyer' && contact.companyName) {
                updated.companyName = formData.name;
            } else {
                updated.name = formData.name;
            }
            updated.email = formData.email;
            
            await onSave(updated);
            onClose();
        } catch (error) {
            console.error("Failed to update subscriber", error);
            alert("Update failed. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'buyer' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            <User size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Subscriber</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={16} />
                                <input 
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 pl-10 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={16} />
                                <input 
                                    required
                                    type="email"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 pl-10 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all font-mono"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
                        <CheckCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-200/60 leading-relaxed">
                            Updating these details will immediately synchronize with the main <b>{type === 'buyer' ? 'Buyer' : 'Agent'} Database</b>.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white font-black text-sm shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};