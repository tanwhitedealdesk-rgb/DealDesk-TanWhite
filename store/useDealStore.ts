import { create } from 'zustand';
import { Deal } from '../types';
import { api } from '../services/api';

interface DealState {
  deals: Deal[];
  isLoading: boolean;
  setDeals: (deals: Deal[]) => void;
  fetchDeals: () => Promise<void>;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: [],
  isLoading: false,
  setDeals: (deals) => set({ deals }),
  fetchDeals: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Deals');
      set({ deals: data });
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addDeal: async (deal) => {
    try {
      const newDeal = await api.save(deal, 'Deals');
      if (newDeal) {
        set((state) => ({ deals: [newDeal, ...state.deals] }));
      }
    } catch (error) {
      console.error('Error adding deal:', error);
    }
  },
  updateDeal: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Deals');
      if (success) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  },
  deleteDeal: async (id) => {
    try {
      const success = await api.delete(id, 'Deals');
      if (success) {
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  },
}));
