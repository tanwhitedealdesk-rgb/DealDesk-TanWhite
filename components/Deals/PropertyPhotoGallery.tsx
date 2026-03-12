
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Image as ImageIcon, Loader2, X, Plus, Link as LinkIcon, ChevronLeft, ChevronRight, Settings, Copy, Check } from 'lucide-react';
import { Deal } from '../../types';
import { GOOGLE_MAPS_API_KEY, GOOGLE_SCRIPT_URL } from '../../constants';
import { serverFunctions, processPhotoUrl } from '../../services/utils';
import { api } from '../../services/api';
import { PhotoOrganizationModal } from './PhotoOrganizationModal';

interface PropertyPhotoGalleryProps {
    deal: Deal;
    setDeal: React.Dispatch<React.SetStateAction<Deal>>;
    onUpdate?: (id: string, updates: Partial<Deal>) => void;
    triggerSave: () => void;
    setShowSavedNotification: (show: boolean) => void;
    activeGalleryIndex: number | null;
    setActiveGalleryIndex: (index: number | null) => void;
}

export const PropertyPhotoGallery: React.FC<PropertyPhotoGalleryProps> = ({
    deal, setDeal, onUpdate, triggerSave, setShowSavedNotification, activeGalleryIndex, setActiveGalleryIndex
}) => {
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
    const [activeAddUrlIndex, setActiveAddUrlIndex] = useState<number | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [showOrgModal, setShowOrgModal] = useState(false);
    
    // URL Modal State
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [galleryUrl, setGalleryUrl] = useState("");
    const [copied, setCopied] = useState(false);

    // --- SELF-HEALING DATA LOGIC ---
    // This ensures that even if the DB has a "String" instead of an "Array", the app won't crash.
    const safePhotos = useMemo(() => {
        const p = deal.photos as any; // Cast to any to handle potential runtime type mismatches
        if (!p) return [];
        if (Array.isArray(p)) return p; // It's already good (Array)
        
        // If it is a string (Corrupted Data), fix it on the fly
        if (typeof p === 'string') {
            try {
                // Try to parse if it looks like JSON
                if (p.trim().startsWith('[')) return JSON.parse(p);
                // Otherwise assume it's a comma-separated list
                return (p as string).split(',').map(s => s.trim().replace(/['"\[\]]/g, ''));
            } catch (e) {
                console.error("Failed to parse photo string", e);
                return [];
            }
        }
        return [];
    }, [deal.photos]);

    // Track latest photos ref to safely update state during async loops
    const latestPhotosRef = useRef(safePhotos);
    useEffect(() => { latestPhotosRef.current = safePhotos; }, [safePhotos]);

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files: File[] = Array.from(e.target.files) as File[];
            
            // Create blobs for immediate UI feedback
            const previews = files.map(file => ({
                file,
                tempUrl: URL.createObjectURL(file)
            }));

            // Mark these blobs as uploading
            setUploadingFiles(prev => {
                const next = new Set(prev);
                previews.forEach(p => next.add(p.tempUrl));
                return next;
            });

            // Optimistically update UI
            const currentPhotos = [...(latestPhotosRef.current || [])];
            const updatedPhotoList = [...currentPhotos, ...previews.map(p => p.tempUrl)];
            
            // Update local state to show blobs
            setDeal(prev => ({ ...prev, photos: updatedPhotoList }));

            // We'll mutate this array as uploads finish, then save the clean version
            const finalPhotoList = [...updatedPhotoList];
            let hasNewUrls = false;
            let folderIdFound: string | null = null;

            // Sequential upload
            for (const { file, tempUrl } of previews) {
                try {
                    // Upload to Drive
                    const response = await serverFunctions.uploadImage(file as File, deal.address);
                    
                    if (response) {
                        // 1. Handle URL
                        if (response.url) {
                            const idx = finalPhotoList.indexOf(tempUrl);
                            if (idx !== -1) {
                                finalPhotoList[idx] = response.url;
                                hasNewUrls = true;
                                setDeal(prev => ({ ...prev, photos: [...finalPhotoList] }));
                            }
                        }
                        // 2. Handle Folder ID
                        if (response.folderId) {
                            folderIdFound = response.folderId;
                        }
                    }
                } catch (err) {
                    console.error("Upload failed for file", (file as File).name, err);
                } finally {
                    setUploadingFiles(prev => {
                        const next = new Set(prev);
                        next.delete(tempUrl);
                        return next;
                    });
                    URL.revokeObjectURL(tempUrl);
                }
            }
            
            // Final persistence step
            if (hasNewUrls || folderIdFound) {
                const cleanedPhotos = finalPhotoList.filter(p => p && !p.startsWith('blob:'));
                
                const updates: any = { photos: cleanedPhotos };

                // Save Folder ID if found
                if (folderIdFound && deal.picturesFolderId !== folderIdFound) {
                    updates.picturesFolderId = folderIdFound;
                    setDeal(prev => ({ ...prev, picturesFolderId: folderIdFound }));
                }
                
                if (onUpdate) {
                    onUpdate(deal.id, updates);
                } else {
                    setDeal(prev => ({ ...prev, ...updates }));
                    api.save({ ...deal, ...updates }, 'Deals');
                }

                setShowSavedNotification(true);
                setTimeout(() => setShowSavedNotification(false), 1000);
            }
            
            e.target.value = '';
        }
    };

    const handleDeletePhoto = async (index: number) => {
        // USE SAFE PHOTOS HERE
        const photos = [...safePhotos];
        const photoToDelete = photos[index];

        photos.splice(index, 1);
        
        // Immediate persistence
        if (onUpdate) {
            onUpdate(deal.id, { photos });
        } else {
            setDeal(prev => ({ ...prev, photos }));
            api.save({ ...deal, photos }, 'Deals');
        }
        
        setShowSavedNotification(true);
        setTimeout(() => setShowSavedNotification(false), 1000);

        // Delete from Drive logic
        if (photoToDelete && photoToDelete.includes('drive.google.com') && photoToDelete.includes('id=')) {
            try {
                const idMatch = photoToDelete.match(/id=([^&]+)/);
                if (idMatch && idMatch[1]) {
                    const fileId = idMatch[1];
                    fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'deleteImage', fileId }),
                        mode: 'no-cors'
                    }).catch(e => console.error("Drive delete error", e));
                }
            } catch (error) {
                console.error("Error parsing drive ID for deletion:", error);
            }
        }
    };

    const handleAddPhotoUrl = () => {
        if (!urlInput.trim()) return;
        // USE SAFE PHOTOS HERE
        const currentPhotos = safePhotos.filter(p => p && !p.startsWith('blob:'));
        const newPhotos = [...currentPhotos, urlInput.trim()];
        
        if (onUpdate) {
            onUpdate(deal.id, { photos: newPhotos });
        } else {
            setDeal(prev => ({ ...prev, photos: newPhotos }));
            api.save({ ...deal, photos: newPhotos }, 'Deals');
        }
        
        setShowSavedNotification(true);
        setTimeout(() => setShowSavedNotification(false), 1000);
        
        setUrlInput("");
        setActiveAddUrlIndex(null);
    };

    const handleSaveOrganization = (newPhotos: string[], excludeStreetView: boolean) => {
        const cleanedPhotos = newPhotos.filter(p => p && !p.startsWith('blob:'));
        
        if (onUpdate) {
            onUpdate(deal.id, { photos: cleanedPhotos, excludeStreetView });
        } else {
            setDeal(prev => ({ ...prev, photos: cleanedPhotos, excludeStreetView }));
            api.save({ ...deal, photos: cleanedPhotos, excludeStreetView }, 'Deals');
        }
        
        setShowOrgModal(false);
        setShowSavedNotification(true);
        setTimeout(() => setShowSavedNotification(false), 1000);
    };

    const handleDisplayUrl = async () => {
        setShowUrlModal(true);
        setFetchingUrl(true);
        setGalleryUrl("");
        try {
            if (!deal.address) {
                setGalleryUrl("Error: Property address is required.");
                return;
            }
            const res = await serverFunctions.getFolderUrl(deal.address.trim());
            if (res) {
                if (res.url) {
                    setGalleryUrl(res.url);
                } else if (res.error) {
                    setGalleryUrl(`Server Error: ${res.error}`);
                } else {
                    setGalleryUrl("Error: URL not found. Ensure photos have been uploaded.");
                }

                if (res.folderId && deal.picturesFolderId !== res.folderId) {
                    if (onUpdate) onUpdate(deal.id, { picturesFolderId: res.folderId });
                }
            }
        } catch (e: any) {
            setGalleryUrl(`Connection Error: ${e?.message || "Failed to fetch folder URL."}`);
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleCopyUrl = () => {
        if (!galleryUrl || galleryUrl.includes("Error")) return;
        navigator.clipboard.writeText(galleryUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- RENDER HELPERS: USE safePhotos HERE TO PREVENT CRASH ---
    const mainImageUrl = (safePhotos && safePhotos.length > 0) ? processPhotoUrl(safePhotos[0]) : null;
    const streetViewUrl = GOOGLE_MAPS_API_KEY ? `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(deal.address)}&fov=70&key=${GOOGLE_MAPS_API_KEY}` : null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={14}/> Property Photos
                    </h3>
                    <div className="flex items-center gap-1.5 ml-2">
                        <button 
                            type="button" 
                            onClick={() => setShowOrgModal(true)}
                            className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                            <Settings size={10} /> Organize Photos
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDisplayUrl}
                            className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 font-bold"
                        >
                            <LinkIcon size={10} /> Display Photo Gallery URL
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 h-64 sm:h-80 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-1/2 h-full relative group cursor-pointer" onClick={() => setActiveGalleryIndex(0)}>
                    {mainImageUrl ? (
                        <img 
                            src={mainImageUrl} 
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/600x400/1f2937/6b7280?text=Image+Unavailable";
                                e.currentTarget.classList.add('opacity-50');
                            }}
                        />
                    ) : (!deal.excludeStreetView && streetViewUrl) ? (
                        <img 
                            src={streetViewUrl} 
                            alt="Street View" 
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-gray-900 text-gray-300 dark:text-gray-700">
                            <MapPin size={48}/>
                            <span className="text-xs font-bold uppercase">No Imagery Available</span>
                        </div>
                    )}
                    
                    {(!mainImageUrl && !deal.excludeStreetView && streetViewUrl) && (
                        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold flex items-center gap-2 text-gray-900 dark:text-white pointer-events-none">
                            <MapPin size={12}/> Street View
                        </div>
                    )}
                    {mainImageUrl && (
                        <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold flex items-center gap-2 text-white pointer-events-none uppercase tracking-wider">
                            <ImageIcon size={12}/> Main Photo
                        </div>
                    )}
                </div>
                
                <div className="w-1/2 h-full overflow-x-auto overflow-y-hidden p-2 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 custom-scrollbar">
                    <div className="grid grid-rows-2 grid-flow-col gap-2 h-full auto-cols-[calc(50%-0.25rem)] sm:auto-cols-[calc(33.33%-0.35rem)] md:auto-cols-[calc(50%-0.25rem)]">
                        {/* CRITICAL FIX: USE safePhotos.map INSTEAD OF deal.photos.map */}
                        {safePhotos.map((rawPhotoUrl, index) => {
                            const photoUrl = processPhotoUrl(rawPhotoUrl || '');
                            const isThisFileUploading = uploadingFiles.has(rawPhotoUrl);

                            return (
                                <div key={index} className="h-full w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group overflow-hidden rounded-lg">
                                    <img 
                                        src={photoUrl} 
                                        className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${isThisFileUploading ? 'opacity-50 blur-sm' : ''}`}
                                        alt={`Photo ${index + 1}`} 
                                        referrerPolicy="no-referrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isThisFileUploading) return;
                                            setActiveGalleryIndex(index);
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/400x300/1f2937/6b7280?text=Image+Unavailable";
                                            e.currentTarget.classList.add('opacity-50');
                                        }}
                                    />
                                    {isThisFileUploading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                            <Loader2 size={24} className="text-white animate-spin mb-1" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Uploading...</span>
                                        </div>
                                    )}

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(index);
                                        }}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm"
                                        title="Delete Photo"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}

                        <div key="add-new-photo" className="h-full w-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg relative overflow-hidden flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors min-w-[120px]">
                            {activeAddUrlIndex === 999 ? (
                                <div className="w-full h-full flex flex-col p-2 items-center justify-center bg-gray-50 dark:bg-gray-800">
                                    <input 
                                        autoFocus
                                        className="w-full text-xs p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mb-1 focus:outline-none focus:border-blue-500"
                                        placeholder="Paste URL..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddPhotoUrl();
                                                setActiveAddUrlIndex(null);
                                            }
                                            if (e.key === 'Escape') {
                                                setActiveAddUrlIndex(null);
                                                setUrlInput("");
                                            }
                                        }}
                                    />
                                    <div className="flex gap-1 w-full">
                                        <button onClick={handleAddPhotoUrl} className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded hover:bg-blue-50 font-bold">Add</button>
                                        <button onClick={() => { setActiveAddUrlIndex(null); setUrlInput(""); }} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 text-gray-300 text-[10px] py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full relative group">
                                    <label className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors text-gray-400 hover:text-blue-500`}>
                                        <Plus size={24} className="mb-1"/>
                                        <span className="text-[10px] uppercase font-bold text-center px-2">Add Photo</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                                    </label>
                                    <button 
                                        onClick={() => { setActiveAddUrlIndex(999); setUrlInput(""); }}
                                        className="absolute top-1 right-1 p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        title="Add Image via URL"
                                    >
                                        <LinkIcon size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showOrgModal && (
                <PhotoOrganizationModal 
                    deal={deal}
                    onClose={() => setShowOrgModal(false)}
                    onSave={handleSaveOrganization}
                />
            )}

            {showUrlModal && (
                <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowUrlModal(false)}>
                    <div className="bg-[#1a212e] rounded-xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1a212e]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <LinkIcon size={16} className="text-blue-500" /> Photo Gallery URL
                            </h3>
                            <button onClick={() => setShowUrlModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-400 mb-4 font-medium">Copy the Google Drive link to this property's photo folder.</p>
                            <div className="relative">
                                <textarea 
                                    readOnly
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono resize-none focus:outline-none min-h-[80px]"
                                    value={fetchingUrl ? "Loading folder URL..." : galleryUrl}
                                />
                                {fetchingUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                        <Loader2 size={16} className="text-blue-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-[#1a212e] flex justify-end gap-3">
                            <button onClick={() => setShowUrlModal(false)} className="px-5 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-colors">Close</button>
                            <button 
                                onClick={handleCopyUrl}
                                disabled={fetchingUrl || !galleryUrl || galleryUrl.includes("Error")}
                                className={`px-6 py-2 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                                }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy URL'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};