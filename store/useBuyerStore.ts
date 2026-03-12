import { create } from 'zustand';
import { Buyer } from '../types';
import { api } from '../services/api';

interface BuyerState {
  buyers: Buyer[];
  isLoading: boolean;
  setBuyers: (buyers: Buyer[]) => void;
  fetchBuyers: () => Promise<void>;
  addBuyer: (buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBuyer: (id: string, updates: Partial<Buyer>) => Promise<void>;
  deleteBuyer: (id: string) => Promise<void>;
}

export const useBuyerStore = create<BuyerState>((set, get) => ({
  buyers: [],
  isLoading: false,
  setBuyers: (buyers) => set({ buyers }),
  fetchBuyers: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Buyers');
      set({ buyers: data });
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addBuyer: async (buyer) => {
    try {
      const newBuyer = await api.save(buyer, 'Buyers');
      if (newBuyer) {
        set((state) => ({ buyers: [newBuyer, ...state.buyers] }));
      }
    } catch (error) {
      console.error('Error adding buyer:', error);
    }
  },
  updateBuyer: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Buyers');
      if (success) {
        set((state) => ({
          buyers: state.buyers.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      }
    } catch (error) {
      console.error('Error updating buyer:', error);
    }
  },
  deleteBuyer: async (id) => {
    try {
      const success = await api.delete(id, 'Buyers');
      if (success) {
        set((state) => ({
          buyers: state.buyers.filter((b) => b.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting buyer:', error);
    }
  },
}));
