import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fjduwifyvltckproeuxz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZHV3aWZ5dmx0Y2twcm9ldXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NTA1NjIsImV4cCI6MjA5MDMyNjU2Mn0.166ZDIjzacnyY0JvaSmOg48oxiXBraa2yNVFe3Tpg1A";

export const supabase = createClient(supabaseUrl, supabaseKey);