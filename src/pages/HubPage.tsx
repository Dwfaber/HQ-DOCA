import { ArrowUpRight } from "lucide-react";

interface SystemCard {
  id: string;
  name: string;
  description: string;
  url: string;
  emoji: string;
  gradient: string;
  shadowColor: string;
}

const systems: SystemCard[] = [
  {
    id: "nutrs",
    name: "Nutr's",
    description: "Cardapios Inteligentes",
    url: "https://cardapio.docaperformance.com.br",
    emoji: "🍽️",
    gradient: "from-emerald-400 to-emerald-600",
    shadowColor: "shadow-emerald-500/30",
  },
  {
    id: "drhair",
    name: "Dr. Hair",
    description: "Automacao WhatsApp",
    url: "https://mcp.docaperformance.com.br",
    emoji: "💇",
    gradient: "from-rose-400 to-rose-600",
    shadowColor: "shadow-rose-500/30",
  },
  {
    id: "auth",
    name: "Auth Center",
    description: "Gestao de Acessos",
    url: "https://auth.docaperformance.com.br",
    emoji: "🔐",
    gradient: "from-blue-400 to-blue-600",
    shadowColor: "shadow-blue-500/30",
  },
];

function SystemCardComponent({ system }: { system: SystemCard }) {
  return (
    <a
      href={system.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover-lift card-shine group"
    >
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden">
        <div 
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${system.gradient} opacity-10 rounded-bl-full`} 
        />
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div 
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${system.gradient} flex items-center justify-center shadow-lg ${system.shadowColor}`}
          >
            <span className="text-2xl">{system.emoji}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse" />
            <span className="mono text-xs text-emerald-600">LIVE</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{system.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{system.description}</p>
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
      <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-[#ff6b2c] hover:bg-orange-50/50 transition-all min-h-[200px]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:border-[#ff6b2c] group-hover:shadow-lg transition-all">
          <span className="text-2xl text-slate-300 group-hover:text-[#ff6b2c]">+</span>
        </div>
        <p className="font-semibold text-slate-400 group-hover:text-[#ff6b2c]">Novo Sistema</p>
        <p className="text-xs text-slate-300 mt-1">Clique para adicionar</p>
      </div>
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="min-h-screen">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono text-xs text-slate-400 tracking-widest mb-2">HQ.DOCAPERFORMANCE.COM.BR</p>
            <h1 className="text-6xl font-bold text-slate-900 tracking-tight leading-none">
              Hub<br /><span className="gradient-text">Launcher</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="mono text-sm text-slate-400">STATUS</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse" />
              <span className="mono text-xs text-emerald-600">TODOS OS SISTEMAS ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <section className="px-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <SystemCardComponent key={system.id} system={system} />
          ))}
          <AddNewCard />
        </div>
      </section>

      <footer className="px-12 py-8 border-t border-slate-200 mt-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">DOCA Performance 2026</p>
          <p className="mono text-xs text-slate-300">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}