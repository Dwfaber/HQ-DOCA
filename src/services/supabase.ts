import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ljdaslhokpbfoyzsjgmc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZGFzbGhva3BiZm95enNqZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODMwNDAsImV4cCI6MjA4NDk1OTA0MH0.xOwuayv-AcsYVoec3SjrMIY2h9IjHEoDF2pOHDHzbwk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ApiBalance {
  provider: string;
  total_credit: number;
  total_spent: number;
  balance: number;
  alert_threshold: number;
  is_low: boolean;
}

export async function getApiBalance() {
  const { data, error } = await supabase.from("api_balance").select("*");
  if (error) throw error;
  return data as ApiBalance[];
}

export async function updateApiCredit(provider: string, total_credit: number, alert_threshold: number) {
  const { error } = await supabase.from("api_credits").upsert({ provider, total_credit, alert_threshold, updated_at: new Date().toISOString() }, { onConflict: "provider" });
  if (error) throw error;
}

export async function getUsageByClient(startDate: string, endDate: string) {
  const { data, error } = await supabase.from("llm_usage").select("tenant_name, provider, tokens_input, tokens_output, cost, requests").gte("date", startDate).lte("date", endDate);
  if (error) throw error;
  
  const grouped: Record<string, any> = {};
  for (const row of data || []) {
    const key = `${row.tenant_name}-${row.provider}`;
    if (!grouped[key]) {
      grouped[key] = { name: row.tenant_name, provider: row.provider, tokens: 0, cost: 0, requests: 0 };
    }
    grouped[key].tokens += (row.tokens_input || 0) + (row.tokens_output || 0);
    grouped[key].cost += row.cost || 0;
    grouped[key].requests += row.requests || 0;
  }
  return Object.values(grouped);
}
