import { create } from 'zustand';
import { Contact } from '../types';
import { api } from '../services/api';

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  setContacts: (contacts: Contact[]) => void;
  fetchContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  isLoading: false,
  setContacts: (contacts) => set({ contacts }),
  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Contacts');
      set({ contacts: data });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addContact: async (contact) => {
    try {
      const newContact = await api.save(contact, 'Contacts');
      if (newContact) {
        set((state) => ({ contacts: [newContact, ...state.contacts] }));
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  },
  updateContact: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Contacts');
      if (success) {
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  },
  deleteContact: async (id) => {
    try {
      const success = await api.delete(id, 'Contacts');
      if (success) {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  },
}));
