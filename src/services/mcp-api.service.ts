// =====================================================
// MCP-DOCA API Service
// Conecta o HQ-DOCA com a API do MCP-DOCA-V2
// =====================================================

const API_BASE = "https://api.docaperformance.com.br";

export interface FollowupStats {
  total: number;
  pending: number;
  scheduled: number;
  sent: number;
  responded: number;
  cancelled: number;
}

export interface MCPHealth {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

class MCPApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  // Health Check
  async getHealth(): Promise<MCPHealth> {
    return this.fetch<MCPHealth>("/health");
  }

  // Follow-up Stats por tenant
  async getFollowupStats(tenantId: string): Promise<FollowupStats> {
    return this.fetch<FollowupStats>("/api/followup/stats", { tenant_id: tenantId });
  }

  // Resumo de todos os tenants
  async getAllTenantsStats(tenantIds: string[]): Promise<{
    health: MCPHealth | null;
    byTenant: Record<string, FollowupStats>;
    totals: FollowupStats;
  }> {
    let health: MCPHealth | null = null;
    
    try {
      health = await this.getHealth();
    } catch (e) {
      console.error("Failed to get health:", e);
    }

    const results = await Promise.all(
      tenantIds.map(async (tenantId) => {
        try {
          const stats = await this.getFollowupStats(tenantId);
          return { tenantId, stats };
        } catch {
          return { tenantId, stats: null };
        }
      })
    );

    const byTenant: Record<string, FollowupStats> = {};
    const totals: FollowupStats = {
      total: 0,
      pending: 0,
      scheduled: 0,
      sent: 0,
      responded: 0,
      cancelled: 0
    };

    results.forEach(({ tenantId, stats }) => {
      if (stats) {
        byTenant[tenantId] = stats;
        totals.total += stats.total;
        totals.pending += stats.pending;
        totals.scheduled += stats.scheduled;
        totals.sent += stats.sent;
        totals.responded += stats.responded;
        totals.cancelled += stats.cancelled;
      }
    });

    return { health, byTenant, totals };
  }

  // Uptime formatado
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Memória formatada
  formatMemory(bytes: number): string {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  }
}

export const mcpApiService = new MCPApiService();
