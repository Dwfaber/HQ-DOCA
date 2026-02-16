import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://db.docaperformance.com.br";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NDY2MDQzLCJleHAiOjIwODQ4MjYwNDN9.HhAph_jNwsZnU8LyiUWup9PUT_c-avyxEXocgt8Qago";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================================
// TIPOS - Baseado nas tabelas existentes
// =====================================================

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  phone: string;
  address: string;
  specialty: string;
  agent_config: {
    enabled?: boolean;
    ai_provider?: string;
    ai_model?: string;
    useEmojis?: boolean;
    personality?: string;
    whatsapp_provider?: string;
  };
  prompt: string;
  knowledge: string;
  zapi_config: any;
  business_hours: any;
  active: boolean;
  created_at: string;
  updated_at: string;
  plan: string;
  plan_limits: any;
  billing_email: string;
  scheduler_url: string;
  salas: any[];
  custom_domain: string;
}

export interface HQSystem {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: string;
  llm_provider: string;
  llm_model: string;
  container_name: string;
  icon: string;
  color: string;
  status: string;
  github_repo?: string;
  documentation_url?: string;
}

export interface HQLLMCredit {
  provider: string;
  total_credit: number;
  total_spent: number;
  alert_threshold: number;
}

export interface HQAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

// =====================================================
// TENANTS (Clientes)
// =====================================================

export async function getClients(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("name");
  if (error) {
    console.error("Error loading tenants:", error);
    return [];
  }
  return data as Tenant[];
}

export async function getClientBySlug(slug: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Tenant;
}

// =====================================================
// SISTEMAS
// =====================================================

export async function getSystems(): Promise<HQSystem[]> {
  const { data, error } = await supabase
    .from("hq_systems")
    .select("*")
    .order("name");
  if (error) {
    console.error("Error loading systems:", error);
    return [];
  }
  return data as HQSystem[];
}

// =====================================================
// LLM CREDITS
// =====================================================

export async function getLLMCredits() {
  const { data, error } = await supabase
    .from("hq_llm_credits")
    .select("*");
  if (error) {
    console.error("Error loading LLM credits:", error);
    return [];
  }
  return (data || []).map((c: any) => ({
    ...c,
    balance: c.total_credit - c.total_spent,
    is_low: (c.total_credit - c.total_spent) <= c.alert_threshold
  }));
}

// =====================================================
// ALERTAS
// =====================================================

export async function getAlerts(resolved?: boolean): Promise<HQAlert[]> {
  let query = supabase
    .from("hq_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (resolved !== undefined) {
    query = query.eq("resolved", resolved);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error loading alerts:", error);
    return [];
  }
  return data as HQAlert[];
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export async function getDashboardStats() {
  const [clients, systems, credits, alerts] = await Promise.all([
    getClients(),
    getSystems(),
    getLLMCredits(),
    getAlerts(false)
  ]);
  
  const activeClients = clients.filter(c => c.active);
  
  const totalLLMCredit = credits.reduce((acc: number, c: any) => acc + (c.total_credit || 0), 0);
  const totalLLMSpent = credits.reduce((acc: number, c: any) => acc + (c.total_spent || 0), 0);
  const lowCredits = credits.filter((c: any) => c.is_low);
  
  return {
    clients: {
      total: clients.length,
      active: activeClients.length
    },
    systems: {
      total: systems.length,
      active: systems.filter(s => s.status === "active").length
    },
    llm: {
      totalCredit: totalLLMCredit,
      totalSpent: totalLLMSpent,
      balance: totalLLMCredit - totalLLMSpent,
      lowCredits: lowCredits.length,
      providers: credits
    },
    alerts: {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === "critical").length,
      warning: alerts.filter(a => a.severity === "warning").length
    }
  };
}

// =====================================================
// PAGAMENTOS (placeholder)
// =====================================================

export async function getPayments(_clientId?: string) {
  return [];
}

export async function getClientWithSystems(_clientId: string) {
  return [];
}

// =====================================================
// LEGACY - compatibilidade com LLMUsagePage
// =====================================================

export interface ApiBalance {
  provider: string;
  total_credit: number;
  total_spent: number;
  balance: number;
  alert_threshold: number;
  is_low: boolean;
}

export async function getApiBalance(): Promise<ApiBalance[]> {
  return getLLMCredits();
}

export async function updateApiCredit(provider: string, totalCredit: number, alertThreshold: number) {
  const { error } = await supabase
    .from("hq_llm_credits")
    .upsert({
      provider,
      total_credit: totalCredit,
      alert_threshold: alertThreshold,
      total_spent: 0
    }, { onConflict: "provider" });
  if (error) throw error;
}

export async function getUsageByClient(_startDate: string, _endDate: string) {
  // TODO: implementar com ai_logs
  return [];
}

// =====================================================
// FINANCEIRO
// =====================================================

export interface HQRevenue {
  id: string;
  client_slug: string;
  client_name: string;
  type: string;
  value: number;
  start_date: string;
  notes: string;
  active: boolean;
}

export interface HQCost {
  id: string;
  category: string;
  name: string;
  value: number;
  recurrence: string;
  notes: string;
  active: boolean;
}

export async function getRevenues(): Promise<HQRevenue[]> {
  const { data, error } = await supabase
    .from("hq_revenues")
    .select("*")
    .eq("active", true)
    .order("value", { ascending: false });
  if (error) {
    console.error("Error loading revenues:", error);
    return [];
  }
  return data as HQRevenue[];
}

export async function getCosts(): Promise<HQCost[]> {
  const { data, error } = await supabase
    .from("hq_costs")
    .select("*")
    .eq("active", true)
    .order("category");
  if (error) {
    console.error("Error loading costs:", error);
    return [];
  }
  return data as HQCost[];
}
