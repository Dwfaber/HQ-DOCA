import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  MessageSquare,
  Server,
  Bot,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500">Visão geral do DOCA HQ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Clientes Ativos" value="8" icon={Building2} color="orange" trend="+2 este mês" />
        <KPICard title="Receita MRR" value="R$ 6.400" icon={DollarSign} color="emerald" trend="+15%" />
        <KPICard title="Margem Líquida" value="76%" icon={TrendingUp} color="blue" trend="R$ 4.880" />
        <KPICard title="Alertas" value="3" icon={AlertTriangle} color="red" trend="2 críticos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-400" />
            Clientes
          </h2>
          <div className="space-y-3">
            <ClientRow name="Dr. Hair Contagem" status="online" users={3} conversations={45} />
            <ClientRow name="Dr. Hair BH" status="online" users={2} conversations={32} />
            <ClientRow name="NUTRS" status="warning" users={12} conversations={180} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Alertas
          </h2>
          <div className="space-y-3">
            <AlertRow type="critical" message="NUTRS quase estourando budget LLM (92%)" />
            <AlertRow type="warning" message="Domínio vence em 15 dias" />
            <AlertRow type="info" message="Atualização disponível" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Infraestrutura
          </h2>
          <div className="space-y-3">
            <InfraRow name="srv903616 (MCP)" cpu={45} ram={62} status="online" />
            <InfraRow name="srv-nutrs" cpu={28} ram={41} status="online" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Consumo LLM (Janeiro)
          </h2>
          <div className="space-y-3">
            <LLMRow provider="Anthropic" spent={156.40} budget={200} />
            <LLMRow provider="OpenAI" spent={42.20} budget={50} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend }: any) {
  const colors: Record<string, string> = {
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    red: "from-red-500/20 to-red-500/5 border-red-500/30 text-red-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-6 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6" />
        <span className="text-xs text-gray-500">{trend}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
}

function ClientRow({ name, status, users, conversations }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-emerald-400" : "bg-yellow-400"}`} />
        <span className="text-white font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {users}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {conversations}/dia</span>
      </div>
    </div>
  );
}

function AlertRow({ type, message }: any) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };
  const icons: Record<string, string> = { critical: "🔴", warning: "🟡", info: "🔵" };
  return (
    <div className={`p-3 rounded-xl border ${colors[type]}`}>
      <span className="mr-2">{icons[type]}</span>{message}
    </div>
  );
}

function InfraRow({ name, cpu, ram }: any) {
  return (
    <div className="p-3 rounded-xl bg-black/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{name}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">✅ Online</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>CPU</span><span>{cpu}%</span></div>
          <div className="h-2 bg-black/50 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${cpu}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>RAM</span><span>{ram}%</span></div>
          <div className="h-2 bg-black/50 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${ram}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

function LLMRow({ provider, spent, budget }: any) {
  const percent = (spent / budget) * 100;
  const isWarning = percent > 80;
  return (
    <div className="p-3 rounded-xl bg-black/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{provider}</span>
        <span className={`text-sm ${isWarning ? "text-yellow-400" : "text-gray-400"}`}>${spent.toFixed(2)} / ${budget} {isWarning && "⚠️"}</span>
      </div>
      <div className="h-2 bg-black/50 rounded-full"><div className={`h-full rounded-full ${isWarning ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>
    </div>
  );
}
