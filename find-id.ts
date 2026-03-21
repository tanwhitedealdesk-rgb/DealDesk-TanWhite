import { api } from './services/api';

async function findDuplicateId() {
    const id = '8483dfc2-463e-47ee-956f-ee5fbb92ed73';
    const tables = ['Deals', 'JVDeals', 'Agents', 'Wholesalers', 'Buyers', 'Contacts', 'EmailLists', 'Brokerages', 'Campaigns'];
    for (const table of tables) {
        try {
            const data = await api.load(table);
            const matches = data.filter((item: any) => item.id === id);
            if (matches.length > 0) {
                console.log(`Found ${matches.length} matches in ${table}`);
            }
        } catch (e) {
            console.error(`Error loading ${table}`);
        }
    }
}
findDuplicateId();
