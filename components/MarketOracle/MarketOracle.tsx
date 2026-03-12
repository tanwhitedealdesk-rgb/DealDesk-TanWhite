import React, { useState } from 'react';
import { TrendingUp, Map, BarChart2, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockMarketData } from '../../services/mockData';
import { MarketData } from '../../types';
import { formatCurrency } from '../../services/utils';

export const MarketOracle: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>(mockMarketData);

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Analyzer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time market insights and investment opportunities</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Median Price (National)</div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(412000)}</div>
            <div className="flex items-center text-sm text-red-500 mb-1">
              <ArrowDownRight size={16} /> 1.2%
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">vs. previous month</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Inventory</div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">1.2M</div>
            <div className="flex items-center text-sm text-green-500 mb-1">
              <ArrowUpRight size={16} /> 4.5%
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">active listings</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Days on Market</div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">42</div>
            <div className="flex items-center text-sm text-red-500 mb-1">
              <ArrowUpRight size={16} /> +3 days
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">average days to sell</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
          <div className="text-sm text-green-800 dark:text-green-300 mb-2 font-medium">Market Opportunity</div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">Buyer's Market</div>
          </div>
          <div className="text-xs text-green-600/80 dark:text-green-400/80 mt-2">Based on inventory & price trends</div>
        </div>
      </div>

      {/* Top Cities Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Map size={18} /> Top Cities to Invest In
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">Ranked by investment potential score</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">City, State</th>
                <th className="p-4 font-medium">Median Price</th>
                <th className="p-4 font-medium">Price Growth (1yr)</th>
                <th className="p-4 font-medium">Avg Cap Rate</th>
                <th className="p-4 font-medium">Job Growth</th>
                <th className="p-4 font-medium text-right">Opp Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {marketData.map((data, index) => (
                <tr key={`${data.city}-${data.state}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{data.city}, {data.state}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(data.medianPrice)}</td>
                  <td className="p-4 text-green-600 dark:text-green-400 font-medium">+{data.priceGrowth}%</td>
                  <td className="p-4 text-blue-600 dark:text-blue-400 font-medium">{data.capRate}%</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{data.jobGrowth}%</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center justify-center px-2 py-1 bg-green-500 text-white rounded font-bold text-sm">
                      {data.marketOpportunityScore}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <BarChart2 size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Market Trends Chart</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-xs">Visualizing price vs inventory over the last 12 months.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <TrendingUp size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Seasonal Patterns</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-xs">Sales volume and price levels mapped to seasonal trends.</p>
        </div>
      </div>
    </div>
  );
};
