import supabase from './client.js';
import * as queries from './queries.js';

export {
    supabase,
    queries
};

const db = {
    supabase,
    ...queries
};

export default db;
