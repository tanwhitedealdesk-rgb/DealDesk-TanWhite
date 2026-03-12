import { create } from 'zustand';
import { Brokerage } from '../types';
import { api } from '../services/api';

interface BrokerageState {
  brokerages: Brokerage[];
  isLoading: boolean;
  setBrokerages: (brokerages: Brokerage[]) => void;
  fetchBrokerages: () => Promise<void>;
  addBrokerage: (brokerage: Omit<Brokerage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBrokerage: (id: string, updates: Partial<Brokerage>) => Promise<void>;
  deleteBrokerage: (id: string) => Promise<void>;
}

export const useBrokerageStore = create<BrokerageState>((set, get) => ({
  brokerages: [],
  isLoading: false,
  setBrokerages: (brokerages) => set({ brokerages }),
  fetchBrokerages: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Brokerages');
      set({ brokerages: data });
    } catch (error) {
      console.error('Error fetching brokerages:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addBrokerage: async (brokerage) => {
    try {
      const newBrokerage = await api.save(brokerage, 'Brokerages');
      if (newBrokerage) {
        set((state) => ({ brokerages: [newBrokerage, ...state.brokerages] }));
      }
    } catch (error) {
      console.error('Error adding brokerage:', error);
    }
  },
  updateBrokerage: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Brokerages');
      if (success) {
        set((state) => ({
          brokerages: state.brokerages.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      }
    } catch (error) {
      console.error('Error updating brokerage:', error);
    }
  },
  deleteBrokerage: async (id) => {
    try {
      const success = await api.delete(id, 'Brokerages');
      if (success) {
        set((state) => ({
          brokerages: state.brokerages.filter((b) => b.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting brokerage:', error);
    }
  },
}));
