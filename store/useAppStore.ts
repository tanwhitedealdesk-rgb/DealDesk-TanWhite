import { create } from 'zustand';
import { Deal, Agent, Buyer, Wholesaler, Contact, EmailList, Brokerage, User as UserType } from '../types';
import { api } from '../services/api';

interface AppState {
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  
  deals: Deal[];
  setDeals: (deals: Deal[] | ((prev: Deal[]) => Deal[])) => void;
  
  agents: Agent[];
  setAgents: (agents: Agent[] | ((prev: Agent[]) => Agent[])) => void;
  
  buyers: Buyer[];
  setBuyers: (buyers: Buyer[] | ((prev: Buyer[]) => Buyer[])) => void;
  
  wholesalers: Wholesaler[];
  setWholesalers: (wholesalers: Wholesaler[] | ((prev: Wholesaler[]) => Wholesaler[])) => void;
  
  contacts: Contact[];
  setContacts: (contacts: Contact[] | ((prev: Contact[]) => Contact[])) => void;
  
  emailLists: EmailList[];
  setEmailLists: (emailLists: EmailList[] | ((prev: EmailList[]) => EmailList[])) => void;
  
  brokerages: Brokerage[];
  setBrokerages: (brokerages: Brokerage[] | ((prev: Brokerage[]) => Brokerage[])) => void;
  
  campaigns: any[];
  setCampaigns: (campaigns: any[] | ((prev: any[]) => any[])) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  deals: [],
  setDeals: (deals) => set((state) => ({ deals: typeof deals === 'function' ? deals(state.deals) : deals })),
  
  agents: [],
  setAgents: (agents) => set((state) => ({ agents: typeof agents === 'function' ? agents(state.agents) : agents })),
  
  buyers: [],
  setBuyers: (buyers) => set((state) => ({ buyers: typeof buyers === 'function' ? buyers(state.buyers) : buyers })),
  
  wholesalers: [],
  setWholesalers: (wholesalers) => set((state) => ({ wholesalers: typeof wholesalers === 'function' ? wholesalers(state.wholesalers) : wholesalers })),
  
  contacts: [],
  setContacts: (contacts) => set((state) => ({ contacts: typeof contacts === 'function' ? contacts(state.contacts) : contacts })),
  
  emailLists: [],
  setEmailLists: (emailLists) => set((state) => ({ emailLists: typeof emailLists === 'function' ? emailLists(state.emailLists) : emailLists })),
  
  brokerages: [],
  setBrokerages: (brokerages) => set((state) => ({ brokerages: typeof brokerages === 'function' ? brokerages(state.brokerages) : brokerages })),
  
  campaigns: [],
  setCampaigns: (campaigns) => set((state) => ({ campaigns: typeof campaigns === 'function' ? campaigns(state.campaigns) : campaigns })),
}));
