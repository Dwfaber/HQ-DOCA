// HQ-DOCA - Command Center (PainelPage)
// Versão atualizada com integração Hostinger

import { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Server,
  Globe,
  MessageSquare,
  Bot,
  Plus
} from 'lucide-react';
import HostingerPanel from '../components/HostingerPanel';

interface SystemCard {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  shadowColor: string;
  status: 'live' | 'offline' | 'maintenance';
  stats?: {
    label1: string;
    value1: string | number;
    label2: string;
    value2: string | number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}

interface LLMUsage {
  provider: string;
  used: number;
  limit: number;
  color: string;
}

const systems: SystemCard[] = [
  {
    id: "nutrs",
    name: "Nutr's",
    description: "Cardapios Inteligentes",
    emoji: "🥗",
    gradient: "from-emerald-400 to-emerald-600",
    shadowColor: "shadow-emerald-500/30",
    status: "live",
    stats: {
      label1: "USUARIOS",
      value1: 25,
      label2: "CARDAPIOS/DIA",
      value2: 180
    }
  },
  {
    id: "drhair",
    name: "Dr. Hair",
    description: "Automacao WhatsApp",
    emoji: "💇",
    gradient: "from-rose-400 to-rose-600",
    shadowColor: "shadow-rose-500/30",
    status: "live",
    stats: {
      label1: "FRANQUIAS",
      value1: 3,
      label2: "CONVERSAS/DIA",
      value2: 77
    }
  },
  {
    id: "auth",
    name: "Auth Center",
    description: "Gestao de Acessos",
    emoji: "🔐",
    gradient: "from-blue-400 to-blue-600",
    shadowColor: "shadow-blue-500/30",
    status: "live"
  }
];

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Budget LLM critico",
    message: "NUTRS em 92% do limite",
    time: "2m1n"
  },
  {
    id: "2",
    type: "warning",
    title: "Dominio expirando",
    message: "Renovar em 15 dias",
    time: "1h"
  },
  {
    id: "3",
    type: "info",
    title: "Atualizacao disponivel",
    message: "Nova versao do MCP",
    time: "3h"
  }
];

const llmUsage: LLMUsage[] = [
  { provider: "Anthropic", used: 156, limit: 200, color: "bg-orange-500" },
  { provider: "OpenAI", used: 42, limit: 50, color: "bg-emerald-500" }
];

export default function PainelPage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'hostinger'>('overview');

  // Stats do dashboard
  const stats = {
    clientesAtivos: 8,
    clientesDelta: "+2 este mes",
    receitaMRR: "R$6.4k",
    receitaDelta: "↑ 15%",
    uptime: "99.9%",
    uptimePeriod: "ultimos 30 dias",
    alertas: 3,
    alertasCriticos: 2
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 hover:bg-red-100';
      case 'warning': return 'bg-amber-50 hover:bg-amber-100';
      default: return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-slate-400 tracking-widest mb-1">
            PAINEL.DOCAPERFORMANCE.COM.BR
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Command
          </h1>
          <h2 className="text-4xl font-light text-orange-500">
            Center
          </h2>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-slate-400 tracking-widest">ULTIMA ATUALIZACAO</p>
          <p className="text-3xl font-mono text-slate-900">
            {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-center gap-2 justify-end mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">SISTEMAS OPERACIONAIS</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 tracking-widest mb-2">CLIENTES ATIVOS</p>
          <p className="text-4xl font-bold text-slate-900">{stats.clientesAtivos.toString().padStart(2, '0')}</p>
          <p className="text-sm text-emerald-600 mt-1">{stats.clientesDelta}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 tracking-widest mb-2">RECEITA MRR</p>
          <p className="text-4xl font-bold text-slate-900">{stats.receitaMRR}</p>
          <p className="text-sm text-emerald-600 mt-1">{stats.receitaDelta}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 tracking-widest mb-2">UPTIME</p>
          <p className="text-4xl font-bold text-slate-900">{stats.uptime}</p>
          <p className="text-sm text-slate-500 mt-1">{stats.uptimePeriod}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 tracking-widest mb-2">ALERTAS</p>
          <p className="text-4xl font-bold text-orange-500">{stats.alertas.toString().padStart(2, '0')}</p>
          <p className="text-sm text-red-500 mt-1">{stats.alertasCriticos} criticos</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'overview' 
              ? 'bg-slate-900 text-white' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Visão Geral
          </span>
        </button>
        <button
          onClick={() => setActiveTab('hostinger')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'hostinger' 
              ? 'bg-purple-600 text-white' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Hostinger
          </span>
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Sistemas Column */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-xs text-slate-400 tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full" />
              SISTEMAS
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {systems.map((system) => (
                <div 
                  key={system.id}
                  className={`relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden hover:shadow-lg transition-all cursor-pointer`}
                >
                  {/* Background gradient blob */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${system.gradient} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${system.gradient} ${system.shadowColor} shadow-lg flex items-center justify-center text-2xl`}>
                        {system.emoji}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">LIVE</span>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-slate-900">{system.name}</h4>
                    <p className="text-sm text-slate-500 mb-4">{system.description}</p>
                    
                    {system.stats && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400">{system.stats.label1}</p>
                          <p className="text-lg font-bold text-slate-900">{system.stats.value1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{system.stats.label2}</p>
                          <p className="text-lg font-bold text-slate-900">{system.stats.value2}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add New System Card */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[200px] hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-medium text-slate-600">Novo Sistema</p>
                <p className="text-xs text-slate-400">Clique para adicionar</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alertas */}
            <div>
              <h3 className="text-xs text-slate-400 tracking-widest flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-red-500 rounded-full" />
                ALERTAS
              </h3>
              <div className="space-y-2">
                {mockAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`rounded-xl p-3 flex items-start gap-3 transition-colors cursor-pointer ${getAlertBg(alert.type)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                      <p className="text-xs text-slate-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-slate-400">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumo LLM */}
            <div>
              <h3 className="text-xs text-slate-400 tracking-widest flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-orange-500 rounded-full" />
                CONSUMO LLM
              </h3>
              <div className="space-y-3">
                {llmUsage.map((llm) => (
                  <div key={llm.provider} className="bg-white rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{llm.provider}</span>
                      <span className="text-sm text-slate-600">${llm.used} / ${llm.limit}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${llm.color} rounded-full transition-all`}
                        style={{ width: `${(llm.used / llm.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Hostinger Tab Content */
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <HostingerPanel />
        </div>
      )}
    </div>
  );
}
