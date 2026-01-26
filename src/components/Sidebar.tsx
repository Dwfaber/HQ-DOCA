import { useLogto } from "@logto/react";
import {
  LayoutGrid,
  Gauge,
  Building2,
  Users,
  Cpu,
  Server,
  Wallet,
  LogOut,
} from "lucide-react";
import type { PageId } from "../App";

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; icon: React.ElementType; label: string }[] = [
  { id: "hub", icon: LayoutGrid, label: "Hub" },
  { id: "painel", icon: Gauge, label: "Painel" },
  { id: "clients", icon: Building2, label: "Clientes" },
  { id: "users", icon: Users, label: "Usuarios" },
  { id: "llm", icon: Cpu, label: "LLM" },
  { id: "infra", icon: Server, label: "Infra" },
  { id: "finance", icon: Wallet, label: "Financeiro" },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { signOut, getIdTokenClaims } = useLogto();
  
  const handleSignOut = async () => {
    const claims = await getIdTokenClaims();
    const userName = claims?.name || claims?.email || 'D';
    console.log('Signing out user:', userName);
    signOut('https://hq.docaperformance.com.br');
  };

  return (
    <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 fixed h-full z-50">
      {/* Logo */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-8">
        <span className="text-xl">🐙</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                active 
                  ? "bg-orange-50 text-[#ff6b2c]" 
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#ff6b2c] rounded-r-full" />
              )}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="space-y-2">
        <button 
          onClick={handleSignOut}
          title="Sair"
          className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-110 transition-transform">
          D
        </div>
      </div>
    </aside>
  );
}