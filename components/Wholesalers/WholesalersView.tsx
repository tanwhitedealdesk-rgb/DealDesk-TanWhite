import React from 'react';
import { Briefcase } from 'lucide-react';
import { Wholesaler, FilterConfig } from '../../types';
import { PageNavBar } from '../Shared/PageNavBar';
import { WholesalerCard } from '../Wholesalers/WholesalerCard';
import { WHOLESALER_STATUS_TABS } from '../../constants';

interface WholesalersViewProps {
    wholesalers: Wholesaler[];
    wholesalerSearch: string;
    setWholesalerSearch: (val: string) => void;
    wholesalerStage: string;
    setWholesalerStage: (val: string) => void;
    wholesalerSort: string;
    setWholesalerSort: (val: string) => void;
    showFilterMenu: boolean;
    setShowFilterMenu: (val: boolean) => void;
    filterConfig: FilterConfig;
    setFilterConfig: (val: FilterConfig) => void;
    filteredWholesalersBySearch: Wholesaler[];
    sortedWholesalers: Wholesaler[];
    handleAddWholesaler: () => void;
    setEditingWholesaler: (wholesaler: Wholesaler) => void;
    setShowAddWholesalerModal: (val: boolean) => void;
    handleDeleteWholesaler: (id: string) => void;
}

export const WholesalersView: React.FC<WholesalersViewProps> = ({
    wholesalers, wholesalerSearch, setWholesalerSearch, wholesalerStage, setWholesalerStage,
    wholesalerSort, setWholesalerSort, showFilterMenu, setShowFilterMenu, filterConfig,
    setFilterConfig, filteredWholesalersBySearch, sortedWholesalers, handleAddWholesaler,
    setEditingWholesaler, setShowAddWholesalerModal, handleDeleteWholesaler
}) => {
    return (
        <div className="w-full">
            <PageNavBar 
                title="Wholesaler Database" 
                icon={<Briefcase/>} 
                searchValue={wholesalerSearch} 
                onSearchChange={setWholesalerSearch} 
                searchPlaceholder="Search wholesalers..." 
                tabs={WHOLESALER_STATUS_TABS.map(tab => ({ 
                    ...tab, 
                    count: tab.id === 'All Wholesalers' ? filteredWholesalersBySearch.length : filteredWholesalersBySearch.filter(w => w.status === tab.id).length 
                }))} 
                activeTab={wholesalerStage} 
                onTabChange={setWholesalerStage} 
                onToggleFilter={() => setShowFilterMenu(!showFilterMenu)} 
                isFilterOpen={showFilterMenu} 
                isFilterActive={filterConfig.type !== 'All'} 
                filterContent={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Wholesaler Type</label>
                            <select className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2" onChange={e => { if (e.target.value) setFilterConfig({type: 'Wholesaler Type', value: e.target.value}); else setFilterConfig({type: 'All', value: ''}); }} value={filterConfig.type === 'Wholesaler Type' ? filterConfig.value : ''}>
                                <option value="">All Types</option>
                                <option value="Acquisitions">Acquisitions</option>
                                <option value="Dispositions">Dispositions</option>
                                <option value="Acq & Dispo">Acq & Dispo</option>
                            </select>
                        </div>
                        <div className="col-span-full flex justify-end">
                            <button onClick={() => setFilterConfig({ type: 'All', value: '' })} className="text-sm text-red-500 hover:underline">Clear Filters</button>
                        </div>
                    </div>
                } 
                sortOptions={[
                    { value: 'A-Z', label: 'A to Z' }, 
                    { value: 'Z-A', label: 'Z to A' }, 
                    { value: 'Last Contacted', label: 'Last Contacted' }, 
                    { value: 'Next Follow-Up', label: 'Next Follow-Up' }
                ]} 
                sortValue={wholesalerSort} 
                onSortChange={setWholesalerSort} 
                actionLabel="Add Wholesaler" 
                onAction={handleAddWholesaler} 
            />
            <div className="max-w-full mx-auto p-4 md:p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedWholesalers.length > 0 ? sortedWholesalers.map(wholesaler => (
                        <WholesalerCard 
                            key={wholesaler.id} 
                            wholesaler={wholesaler} 
                            onEdit={(w) => { setEditingWholesaler(w); setShowAddWholesalerModal(true); }} 
                            onDelete={handleDeleteWholesaler} 
                        />
                    )) : (
                        <div className="col-span-full text-center text-gray-500 py-10 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-800/20">No wholesalers found matching your criteria.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
