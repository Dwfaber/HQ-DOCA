import { useState, useEffect } from "react";
import { Users, AlertTriangle, TrendingUp, Clock, Info, Bot, Server, Loader2, Activity, Zap } from "lucide-react";
import { getDashboardStats, getAlerts, getSystems } from "../services/supabase";
import { mcpApiService } from "../services/mcp-api.service";
import type { HQAlert, HQSystem } from "../services/supabase";

export default function PainelPage() {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<HQAlert[]>([]);
  const [systems, setSystems] = useState<HQSystem[]>([]);
  const [mcpHealth, setMcpHealth] = useState<any>(null);
  const [mcpStats, setMcpStats] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [statsData, alertsData, systemsData] = await Promise.all([
        getDashboardStats(),
        getAlerts(false),
        getSystems()
      ]);
      setStats(statsData);
      setAlerts(alertsData.slice(0, 5));
      setSystems(systemsData);

      // Carregar dados do MCP-DOCA
      try {
        const tenants = ["drhair-contagem", "drhair-bh", "drhair-betim"];
        const mcpData = await mcpApiService.getAllTenantsStats(tenants);
        setMcpHealth(mcpData.health);
        setMcpStats(mcpData);
      } catch (e) {
        console.error("MCP API error:", e);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  const systemColors: Record<string, { gradient: string; shadow: string; bg: string }> = {
    drhair: { gradient: "from-rose-400 to-rose-600", shadow: "shadow-rose-500/30", bg: "from-rose-500/10" },
    nutrs: { gradient: "from-emerald-400 to-emerald-600", shadow: "shadow-emerald-500/30", bg: "from-emerald-500/10" },
    default: { gradient: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/30", bg: "from-blue-500/10" }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">HQ.DOCAPERFORMANCE.COM.BR</p>
            <h1 className="text-6xl font-bold text-slate-900 tracking-tight leading-none">
              Command<br /><span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Center</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-slate-400">ULTIMA ATUALIZACAO</p>
            <p className="font-mono text-2xl font-medium text-slate-800">{time.toLocaleTimeString("pt-BR")}</p>
            <div className="flex items-center gap-2 justify-end mt-2">
              <span className={`w-2 h-2 rounded-full ${mcpHealth?.status === "ok" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className={`font-mono text-xs ${mcpHealth?.status === "ok" ? "text-emerald-600" : "text-amber-600"}`}>
                {mcpHealth?.status === "ok" ? "SISTEMAS OPERACIONAIS" : "VERIFICANDO..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
      ) : (
        <>
          <section className="px-12 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
              <div className="grid grid-cols-5 divide-x divide-slate-100">
                <MetricCard label="CLIENTES ATIVOS" value={stats?.clients?.active?.toString().padStart(2, "0") || "00"} sub={`${stats?.clients?.total || 0} total`} positive />
                <MetricCard label="MRR" value={`R$${((stats?.financial?.mrr || 0) / 1000).toFixed(1)}k`} sub="receita mensal" positive />
                <MetricCard label="SALDO LLM" value={`$${(stats?.llm?.balance || 0).toFixed(0)}`} sub={stats?.llm?.lowCredits > 0 ? `${stats.llm.lowCredits} em alerta` : "saudável"} negative={stats?.llm?.lowCredits > 0} />
                <MetricCard label="FOLLOW-UPS" value={mcpStats?.totals?.sent?.toString() || "0"} sub={`${mcpStats?.totals?.pending || 0} pendentes`} />
                <MetricCard label="ALERTAS" value={stats?.alerts?.critical?.toString().padStart(2, "0") || "00"} sub={stats?.alerts?.critical > 0 ? "críticos" : "tudo certo"} negative={stats?.alerts?.critical > 0} />
              </div>
            </div>
          </section>

          <section className="px-12 pb-12">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <SectionHeader title="Sistemas" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {systems.map((system) => {
                    const colors = systemColors[system.slug] || systemColors.default;
                    return (
                      <SystemCard key={system.id} name={system.name} description={system.description || ""} emoji={system.icon || "📦"}
                        gradient={colors.gradient} shadowColor={colors.shadow} bgColor={colors.bg} domain={system.domain} status={system.status} />
                    );
                  })}
                  <AddNewCard />
                </div>

                {/* MCP Health Panel */}
                {mcpHealth && (
                  <>
                    <SectionHeader title="MCP-DOCA Status" />
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                          <Activity className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-slate-800">{mcpHealth.status.toUpperCase()}</p>
                          <p className="text-xs text-slate-500">Status</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-slate-800">{mcpApiService.formatUptime(mcpHealth.uptime)}</p>
                          <p className="text-xs text-slate-500">Uptime</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <Server className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-slate-800">{mcpApiService.formatMemory(mcpHealth.memory.heapUsed)}</p>
                          <p className="text-xs text-slate-500">Memória</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                          <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-slate-800">{Object.keys(mcpStats?.byTenant || {}).length}</p>
                          <p className="text-xs text-slate-500">Tenants</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="col-span-4 space-y-6">
                <div>
                  <SectionHeader title="Alertas" color="red" />
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
                        <p className="text-emerald-600 text-sm">Nenhum alerta pendente 🎉</p>
                      </div>
                    ) : alerts.map((alert) => (
                      <AlertCard key={alert.id} type={alert.severity as "critical" | "warning" | "info"} title={alert.title} description={alert.message || ""} time={formatTimeAgo(alert.created_at)} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeader title="Consumo LLM" color="violet" />
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="space-y-5">
                      {stats?.llm?.providers?.map((provider: any) => (
                        <UsageBar key={provider.provider} label={provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                          current={provider.total_spent} max={provider.total_credit}
                          color={provider.provider === "anthropic" ? "from-orange-400 to-amber-500" : "from-emerald-400 to-teal-500"}
                          isLow={provider.is_low} />
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Saldo Total</span>
                      <span className="font-mono text-lg font-bold text-slate-800">${(stats?.llm?.balance || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="Acoes Rapidas" color="orange" />
                  <div className="grid grid-cols-2 gap-3">
                    <QuickAction icon={Users} label="Clientes" href="/clients" />
                    <QuickAction icon={TrendingUp} label="Financeiro" href="/finance" />
                    <QuickAction icon={Bot} label="Uso LLM" href="/llm" />
                    <QuickAction icon={Server} label="Infra" href="/infra" />
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

function SectionHeader({ title, color = "orange" }: { title: string; color?: string }) {
  const colors: Record<string, string> = { orange: "bg-orange-500", red: "bg-red-500", violet: "bg-violet-500", blue: "bg-blue-500" };
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-6 ${colors[color]} rounded-full`} />
      <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">{title}</h2>
    </div>
  );
}

function MetricCard({ label, value, sub, positive, negative }: { label: string; value: string; sub: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="p-6 text-center">
      <p className="font-mono text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-4xl font-bold ${negative ? "text-red-500" : "text-slate-900"}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${positive ? "text-emerald-600" : negative ? "text-red-500" : "text-slate-400"}`}>{sub}</p>
    </div>
  );
}

function SystemCard({ name, description, emoji, gradient, shadowColor, bgColor, domain, status }: {
  name: string; description: string; emoji: string; gradient: string; shadowColor: string; bgColor: string; domain?: string; status: string;
}) {
  return (
    <a href={domain ? `https://${domain}` : "#"} target="_blank" rel="noopener noreferrer" className="group">
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColor} to-transparent rounded-bl-full`} />
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor}`}>
            <span className="text-2xl">{emoji}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span className={`font-mono text-xs ${status === "active" ? "text-emerald-600" : "text-slate-400"}`}>{status === "active" ? "LIVE" : "OFF"}</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{name}</h3>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        {domain && <p className="text-xs text-slate-400 font-mono truncate">{domain}</p>}
      </div>
    </a>
  );
}

function AddNewCard() {
  return (
    <div className="group cursor-pointer">
      <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all min-h-[200px]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:border-orange-400 group-hover:shadow-lg transition-all">
          <span className="text-2xl text-slate-300 group-hover:text-orange-500">+</span>
        </div>
        <p className="font-semibold text-slate-400 group-hover:text-orange-500">Novo Sistema</p>
      </div>
    </div>
  );
}

function AlertCard({ type, title, description, time }: { type: "critical" | "warning" | "info"; title: string; description: string; time: string }) {
  const styles = {
    critical: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-500", title: "text-red-800", desc: "text-red-600", time: "text-red-400" },
    warning: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-500", title: "text-amber-800", desc: "text-amber-600", time: "text-amber-400" },
    info: { bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-500", title: "text-blue-800", desc: "text-blue-600", time: "text-blue-400" },
  };
  const s = styles[type];
  const icons = { critical: AlertTriangle, warning: Clock, info: Info };
  const Icon = icons[type];
  return (
    <div className={`${s.bg} rounded-xl p-4 border ${s.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}><Icon className="w-4 h-4 text-white" /></div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${s.title} text-sm`}>{title}</p>
          <p className={`text-xs ${s.desc} mt-0.5`}>{description}</p>
        </div>
        <span className={`font-mono text-[10px] ${s.time}`}>{time}</span>
      </div>
    </div>
  );
}

function UsageBar({ label, current, max, color, isLow }: { label: string; current: number; max: number; color: string; isLow?: boolean }) {
  const percent = max > 0 ? ((max - current) / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`font-mono text-sm ${isLow ? "text-red-500" : "text-slate-400"}`}>${(max - current).toFixed(0)} / ${max.toFixed(0)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${isLow ? "from-red-400 to-red-500" : color}`} style={{ width: `${percent}%` }} />
      </div>
      {isLow && <p className="text-xs text-red-500 mt-1">⚠️ Saldo baixo!</p>}
    </div>
  );
}

function QuickAction({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <a href={href} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all text-center group block">
      <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-orange-100">
        <Icon className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover:text-orange-500">{label}</span>
    </a>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}
