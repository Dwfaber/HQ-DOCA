// HQ-DOCA Hostinger Integration Service
const MCP_URL = import.meta.env.VITE_HOSTINGER_MCP_URL || 'http://localhost:8100';

interface Domain {
  id: string;
  domain: string;
  status: string;
  expiresAt: string;
  autoRenew: boolean;
  daysUntilExpiry: number;
}

interface VPS {
  id: string;
  name: string;
  status: string;
  ip: string;
  datacenter: string;
  plan: string;
}

interface HostingerAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: 'domain' | 'vps' | 'billing' | 'dns';
}

export interface DashboardData {
  summary: {
    totalDomains: number;
    totalVPS: number;
    activeVPS: number;
    expiringDomains: number;
    activeSubscriptions: number;
    criticalAlerts: number;
    warningAlerts: number;
  };
  domains: Domain[];
  vpsList: VPS[];
  alerts: HostingerAlert[];
  lastUpdated: string;
}

class HostingerService {
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000;

  private async callMCP(toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const cacheKey = `${toolName}:${JSON.stringify(args)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const response = await fetch(`${MCP_URL}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: toolName, arguments: args },
          id: Date.now()
        })
      });

      const result = await response.json();
      const data = this.parseResult(result);
      
      this.cache.set(cacheKey, { data, expiry: Date.now() + this.CACHE_TTL });
      return data;
    } catch (error) {
      console.error(`Erro MCP ${toolName}:`, error);
      throw error;
    }
  }

  private parseResult(result: unknown): unknown {
    try {
      const r = result as { result?: { content?: Array<{ text?: string }> } };
      if (r?.result?.content?.[0]?.text) {
        return JSON.parse(r.result.content[0].text);
      }
      return r?.result || result;
    } catch {
      return result;
    }
  }

  async getDomains(): Promise<Domain[]> {
    try {
      const data = await this.callMCP("domains_getDomainListV1") as Array<Record<string, unknown>>;
      if (!Array.isArray(data)) return [];
      
      return data.map((d) => {
        const expiresAt = new Date((d.expires_at || d.expiresAt) as string);
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        return {
          id: d.id as string,
          domain: d.domain as string,
          status: d.status as string,
          expiresAt: (d.expires_at || d.expiresAt) as string,
          autoRenew: (d.auto_renew || d.autoRenew || false) as boolean,
          daysUntilExpiry
        };
      });
    } catch { return []; }
  }

  async getVPSList(): Promise<VPS[]> {
    try {
      const data = await this.callMCP("VPS_getVirtualMachineListV1") as Array<Record<string, unknown>>;
      if (!Array.isArray(data)) return [];
      
      return data.map((v) => ({
        id: v.id as string,
        name: (v.hostname || v.name) as string,
        status: (v.state || v.status) as string,
        ip: ((v.ipv4 as Array<{address: string}>)?.[0]?.address || v.ip) as string,
        datacenter: (v.datacenter_name || v.datacenter) as string,
        plan: (v.plan_name || v.plan) as string
      }));
    } catch { return []; }
  }

  async generateAlerts(): Promise<HostingerAlert[]> {
    const alerts: HostingerAlert[] = [];
    const now = new Date();

    try {
      const domains = await this.getDomains();
      for (const domain of domains) {
        if (domain.daysUntilExpiry <= 15 && domain.daysUntilExpiry > 0) {
          alerts.push({
            id: `domain-expiry-${domain.id}`,
            type: domain.daysUntilExpiry <= 7 ? 'critical' : 'warning',
            title: 'Domínio expirando',
            message: `${domain.domain} expira em ${domain.daysUntilExpiry} dias`,
            timestamp: now.toISOString(),
            source: 'domain'
          });
        }
      }

      const vpsList = await this.getVPSList();
      for (const vps of vpsList) {
        if (vps.status !== 'running' && vps.status !== 'active') {
          alerts.push({
            id: `vps-status-${vps.id}`,
            type: 'critical',
            title: 'VPS offline',
            message: `${vps.name} está ${vps.status}`,
            timestamp: now.toISOString(),
            source: 'vps'
          });
        }
      }
    } catch (error) {
      console.error("Erro alertas:", error);
    }

    return alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  }

  async getDashboardData(): Promise<DashboardData> {
    const [domains, vpsList, alerts] = await Promise.all([
      this.getDomains(),
      this.getVPSList(),
      this.generateAlerts()
    ]);

    return {
      summary: {
        totalDomains: domains.length,
        totalVPS: vpsList.length,
        activeVPS: vpsList.filter(v => v.status === 'running' || v.status === 'active').length,
        expiringDomains: domains.filter(d => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0).length,
        activeSubscriptions: 0,
        criticalAlerts: alerts.filter(a => a.type === 'critical').length,
        warningAlerts: alerts.filter(a => a.type === 'warning').length
      },
      domains,
      vpsList,
      alerts,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const hostingerService = new HostingerService();
export default hostingerService;
