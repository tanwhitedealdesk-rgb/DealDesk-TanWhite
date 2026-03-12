import React, { useState } from 'react';
import { Search, Filter, Map, Grid, List, Heart, CheckSquare, Plus } from 'lucide-react';
import { mockDealFinderProperties } from '../../services/mockData';
import { DealFinderProperty } from '../../types';
import { formatCurrency } from '../../services/utils';

export const MarketScanner: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<DealFinderProperty[]>(mockDealFinderProperties);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Scanner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Search nationwide properties and identify investment opportunities</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            <Plus size={16} /> New Search
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden md:block">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Filter size={16} /> Find Properties
          </h3>
          <div className="text-sm text-gray-500 mb-4">{properties.length.toLocaleString()} properties matching your filters</div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search city, street, or ZIP" 
                  className="w-full pl-8 pr-2 py-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quick Strategy Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700">Wholesaling</button>
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700">Fix & Flip</button>
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700">Buy & Hold</button>
                <button className="p-2 border border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs">Custom</button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition">
                Find Properties
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Properties</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckSquare size={16} /> Select All
              </div>
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-1">
                <button 
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={14} /> Grid
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${viewMode === 'map' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setViewMode('map')}
                >
                  <Map size={14} /> Map
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map(prop => (
              <div key={prop.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="relative h-48">
                  <img src={prop.imageUrl} alt={prop.address} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button className="p-1.5 bg-white/80 backdrop-blur rounded-full text-gray-700 hover:text-red-500 transition">
                      <Heart size={16} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Score: {Math.floor(Math.random() * 30) + 70}/100
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate" title={prop.address}>{prop.address}</h3>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(prop.listPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{prop.city}, {prop.state} {prop.zip}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div><span className="block font-semibold text-gray-900 dark:text-white">{prop.beds}</span> Beds</div>
                    <div><span className="block font-semibold text-gray-900 dark:text-white">{prop.baths}</span> Baths</div>
                    <div><span className="block font-semibold text-gray-900 dark:text-white">{prop.sqft}</span> Sqft</div>
                  </div>

                  <div className="flex justify-between text-xs mb-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block">Cash Flow</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">${prop.cashFlow}/mo</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 dark:text-gray-400 block">Cap Rate</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{prop.capRate}%</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded font-medium text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
