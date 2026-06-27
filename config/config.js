
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://buodkeabogmedzdfomno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1b2RrZWFib2dtZWR6ZGZvbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjQ4MDQsImV4cCI6MjA2ODAwMDgwNH0.lGApRC9Bo9V66HeoeSI_tUzSVm_5OPyv08n_LcZYrrI'; // Renomeada para supabaseAnonKey


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase configurado. URL:', supabaseUrl, 'Anon Key (parcial):', supabaseAnonKey.substring(0, 10) + '...');