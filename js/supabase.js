// Connexion à Supabase, partagée par toutes les pages

const SUPABASE_URL = "https://oispnhmvoujeurrwbxhv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc3BuaG12b3VqZXVycndieGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzIwOTYsImV4cCI6MjEwNzQwODA5Nn0.LuDvYPbA-I0p4bfXUHeABwrEWtZmtAzw5znbKbOiboU";
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
