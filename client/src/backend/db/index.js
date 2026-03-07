const supabase = require('./client');
const queries = require('./queries');

module.exports = {
    supabase,
    ...queries
};
