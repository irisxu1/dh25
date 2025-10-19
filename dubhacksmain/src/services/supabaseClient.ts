// @ts-ignore
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhahkxghtajanqxpsdpu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYWhreGdodGFqYW5xeHBzZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTE0MjgsImV4cCI6MjA3NjM2NzQyOH0.v1OsV3W9pCLEHMfEgoDIAhRjbC78wN6rgc8j2wF24fE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);