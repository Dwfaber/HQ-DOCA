// HQ-DOCA Hostinger Integration Service
// Este serviço conecta ao Hostinger MCP e expõe dados para o Command Center

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

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
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}

interface BillingInfo {
  balance: number;
  nextPayment?: {
    amount: number;
    date: string;
  };
  subscriptions: Array<{
    id: string;
    name: string;
    status: string;
    renewsAt: string;
  }>;
}

interface HostingerAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: 'domain' | 'vps' | 'billing' | 'dns';
}

class HostingerService {
  private client: Client | null = null;
  private connected: boolean = false;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async connect(): Promise<void> {
    if (this.connected) return;

    const transport = new StdioClientTransport({
      command: "hostinger-api-mcp",
      env: {
        ...process.env,
        API_TOKEN: process.env.HOSTINGER_API_TOKEN || ""
      }
    });

    this.client = new Client(
      { name: "hq-doca-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await this.client.connect(transport);
    this.connected = true;
    console.log("✅ Conectado ao Hostinger MCP");
  }

  private async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    if (!this.client || !this.connected) {
      await this.connect();
    }

    const cacheKey = `${name}:${JSON.stringify(args)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    try {
      const result = await this.client!.callTool({ name, arguments: args });
      const data = this.parseResult(result);
      
      this.cache.set(cacheKey, {
        data,
        expiry: Date.now() + this.CACHE_TTL
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao chamar ${name}:`, error);
      throw error;
    }
  }

  private parseResult(result: any): any {
    try {
      const content = result?.content?.[0]?.text;
      if (content) {
        return JSON.parse(content);
      }
      return result;
    } catch {
      return result;
    }
  }

  // ==================== DOMÍNIOS ====================
  
  async getDomains(): Promise<Domain[]> {
    const data = await this.callTool("domains_getDomainListV1");
    
    if (!Array.isArray(data)) return [];
    
    return data.map((d: any) => {
      const expiresAt = new Date(d.expires_at || d.expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: d.id,
        domain: d.domain,
        status: d.status,
        expiresAt: d.expires_at || d.expiresAt,
        autoRenew: d.auto_renew || d.autoRenew || false,
        daysUntilExpiry
      };
    });
  }

  async getExpiringDomains(daysThreshold: number = 30): Promise<Domain[]> {
    const domains = await this.getDomains();
    return domains.filter(d => d.daysUntilExpiry <= daysThreshold && d.daysUntilExpiry > 0);
  }

  // ==================== VPS ====================
  
  async getVPSList(): Promise<VPS[]> {
    const data = await this.callTool("VPS_getVirtualMachineListV1");
    
    if (!Array.isArray(data)) return [];
    
    return data.map((v: any) => ({
      id: v.id,
      name: v.hostname || v.name,
      status: v.state || v.status,
      ip: v.ipv4?.[0]?.address || v.ip,
      datacenter: v.datacenter_name || v.datacenter,
      plan: v.plan_name || v.plan
    }));
  }

  async getVPSMetrics(vpsId: string): Promise<{ cpu: number; memory: number; disk: number }> {
    try {
      const data = await this.callTool("VPS_getVirtualMachineMetricsV1", { 
        virtualMachineId: vpsId 
      });
      
      return {
        cpu: data?.cpu_usage || 0,
        memory: data?.memory_usage || 0,
        disk: data?.disk_usage || 0
      };
    } catch {
      return { cpu: 0, memory: 0, disk: 0 };
    }
  }

  // ==================== BILLING ====================
  
  async getBillingInfo(): Promise<BillingInfo> {
    const [subscriptions, paymentMethods] = await Promise.all([
      this.callTool("billing_getSubscriptionListV1").catch(() => []),
      this.callTool("billing_getPaymentMethodListV1").catch(() => [])
    ]);

    return {
      balance: 0, // API pode não expor isso diretamente
      subscriptions: Array.isArray(subscriptions) 
        ? subscriptions.map((s: any) => ({
            id: s.id,
            name: s.name || s.product_name,
            status: s.status,
            renewsAt: s.next_billing_date || s.renewsAt
          }))
        : []
    };
  }

  // ==================== DNS ====================
  
  async getDNSRecords(domain: string): Promise<any[]> {
    try {
      const data = await this.callTool("DNS_getRecordsV1", { domain });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // ==================== ALERTAS ====================
  
  async generateAlerts(): Promise<HostingerAlert[]> {
    const alerts: HostingerAlert[] = [];
    const now = new Date();

    try {
      // Verificar domínios expirando
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
        
        if (!domain.autoRenew && domain.daysUntilExpiry <= 30) {
          alerts.push({
            id: `domain-autorenew-${domain.id}`,
            type: 'warning',
            title: 'Auto-renovação desativada',
            message: `${domain.domain} não tem renovação automática`,
            timestamp: now.toISOString(),
            source: 'domain'
          });
        }
      }

      // Verificar VPS
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

      // Verificar billing
      const billing = await this.getBillingInfo();
      
      for (const sub of billing.subscriptions) {
        if (sub.renewsAt) {
          const renewDate = new Date(sub.renewsAt);
          const daysUntilRenew = Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilRenew <= 7 && daysUntilRenew > 0) {
            alerts.push({
              id: `billing-renew-${sub.id}`,
              type: 'warning',
              title: 'Renovação próxima',
              message: `${sub.name} renova em ${daysUntilRenew} dias`,
              timestamp: now.toISOString(),
              source: 'billing'
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao gerar alertas:", error);
    }

    return alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  }

  // ==================== DASHBOARD DATA ====================
  
  async getDashboardData() {
    const [domains, vpsList, billing, alerts] = await Promise.all([
      this.getDomains().catch(() => []),
      this.getVPSList().catch(() => []),
      this.getBillingInfo().catch(() => ({ balance: 0, subscriptions: [] })),
      this.generateAlerts().catch(() => [])
    ]);

    // Calcular métricas
    const activeVPS = vpsList.filter(v => v.status === 'running' || v.status === 'active');
    const expiringDomains = domains.filter(d => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0);

    return {
      summary: {
        totalDomains: domains.length,
        totalVPS: vpsList.length,
        activeVPS: activeVPS.length,
        expiringDomains: expiringDomains.length,
        activeSubscriptions: billing.subscriptions.filter(s => s.status === 'active').length,
        criticalAlerts: alerts.filter(a => a.type === 'critical').length,
        warningAlerts: alerts.filter(a => a.type === 'warning').length
      },
      domains,
      vpsList,
      billing,
      alerts,
      lastUpdated: new Date().toISOString()
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      this.client = null;
    }
  }
}

// Singleton instance
export const hostingerService = new HostingerService();
export default hostingerService;
