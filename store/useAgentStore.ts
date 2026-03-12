import { create } from 'zustand';
import { Agent } from '../types';
import { api } from '../services/api';

interface AgentState {
  agents: Agent[];
  isLoading: boolean;
  setAgents: (agents: Agent[]) => void;
  fetchAgents: () => Promise<void>;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  isLoading: false,
  setAgents: (agents) => set({ agents }),
  fetchAgents: async () => {
    set({ isLoading: true });
    try {
      const data = await api.load('Agents');
      set({ agents: data });
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addAgent: async (agent) => {
    try {
      const newAgent = await api.save(agent, 'Agents');
      if (newAgent) {
        set((state) => ({ agents: [newAgent, ...state.agents] }));
      }
    } catch (error) {
      console.error('Error adding agent:', error);
    }
  },
  updateAgent: async (id, updates) => {
    try {
      const success = await api.save({ id, ...updates }, 'Agents');
      if (success) {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      }
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  },
  deleteAgent: async (id) => {
    try {
      const success = await api.delete(id, 'Agents');
      if (success) {
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  },
}));
