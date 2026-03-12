import { create } from 'zustand';
import { Wholesaler } from '../types';
import { api } from '../services/api';

interface WholesalerState {
  wholesalers: Wholesaler[];
  isLoading: boolean;
  setWholesalers: (wholesalers: Wholesaler[]) => void;
  fetchWholesalers: () => Promise<void>;
  addWholesaler: (wholesaler: Omit<Wholesaler, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWholesaler: (id: string, updates: Partial<Wholesaler>) => Promise<void>;
  deleteWholesaler: (id: string) => Promise<void>;
}

export const useWholesalerStore = create<WholesalerState>((set, get) => ({
  wholesalers: [],
  isLoading: false,
  setWholesalers: (wholesalers) => set({ wholesalers }),
  fetchWholesalers: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Wholesalers');
      set({ wholesalers: data });
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addWholesaler: async (wholesaler) => {
    try {
      const newWholesaler = await api.save(wholesaler, 'Wholesalers');
      if (newWholesaler) {
        set((state) => ({ wholesalers: [newWholesaler, ...state.wholesalers] }));
      }
    } catch (error) {
      console.error('Error adding wholesaler:', error);
    }
  },
  updateWholesaler: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Wholesalers');
      if (success) {
        set((state) => ({
          wholesalers: state.wholesalers.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      }
    } catch (error) {
      console.error('Error updating wholesaler:', error);
    }
  },
  deleteWholesaler: async (id) => {
    try {
      const success = await api.delete(id, 'Wholesalers');
      if (success) {
        set((state) => ({
          wholesalers: state.wholesalers.filter((w) => w.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting wholesaler:', error);
    }
  },
}));
