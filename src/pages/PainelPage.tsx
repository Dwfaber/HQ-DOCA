import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Info,
} from "lucide-react";

export default function PainelPage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono text-xs text-slate-400 tracking-widest mb-2">
              PAINEL.DOCAPERFORMANCE.COM.BR
            </p>
            <h1 className="text-6xl font-bold text-slate-900 tracking-tight leading-none">
              Command<br /><span className="gradient-text">Center</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="mono text-sm text-slate-400">ULTIMA ATUALIZACAO</p>
            <p className="mono text-2xl font-medium text-slate-800">
              {time.toLocaleTimeString("pt-BR")}
            </p>
            <div className="flex items-center gap-2 justify-end mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse" />
              <span className="mono text-xs text-emerald-600">SISTEMAS OPERACIONAIS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <section className="px-12 mb-8">
        <div className="gradient-border rounded-2xl">
          <div className="bg-white rounded-2xl p-1">
            <div className="grid grid-cols-4 divide-x divide-slate-100">
              <MetricCard label="CLIENTES ATIVOS" value="08" sub="+2 este mes" positive />
              <MetricCard label="RECEITA MRR" value="R$6.4k" sub="↑ 15%" positive />
              <MetricCard label="UPTIME" value="99.9%" sub="ultimos 30 dias" />
              <MetricCard label="ALERTAS" value="03" sub="2 criticos" negative />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="px-12 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Systems Panel */}
          <div className="col-span-8">
            <SectionHeader title="Sistemas" color="orange" />
            <div className="grid grid-cols-2 gap-4">
              <SystemCard
                name="Nutr's"
                description="Cardapios Inteligentes"
                emoji="🍽️"
                gradient="from-emerald-400 to-emerald-600"
                shadowColor="shadow-emerald-500/30"
                bgColor="from-emerald-500/10"
                stats={[
                  { label: "USUARIOS", value: "25" },
                  { label: "CARDAPIOS/DIA", value: "180" },
                ]}
              />
              <SystemCard
                name="Dr. Hair"
                description="Automacao WhatsApp"
                emoji="💇"
                gradient="from-rose-400 to-rose-600"
                shadowColor="shadow-rose-500/30"
                bgColor="from-rose-500/10"
                stats={[
                  { label: "FRANQUIAS", value: "3" },
                  { label: "CONVERSAS/DIA", value: "77" },
                ]}
              />
              <SystemCard
                name="Auth Center"
                description="Gestao de Acessos"
                emoji="🔐"
                gradient="from-blue-400 to-blue-600"
                shadowColor="shadow-blue-500/30"
                bgColor="from-blue-500/10"
                stats={[
                  { label: "TOTAL USERS", value: "156" },
                  { label: "ORGANIZATIONS", value: "8" },
                ]}
              />
              <AddNewCard />
            </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-4 space-y-6">
            {/* Alerts */}
            <div>
              <SectionHeader title="Alertas" color="red" />
              <div className="space-y-3">
                <AlertCard type="critical" title="Budget LLM critico" description="NUTRS em 92% do limite" time="2min" />
                <AlertCard type="warning" title="Dominio expirando" description="Renovar em 15 dias" time="1h" />
                <AlertCard type="info" title="Atualizacao disponivel" description="Nova versao do MCP" time="3h" />
              </div>
            </div>

            {/* LLM Usage */}
            <div>
              <SectionHeader title="Consumo LLM" color="violet" />
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="space-y-5">
                  <UsageBar label="Anthropic" current={156} max={200} color="from-orange-400 to-amber-500" />
                  <UsageBar label="OpenAI" current={42} max={50} color="from-emerald-400 to-teal-500" />
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Janeiro</span>
                  <span className="mono text-lg font-bold text-slate-800">$198.60</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <SectionHeader title="Acoes Rapidas" color="orange" />
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={Users} label="Novo User" />
                <QuickAction icon={TrendingUp} label="Relatorio" />
                <QuickAction icon={Building2} label="Cliente" />
                <QuickAction icon={AlertTriangle} label="Alertas" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-components

function SectionHeader({ title, color }: { title: string; color: string }) {
  const colors: Record<string, string> = {
    orange: "bg-[#ff6b2c]",
    red: "bg-red-500",
    violet: "bg-violet-500",
    blue: "bg-blue-500",
  };
  
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-6 ${colors[color]} rounded-full`} />
      <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">{title}</h2>
    </div>
  );
}

function MetricCard({ label, value, sub, positive, negative }: { 
  label: string; 
  value: string; 
  sub: string; 
  positive?: boolean; 
  negative?: boolean; 
}) {
  return (
    <div className="p-6 text-center">
      <p className="mono text-xs text-slate-400 mb-1">{label}</p>
      <p className={`metric-number text-4xl font-bold ${negative ? "text-red-500" : "text-slate-900"}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${positive ? "text-emerald-600" : negative ? "text-red-500" : "text-slate-400"}`}>{sub}</p>
    </div>
  );
}

function SystemCard({ name, description, emoji, gradient, shadowColor, bgColor, stats }: {
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  shadowColor: string;
  bgColor: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <a href="#" className="hover-lift card-shine group">
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColor} to-transparent rounded-bl-full`} />
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor}`}>
            <span className="text-2xl">{emoji}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse" />
            <span className="mono text-xs text-emerald-600">LIVE</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{name}</h3>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="mono text-xs text-slate-400">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </a>
  );
}

function AddNewCard() {
  return (
    <div className="hover-lift group cursor-pointer">
      <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-[#ff6b2c] hover:bg-orange-50/50 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:border-[#ff6b2c] group-hover:shadow-lg transition-all">
          <span className="text-2xl text-slate-300 group-hover:text-[#ff6b2c]">+</span>
        </div>
        <p className="font-semibold text-slate-400 group-hover:text-[#ff6b2c]">Novo Sistema</p>
      </div>
    </div>
  );
}

function AlertCard({ type, title, description, time }: { 
  type: "critical" | "warning" | "info"; 
  title: string; 
  description: string; 
  time: string; 
}) {
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
        <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${s.title} text-sm`}>{title}</p>
          <p className={`text-xs ${s.desc} mt-0.5`}>{description}</p>
        </div>
        <span className={`mono text-[10px] ${s.time}`}>{time}</span>
      </div>
    </div>
  );
}

function UsageBar({ label, current, max, color }: { 
  label: string; 
  current: number; 
  max: number; 
  color: string; 
}) {
  const percent = (current / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="mono text-sm text-slate-400">${current} / ${max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#ff6b2c] hover:shadow-lg transition-all text-center group">
      <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-orange-100">
        <Icon className="w-5 h-5 text-slate-500 group-hover:text-[#ff6b2c]" />
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover:text-[#ff6b2c]">{label}</span>
    </button>
  );
}