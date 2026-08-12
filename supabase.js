const SUPABASE_URL = "https://yphlwxzfwrqijqzsgasb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PN4goWgFeOOy5DU8BQAjZw_dAF2eLBZ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);