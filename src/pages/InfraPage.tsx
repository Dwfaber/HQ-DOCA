import { useState, useEffect } from "react";
import { Server, Globe, Container, Cpu, HardDrive, Activity, RefreshCw, CheckCircle, AlertTriangle, ExternalLink, Shield, Database, Loader2, MemoryStick } from "lucide-react";

const HOSTINGER_MCP_URL = "https://mcp-hostinger.docaperformance.com.br";

interface VPSMetrics {
  hostname: string;
  ip: string;
  status: string;
  cpu_usage?: number;
  ram_usage?: number;
  disk_usage?: number;
  uptime?: string;
}

interface DomainInfo {
  domain: string;
  ssl: boolean;
  status: string;
  expires?: string;
}

export default function InfraPage() {
  const [loading, setLoading] = useState(true);
  const [mcpStatus, setMcpStatus] = useState<"online" | "offline" | "loading">("loading");
  const [vpsInfo, setVpsInfo] = useState<VPSMetrics | null>(null);
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Testar conexão com MCP Hostinger
      const healthRes = await fetch(`${HOSTINGER_MCP_URL}/health`);
      if (healthRes.ok) {
        setMcpStatus("online");
        
        // Tentar chamar tools do MCP (se disponíveis)
        try {
          const toolsRes = await fetch(`${HOSTINGER_MCP_URL}/tools`);
          if (toolsRes.ok) {
            const tools = await toolsRes.json();
            console.log("MCP Tools disponíveis:", tools);
          }
        } catch {}
      } else {
        setMcpStatus("offline");
      }

      // Dados estáticos por enquanto (substituir por chamadas MCP quando disponível)
      setVpsInfo({
        hostname: "srv903616",
        ip: "31.97.255.11",
        status: "running",
        cpu_usage: 35,
        ram_usage: 52,
        disk_usage: 45,
        uptime: "36 dias"
      });

      setDomains([
        { domain: "docaperformance.com.br", ssl: true, status: "active" },
        { domain: "mcp.docaperformance.com.br", ssl: true, status: "active" },
        { domain: "hq.docaperformance.com.br", ssl: true, status: "active" },
        { domain: "auth.docaperformance.com.br", ssl: true, status: "active" },
        { domain: "db.docaperformance.com.br", ssl: true, status: "active" },
        { domain: "cardapio.docaperformance.com.br", ssl: true, status: "active" },
        { domain: "mcp-hostinger.docaperformance.com.br", ssl: true, status: "active" },
      ]);

      // Containers reais (pegar via API ou estático)
      setContainers([
        { name: "traefik", status: "running", image: "traefik:v2.11", cpu: 2, memory: 128 },
        { name: "mcp-webhook", status: "running", image: "mcp-doca-v2", cpu: 15, memory: 256 },
        { name: "doca-hq", status: "running", image: "doca-hq", cpu: 1, memory: 64 },
        { name: "supabase-db", status: "running", image: "supabase/postgres", cpu: 8, memory: 512 },
        { name: "supabase-kong", status: "running", image: "kong", cpu: 3, memory: 256 },
        { name: "logto", status: "running", image: "svhd/logto", cpu: 4, memory: 384 },
        { name: "waha", status: "running", image: "devlikeapro/waha", cpu: 12, memory: 320 },
        { name: "hostinger-mcp", status: "running", image: "node:20-alpine", cpu: 2, memory: 128 },
        { name: "mcp-redis", status: "running", image: "redis:7-alpine", cpu: 1, memory: 64 },
        { name: "n8n", status: "running", image: "n8nio/n8n", cpu: 5, memory: 256 },
      ]);

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setMcpStatus("offline");
    } finally {
      setLoading(false);
    }
  }

  const runningContainers = containers.filter(c => c.status === "running").length;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">INFRA.DOCAPERFORMANCE.COM.BR</p>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Infraestrutura</h1>
            <p className="text-slate-500 mt-2">VPS, containers e domínios</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mcpStatus === "online" ? "bg-emerald-500 animate-pulse" : mcpStatus === "loading" ? "bg-amber-500" : "bg-red-500"}`} />
              <span className="text-xs text-slate-500">MCP Hostinger: {mcpStatus}</span>
            </div>
            <span className="text-xs text-slate-400">Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
      ) : (
        <>
          {/* Métricas */}
          <section className="px-12 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-1">
              <div className="grid grid-cols-5 divide-x divide-slate-100">
                <div className="p-6 text-center">
                  <Container className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{runningContainers}</p>
                  <p className="text-xs text-slate-400">Containers Ativos</p>
                </div>
                <div className="p-6 text-center">
                  <Cpu className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{vpsInfo?.cpu_usage || 0}%</p>
                  <p className="text-xs text-slate-400">CPU Usage</p>
                </div>
                <div className="p-6 text-center">
                  <MemoryStick className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{vpsInfo?.ram_usage || 0}%</p>
                  <p className="text-xs text-slate-400">RAM Usage</p>
                </div>
                <div className="p-6 text-center">
                  <HardDrive className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{vpsInfo?.disk_usage || 0}%</p>
                  <p className="text-xs text-slate-400">Disco</p>
                </div>
                <div className="p-6 text-center">
                  <Globe className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{domains.length}</p>
                  <p className="text-xs text-slate-400">Domínios</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-12 pb-12">
            <div className="grid grid-cols-12 gap-6">
              {/* VPS + Containers */}
              <div className="col-span-8 space-y-6">
                {/* VPS Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Server className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">VPS Principal</h2>
                        <p className="text-sm text-slate-500">Hostinger KVM 2</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm text-emerald-600 font-medium">Online</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Hostname</p>
                      <p className="font-mono font-medium text-slate-800">{vpsInfo?.hostname}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">IP</p>
                      <p className="font-mono font-medium text-slate-800">{vpsInfo?.ip}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Localização</p>
                      <p className="font-medium text-slate-800">São Paulo, BR</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Uptime</p>
                      <p className="font-medium text-emerald-600">{vpsInfo?.uptime}</p>
                    </div>
                  </div>

                  {/* Resource Bars */}
                  <div className="space-y-4">
                    <ResourceBar label="CPU" value={vpsInfo?.cpu_usage || 0} max={100} color="orange" suffix="%" specs="2 cores" />
                    <ResourceBar label="RAM" value={vpsInfo?.ram_usage || 0} max={100} color="purple" suffix="%" specs="8 GB" />
                    <ResourceBar label="Disco" value={vpsInfo?.disk_usage || 0} max={100} color="blue" suffix="%" specs="100 GB NVMe" />
                  </div>
                </div>

                {/* Containers */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Container className="w-5 h-5 text-blue-500" />
                      Containers ({runningContainers})
                    </h2>
                    <a href="https://31.97.255.11:9443" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                      Portainer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {containers.map((c) => (
                      <div key={c.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${c.status === "running" ? "bg-emerald-500" : "bg-red-500"}`} />
                          <div>
                            <p className="font-medium text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.image}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">{c.cpu}% CPU</p>
                          <p className="text-xs text-slate-400">{c.memory}MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-span-4 space-y-6">
                {/* Domínios */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-500" />
                    Domínios
                  </h2>
                  <div className="space-y-2">
                    {domains.map((d) => (
                      <div key={d.domain} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-slate-700">{d.domain}</span>
                        </div>
                        <Shield className={`w-4 h-4 ${d.ssl ? "text-emerald-500" : "text-slate-300"}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Health */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Health Check
                  </h2>
                  <div className="space-y-3">
                    <HealthItem name="MCP Dashboard" url="mcp.docaperformance.com.br" status="ok" />
                    <HealthItem name="HQ DOCA" url="hq.docaperformance.com.br" status="ok" />
                    <HealthItem name="Auth Center" url="auth.docaperformance.com.br" status="ok" />
                    <HealthItem name="Supabase" url="db.docaperformance.com.br" status="ok" />
                    <HealthItem name="MCP Hostinger" url="mcp-hostinger.docaperformance.com.br" status={mcpStatus === "online" ? "ok" : "error"} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
                  <div className="space-y-2">
                    <QuickLink href="https://31.97.255.11:9443" icon={Container} label="Portainer" color="blue" />
                    <QuickLink href="https://db.docaperformance.com.br" icon={Database} label="Supabase Studio" color="emerald" />
                    <QuickLink href="https://hpanel.hostinger.com" icon={Server} label="Hostinger hPanel" color="purple" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ResourceBar({ label, value, max, color, suffix, specs }: { label: string; value: number; max: number; color: string; suffix: string; specs: string }) {
  const percent = (value / max) * 100;
  const colors: Record<string, string> = {
    orange: "from-orange-400 to-orange-500",
    purple: "from-purple-400 to-purple-500",
    blue: "from-blue-400 to-blue-500",
    emerald: "from-emerald-400 to-emerald-500"
  };
  const isHigh = percent > 80;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{specs}</span>
          <span className={`text-sm font-mono ${isHigh ? "text-red-500" : "text-slate-600"}`}>{value}{suffix}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${isHigh ? "from-red-400 to-red-500" : colors[color]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function HealthItem({ name, url, status }: { name: string; url: string; status: "ok" | "error" | "warning" }) {
  const statusColors = {
    ok: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    error: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" }
  };
  const s = statusColors[status];
  const Icon = s.icon;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
      <div>
        <p className="font-medium text-slate-800 text-sm">{name}</p>
        <p className="text-xs text-slate-400">{url}</p>
      </div>
      <Icon className={`w-5 h-5 ${s.color}`} />
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-50 hover:bg-blue-100",
    emerald: "text-emerald-500 bg-emerald-50 hover:bg-emerald-100",
    purple: "text-purple-500 bg-purple-50 hover:bg-purple-100",
    orange: "text-orange-500 bg-orange-50 hover:bg-orange-100"
  };
  
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl transition ${colors[color]}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
    </a>
  );
}
