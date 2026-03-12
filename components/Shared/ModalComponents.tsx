
import React from 'react';
import { Save, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// --- MODAL FOOTER ---
interface ModalFooterProps {
    onSave: () => void;
    onClose: () => void;
    saveLabel?: string;
    closeLabel?: string;
    isSaving?: boolean;
    showSaveButton?: boolean;
    onDelete?: () => void;
    children?: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ 
    onSave, onClose, saveLabel = "Save", closeLabel = "Close", isSaving = false, showSaveButton = true, onDelete, children 
}) => {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0 items-center">
            {onDelete && (
                <button 
                    type="button" 
                    onClick={onDelete} 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-6 py-2 rounded font-bold text-sm transition-colors mr-auto md:mr-0"
                >
                    Delete
                </button>
            )}
            
            {/* Render children (like Deactivate button) */}
            {children}

            {showSaveButton && (
                <button 
                    type="button" 
                    onClick={onSave} 
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 rounded font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50"
                    disabled={isSaving}
                >
                    <Save size={18} /> {saveLabel}
                </button>
            )}
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition text-sm font-medium"
            >
                {closeLabel}
            </button>
        </div>
    );
};

// --- NAVIGATION ARROWS ---
interface NavigationArrowsProps {
    onPrev: () => void;
    onNext: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    titlePrev?: string;
    titleNext?: string;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ 
    onPrev, onNext, hasPrev, hasNext, 
    titlePrev = "Previous Record", titleNext = "Next Record" 
}) => {
    return (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={!hasPrev}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-md transition-all z-[130] shadow-lg border border-white/20 hidden md:flex items-center justify-center ${hasPrev ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                title={titlePrev}
            >
                <ChevronLeft size={32} />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={!hasNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-md transition-all z-[130] shadow-lg border border-white/20 hidden md:flex items-center justify-center ${hasNext ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                title={titleNext}
            >
                <ChevronRight size={32} />
            </button>
        </>
    );
};

// --- UNSAVED CHANGES MODAL ---
interface UnsavedChangesModalProps {
    onDiscard: () => void; 
    onSave: () => void;    
    selectedOption?: 'yes' | 'no';
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ onDiscard, onSave, selectedOption = 'yes' }) => {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-yellow-100 dark:bg-yellow-500/20 p-3 rounded-full"><AlertTriangle className="text-yellow-600 dark:text-yellow-500 w-8 h-8" /></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Unsaved Changes</h3>
                    <p className="text-gray-500 dark:text-gray-300">You have not saved your changes. Do you want to save the record before leaving?</p>
                    <div className="flex gap-3 w-full pt-2">
                        <button onClick={onDiscard} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedOption === 'no' ? 'bg-gray-300 dark:bg-gray-600 ring-2 ring-gray-400 dark:ring-gray-500 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Discard</button>
                        <button onClick={onSave} className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${selectedOption === 'yes' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'}`}>Save & Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
