import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// KV store helpers for sat_voca data
const TABLE = 'kv_store_46fa08c1';

export async function kvGet(key: string): Promise<any | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.log(`kvGet(${key}) error:`, error.message);
    return null;
  }
  return data?.value ?? null;
}

export async function kvSet(key: string, value: any): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) {
    console.log(`kvSet(${key}) error:`, error.message);
    return false;
  }
  return true;
}
