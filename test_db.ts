import { api } from "./services/api.ts";

async function test() {
    try {
        const emails = await api.load('sender_emails');
        console.log("Sender emails:", emails);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
