import { create } from 'zustand';
import { api } from '../services/api';

interface CampaignState {
  campaigns: any[];
  isLoading: boolean;
  setCampaigns: (campaigns: any[]) => void;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: any) => Promise<void>;
  updateCampaign: (id: string, updates: any) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  isLoading: false,
  setCampaigns: (campaigns) => set({ campaigns }),
  fetchCampaigns: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Campaigns');
      set({ campaigns: data });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addCampaign: async (campaign) => {
    try {
      const newCampaign = await api.save(campaign, 'Campaigns');
      if (newCampaign) {
        set((state) => ({ campaigns: [newCampaign, ...state.campaigns] }));
      }
    } catch (error) {
      console.error('Error adding campaign:', error);
    }
  },
  updateCampaign: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Campaigns');
      if (success) {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  },
  deleteCampaign: async (id) => {
    try {
      const success = await api.delete(id, 'Campaigns');
      if (success) {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  },
}));
