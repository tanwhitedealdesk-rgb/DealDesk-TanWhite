import { DealFinderProperty, MarketData, Campaign, InboxMessage, OfferTemplate } from '../types';

export const mockDealFinderProperties: DealFinderProperty[] = [
  {
    id: 'prop-1',
    address: '10239 Kimberlite Drive',
    city: 'Temple',
    state: 'TX',
    zip: '76502',
    listPrice: 415000,
    beds: 4,
    baths: 2,
    sqft: 2191,
    propertyType: 'Single Family',
    daysOnMarket: 14,
    estimatedArv: 480000,
    estimatedRent: 2075,
    cashFlow: 350,
    capRate: 12,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600',
    opportunitySignals: ['High Equity', 'Out of State Owner'],
    distressSignals: [],
    status: 'Active'
  },
  {
    id: 'prop-2',
    address: '620 High Summit Drive',
    city: 'Georgetown',
    state: 'TX',
    zip: '78628',
    listPrice: 530000,
    beds: 3,
    baths: 3,
    sqft: 1971,
    propertyType: 'Townhouse',
    daysOnMarket: 45,
    estimatedArv: 600000,
    estimatedRent: 2650,
    cashFlow: 420,
    capRate: 12,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    opportunitySignals: ['Price Drop'],
    distressSignals: ['Pre-Foreclosure'],
    status: 'Active'
  },
  {
    id: 'prop-3',
    address: '3632 North Drive',
    city: 'Belton',
    state: 'TX',
    zip: '76513',
    listPrice: 469900,
    beds: 4,
    baths: 2,
    sqft: 1937,
    propertyType: 'Single Family',
    daysOnMarket: 8,
    estimatedArv: 510000,
    estimatedRent: 2350,
    cashFlow: 280,
    capRate: 12,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    opportunitySignals: ['Vacant'],
    distressSignals: [],
    status: 'Active'
  },
  {
    id: 'prop-4',
    address: '1208 Dunbrooke Ln',
    city: 'Dunwoody',
    state: 'GA',
    zip: '30338',
    listPrice: 1135000,
    beds: 5,
    baths: 5,
    sqft: 4352,
    propertyType: 'Single Family',
    daysOnMarket: 214,
    estimatedArv: 1300000,
    estimatedRent: 5675,
    cashFlow: 800,
    capRate: 12,
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=600',
    opportunitySignals: ['High Days on Market', 'Price Drop'],
    distressSignals: [],
    status: 'Active'
  }
];

export const mockMarketData: MarketData[] = [
  { city: 'Elverson', state: 'PA', medianPrice: 267000, inventory: 250, daysOnMarket: 42, marketOpportunityScore: 90, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.95 },
  { city: 'Beaver Dam', state: 'KY', medianPrice: 185000, inventory: 120, daysOnMarket: 35, marketOpportunityScore: 90, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.97 },
  { city: 'Pickens', state: 'SC', medianPrice: 210000, inventory: 180, daysOnMarket: 38, marketOpportunityScore: 89, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.84 },
  { city: 'Daytona Beach', state: 'FL', medianPrice: 320000, inventory: 450, daysOnMarket: 55, marketOpportunityScore: 87, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.53 },
  { city: 'La Crosse', state: 'WI', medianPrice: 245000, inventory: 160, daysOnMarket: 40, marketOpportunityScore: 86, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.44 },
  { city: 'Kennett Square', state: 'PA', medianPrice: 450000, inventory: 110, daysOnMarket: 30, marketOpportunityScore: 85, priceGrowth: 11.11, capRate: 7.2, jobGrowth: 4.19 },
];

export const mockCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Atlanta Pre-Foreclosures', type: 'Hybrid', status: 'Running', audienceSize: 450, sent: 450, delivered: 442, responses: 12, startDate: '2026-03-01', templateId: 'tpl-1' },
  { id: 'camp-2', name: 'Texas High Equity Cash', type: 'Email', status: 'Scheduled', audienceSize: 1200, sent: 0, delivered: 0, responses: 0, startDate: '2026-03-15', templateId: 'tpl-2' },
  { id: 'camp-3', name: 'Florida Absentee Owners', type: 'SMS', status: 'Completed', audienceSize: 800, sent: 800, delivered: 780, responses: 45, startDate: '2026-02-10', templateId: 'tpl-3' },
];

export const mockAcquisitionsMessages: InboxMessage[] = [
  { id: 'msg-1', contactName: 'Sarah Johnson (Agent)', contactPhone: '(555) 123-4567', propertyAddress: '3737 Casa Del Sol Ln', lastMessage: 'Thank you for your offer. I\'ve shared it with my client.', timestamp: '11:45 AM', unread: true, type: 'SMS', direction: 'inbound' },
  { id: 'msg-2', contactName: 'Michael Rodriguez (Seller)', contactPhone: '(555) 987-6543', propertyAddress: '8324 Coolgreene Dr', lastMessage: 'I\'m interested in discussing the terms of your seller finance offer.', timestamp: 'Yesterday', unread: false, type: 'Email', direction: 'inbound' },
  { id: 'msg-3', contactName: 'David Wilson (Seller)', contactPhone: '(555) 456-7890', propertyAddress: '10866 Cassandra Way', lastMessage: 'Following up on the inspection period.', timestamp: '2d ago', unread: false, type: 'SMS', direction: 'outbound' },
  { id: 'msg-4', contactName: 'Jessica Taylor (Agent)', contactPhone: '(555) 222-3333', propertyAddress: '123 Main St', lastMessage: 'Can we do 14 days due diligence instead of 21?', timestamp: '3d ago', unread: true, type: 'SMS', direction: 'inbound' },
];

export const mockDispositionsMessages: InboxMessage[] = [
  { id: 'disp-1', contactName: 'John Doe (Cash Buyer)', contactPhone: '(555) 111-2222', propertyAddress: '3737 Casa Del Sol Ln', lastMessage: 'I can do $150k cash, close in 7 days. Let me know.', timestamp: '10:30 AM', unread: true, type: 'SMS', direction: 'inbound' },
  { id: 'disp-2', contactName: 'Apex Investments (Buyer)', contactPhone: '(555) 333-4444', propertyAddress: '8324 Coolgreene Dr', lastMessage: 'Send over the assignment contract, we are good to go.', timestamp: '1:15 PM', unread: true, type: 'Email', direction: 'inbound' },
  { id: 'disp-3', contactName: 'Robert Smith (Fix & Flipper)', contactPhone: '(555) 555-6666', propertyAddress: '10866 Cassandra Way', lastMessage: 'Do you have any more pictures of the roof?', timestamp: 'Yesterday', unread: false, type: 'SMS', direction: 'inbound' },
  { id: 'disp-4', contactName: 'Lisa Wong (Buy & Hold)', contactPhone: '(555) 777-8888', propertyAddress: '123 Main St', lastMessage: 'What is the current rent roll looking like?', timestamp: '2d ago', unread: false, type: 'Email', direction: 'inbound' },
];

export const mockOfferTemplates: OfferTemplate[] = [
  { id: 'tpl-1', name: 'Hybrid Offer- Subject To + Seller Finance', type: 'Hybrid', emailBody: 'Dear {{Agent_Name}},\n\nI am writing to express my interest in purchasing the property located at {{Property_Address}}...', smsBody: 'Hey {{Agent_First_Name}}! Just sent over an offer for {{Property_Address}} - {{Offer_Amount}}. Details in your email. Let\'s chat: {{Your_Phone}}', loiBody: 'AcquireFlow Investments\n{{Your_Address}}\n\nPurchase Price: {{Offer_Amount}}\nEarnest Money Deposit: $10,000...' },
  { id: 'tpl-2', name: 'Standard Cash Offer', type: 'Cash', emailBody: 'Dear {{Agent_Name}},\n\nPlease find attached our cash offer for {{Property_Address}}...', smsBody: 'Hi {{Agent_First_Name}}, sent a cash offer for {{Property_Address}}. Let me know if you received it!', loiBody: 'Cash Offer\n\nPurchase Price: {{Offer_Amount}}\n...' },
  { id: 'tpl-3', name: 'Seller Financing Offer', type: 'Seller Finance', emailBody: 'Dear {{Agent_Name}},\n\nWe are interested in a seller finance arrangement for {{Property_Address}}...', smsBody: 'Hey {{Agent_First_Name}}, sent a seller finance offer for {{Property_Address}}.', loiBody: 'Seller Finance Offer\n\nPurchase Price: {{Offer_Amount}}\n...' },
];
