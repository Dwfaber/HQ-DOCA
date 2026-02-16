import { useState, useEffect } from "react";
import { Server, Users, Activity, Clock, Cpu, MessageSquare, RefreshCw, ExternalLink, Github, BookOpen, Loader2, CheckCircle, AlertTriangle, Bot, Zap } from "lucide-react";
import { getSystems, getClients } from "../services/supabase";
import { mcpApiService } from "../services/mcp-api.service";
import type { HQSystem, Tenant } from "../services/supabase";

interface SystemPageProps {
  systemSlug?: string;
}

export default function SystemPage({ systemSlug = "drhair" }: SystemPageProps) {
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState<HQSystem | null>(null);
  const [clients, setClients] = useState<Tenant[]>([]);
  const [mcpHealth, setMcpHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>({});

  useEffect(() => { loadData(); }, [systemSlug]);

  async function loadData() {
    setLoading(true);
    try {
      // Carregar sistema
      const systems = await getSystems();
      const sys = systems.find(s => s.slug === systemSlug);
      setSystem(sys || null);

      // Carregar clientes (tenants que usam este sistema)
      const allClients = await getClients();
      // Filtrar por slug (ex: drhair-contagem, drhair-bh usa sistema drhair)
      const systemClients = allClients.filter(c => c.slug.startsWith(systemSlug));
      setClients(systemClients);

      // Carregar health do MCP
      try {
        const health = await mcpApiService.getHealth();
        setMcpHealth(health);
      } catch {}

      // Carregar stats agregados
      try {
        const tenantIds = systemClients.map(c => c.slug);
        const statsData = await mcpApiService.getAllTenantsStats(tenantIds);
        setStats(statsData);
      } catch {}
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  const activeClients = clients.filter(c => c.active).length;
  const totalFollowups = stats.totals?.total || 0;
  const pendingFollowups = stats.totals?.pending || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!system) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Sistema não encontrado</p>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
    rose: { bg: "bg-rose-50", text: "text-rose-600", gradient: "from-rose-400 to-rose-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", gradient: "from-emerald-400 to-emerald-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-400 to-blue-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", gradient: "from-orange-400 to-orange-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", gradient: "from-purple-400 to-purple-600" },
  };
  const colors = colorMap[system.color] || colorMap.blue;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-4xl shadow-lg`}>
              {system.icon}
            </div>
            <div>
              <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">SISTEMA</p>
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight">{system.name}</h1>
              <p className="text-slate-500 mt-2">{system.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${system.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span className="text-sm text-slate-600">{system.status === "active" ? "Online" : "Offline"}</span>
            </div>
            <button onClick={loadData} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Métricas */}
      <section className="px-12 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-1">
          <div className="grid grid-cols-5 divide-x divide-slate-100">
            <MetricCard icon={CheckCircle} label="Status" value={system.status === "active" ? "Online" : "Offline"} color={system.status === "active" ? "emerald" : "slate"} />
            <MetricCard icon={Users} label="Clientes" value={activeClients.toString()} subtext={`${clients.length} total`} color="blue" />
            <MetricCard icon={MessageSquare} label="Follow-ups" value={totalFollowups.toString()} subtext={`${pendingFollowups} pendentes`} color="orange" />
            <MetricCard icon={Clock} label="Uptime" value={mcpHealth?.uptime ? mcpApiService.formatUptime(mcpHealth.uptime) : "N/A"} color="purple" />
            <MetricCard icon={Cpu} label="Memória" value={mcpHealth?.memory ? `${mcpApiService.formatMemory(mcpHealth.memory.heapUsed)}MB` : "N/A"} color="cyan" />
          </div>
        </div>
      </section>

      <section className="px-12 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Clientes que usam este sistema */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Clientes ({clients.length})
              </h2>
              {clients.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${colors.gradient}`}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{client.name}</h3>
                            <p className="text-xs text-slate-400">{client.slug}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {client.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {client.agent_config?.ai_provider || "openai"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {client.plan}
                        </span>
                        {client.agent_config?.enabled && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Activity className="w-3 h-3" />
                            IA Ativa
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  Nenhum cliente usando este sistema
                </div>
              )}
            </div>

            {/* Stats por Cliente */}
            {Object.keys(stats.byTenant || {}).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Follow-ups por Cliente
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.byTenant || {}).map(([tenantId, tenantStats]: [string, any]) => (
                    <div key={tenantId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-700">{tenantId}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{tenantStats.total || 0} total</span>
                        <span className="text-sm text-orange-600 font-medium">{tenantStats.pending || 0} pendentes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Configuração */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Configuração</h2>
              <div className="space-y-3">
                <ConfigItem label="Domínio" value={system.domain} />
                <ConfigItem label="LLM Provider" value={system.llm_provider || "N/A"} />
                <ConfigItem label="Modelo" value={system.llm_model || "N/A"} />
                <ConfigItem label="Container" value={system.container_name} />
              </div>
            </div>

            {/* Health */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Health
              </h2>
              {mcpHealth ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="text-sm text-slate-700">Status</span>
                    <span className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle className="w-4 h-4" /> Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Uptime</span>
                    <span className="font-mono text-sm text-slate-600">{mcpApiService.formatUptime(mcpHealth.uptime)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Heap Used</span>
                    <span className="font-mono text-sm text-slate-600">{mcpApiService.formatMemory(mcpHealth.memory?.heapUsed || 0)} MB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Heap Total</span>
                    <span className="font-mono text-sm text-slate-600">{mcpApiService.formatMemory(mcpHealth.memory?.heapTotal || 0)} MB</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-700 text-sm">Health check indisponível</span>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Links Rápidos</h2>
              <div className="space-y-2">
                <a href={`https://${system.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Acessar Sistema</span>
                </a>
                {system.github_repo && (
                  <a href={system.github_repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
                    <Github className="w-5 h-5" />
                    <span className="font-medium">GitHub</span>
                  </a>
                )}
                {system.documentation_url && (
                  <a href={system.documentation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Documentação</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color }: { icon: React.ElementType; label: string; value: string; subtext?: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    cyan: "text-cyan-500",
    slate: "text-slate-400"
  };
  
  return (
    <div className="p-6 text-center">
      <Icon className={`w-6 h-6 ${colorClasses[color]} mx-auto mb-2`} />
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-mono text-sm text-slate-800 truncate max-w-[200px]">{value}</span>
    </div>
  );
}
