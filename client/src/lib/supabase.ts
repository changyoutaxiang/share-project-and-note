import { createClient } from '@supabase/supabase-js';

// 使用环境变量或直接配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beromkwtszyotvlbqcaz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlcm9ta3d0c3p5b3R2bGJxY2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTc3NTQsImV4cCI6MjA3MzUzMzc1NH0.1rrNFh1yoXEpR44qzCOtWLXdFHELbUBnFbwArFwzGx8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);