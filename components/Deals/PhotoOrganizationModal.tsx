import React, { useState } from 'react';
import { X, GripVertical, CheckCircle, Trash2, MapPin, Star, RefreshCw } from 'lucide-react';
import { Deal } from '../../types';
import { processPhotoUrl } from '../../services/utils';

interface PhotoOrganizationModalProps {
    deal: Deal;
    onSave: (photos: string[], excludeStreetView: boolean) => void;
    onClose: () => void;
}

// Helper to create stable IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const PhotoOrganizationModal: React.FC<PhotoOrganizationModalProps> = ({ deal, onSave, onClose }) => {
    // Wrap URLs in objects with stable IDs to prevent React from destroying DOM nodes during drag
    const [photoItems, setPhotoItems] = useState<{ id: string, url: string }[]>(
        (deal.photos || []).map(url => ({ id: generateId(), url }))
    );
    const [excludeStreetView, setExcludeStreetView] = useState(!!deal.excludeStreetView);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...photoItems];
        const item = newItems.splice(draggedIndex, 1)[0];
        newItems.splice(index, 0, item);
        
        setPhotoItems(newItems);
        setDraggedIndex(index);
    };

    const handleSetMain = (index: number) => {
        const newItems = [...photoItems];
        const item = newItems.splice(index, 1)[0];
        newItems.unshift(item);
        setPhotoItems(newItems);
    };

    const handleReverse = () => {
        setPhotoItems(prev => [...prev].reverse());
    };

    const handleRemove = (index: number) => {
        setPhotoItems(photoItems.filter((_, i) => i !== index));
    };

    const handleApply = () => {
        // Map back to simple string array for saving
        onSave(photoItems.map(item => item.url), excludeStreetView);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[120] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Organize Property Photos</h3>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Drag and drop to reorder. The first photo will be the main thumbnail.</p>
                            <button 
                                onClick={handleReverse}
                                className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
                                title="Reverse photo order"
                            >
                                <RefreshCw size={12} /> Reverse Order
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Google Street View</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Automatically display current street view as the main image.</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setExcludeStreetView(!excludeStreetView)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                !excludeStreetView 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            {!excludeStreetView ? 'Enabled' : 'Removed'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {photoItems.map((item, idx) => (
                            <div 
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={() => setDraggedIndex(null)}
                                className={`relative aspect-square rounded-xl border-2 transition-all cursor-move group overflow-hidden ${
                                    idx === 0 ? 'border-blue-500 shadow-lg scale-105 z-10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                } ${draggedIndex === idx ? 'opacity-0' : 'opacity-100'}`}
                            >
                                <img 
                                    src={processPhotoUrl(item.url)} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer" 
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/400x300/1f2937/6b7280?text=Image+Unavailable";
                                    }}
                                />
                                
                                {idx === 0 && (
                                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                        <Star size={10} fill="white" /> MAIN
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                        <GripVertical size={24} className="text-white" />
                                    </div>
                                    <div className="flex gap-2 px-2 w-full">
                                        {idx !== 0 && (
                                            <button 
                                                onClick={() => handleSetMain(idx)}
                                                className="flex-1 bg-white hover:bg-blue-50 text-blue-600 px-2 py-1.5 rounded text-[10px] font-bold transition-colors"
                                            >
                                                Make Main
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleRemove(idx)}
                                            className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {photoItems.length === 0 && !excludeStreetView && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                             <p className="text-gray-500 dark:text-gray-400 text-sm">No manual photos added. Only Street View is visible.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium">Cancel</button>
                    <button 
                        onClick={handleApply}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};