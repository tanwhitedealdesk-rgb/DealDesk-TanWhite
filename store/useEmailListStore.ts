import { create } from 'zustand';
import { EmailList } from '../types';
import { api } from '../services/api';

interface EmailListState {
  emailLists: EmailList[];
  isLoading: boolean;
  setEmailLists: (emailLists: EmailList[]) => void;
  fetchEmailLists: () => Promise<void>;
  addEmailList: (emailList: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmailList: (id: string, updates: Partial<EmailList>) => Promise<void>;
  deleteEmailList: (id: string) => Promise<void>;
}

export const useEmailListStore = create<EmailListState>((set, get) => ({
  emailLists: [],
  isLoading: false,
  setEmailLists: (emailLists) => set({ emailLists }),
  fetchEmailLists: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('EmailLists');
      set({ emailLists: data });
    } catch (error) {
      console.error('Error fetching email lists:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addEmailList: async (emailList) => {
    try {
      const newEmailList = await api.save(emailList, 'EmailLists');
      if (newEmailList) {
        set((state) => ({ emailLists: [newEmailList, ...state.emailLists] }));
      }
    } catch (error) {
      console.error('Error adding email list:', error);
    }
  },
  updateEmailList: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'EmailLists');
      if (success) {
        set((state) => ({
          emailLists: state.emailLists.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      }
    } catch (error) {
      console.error('Error updating email list:', error);
    }
  },
  deleteEmailList: async (id) => {
    try {
      const success = await api.delete(id, 'EmailLists');
      if (success) {
        set((state) => ({
          emailLists: state.emailLists.filter((e) => e.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting email list:', error);
    }
  },
}));
