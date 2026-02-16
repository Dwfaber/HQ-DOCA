// HQ-DOCA - Hostinger Integration Panel
// Componente para exibir dados do Hostinger no Command Center

import { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Shield,
  CreditCard,
  Activity,
  ChevronRight,
  AlertCircle,
  Info
} from 'lucide-react';

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

interface DashboardData {
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

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.docaperformance.com.br';

export default function HostingerPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/hostinger/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao carregar dados');
      
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'running':
        return 'text-emerald-500';
      case 'pending':
      case 'starting':
        return 'text-amber-500';
      default:
        return 'text-red-500';
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Erro ao carregar Hostinger</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Hostinger</h2>
            <p className="text-xs text-slate-500">
              Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Globe className="w-4 h-4" />
            Domínios
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data?.summary.totalDomains || 0}
          </div>
          {data?.summary.expiringDomains ? (
            <p className="text-xs text-amber-600 mt-1">
              {data.summary.expiringDomains} expirando em breve
            </p>
          ) : (
            <p className="text-xs text-emerald-600 mt-1">Todos em dia</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Server className="w-4 h-4" />
            VPS
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data?.summary.activeVPS || 0}/{data?.summary.totalVPS || 0}
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            {data?.summary.activeVPS === data?.summary.totalVPS ? 'Todas ativas' : 'Verificar status'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <CreditCard className="w-4 h-4" />
            Subscriptions
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data?.summary.activeSubscriptions || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Ativas</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </div>
          <div className="flex items-baseline gap-2">
            {data?.summary.criticalAlerts ? (
              <span className="text-2xl font-bold text-red-600">
                {data.summary.criticalAlerts}
              </span>
            ) : null}
            {data?.summary.warningAlerts ? (
              <span className={`text-2xl font-bold ${data?.summary.criticalAlerts ? 'text-amber-500' : 'text-amber-600'}`}>
                {data?.summary.criticalAlerts ? `+${data.summary.warningAlerts}` : data.summary.warningAlerts}
              </span>
            ) : null}
            {!data?.summary.criticalAlerts && !data?.summary.warningAlerts && (
              <span className="text-2xl font-bold text-emerald-600">0</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {data?.summary.criticalAlerts ? 'Ação necessária' : 'Tudo certo'}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ALERTAS
          </h3>
          <div className="space-y-2">
            {data.alerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.id}
                className={`rounded-xl border p-3 flex items-center gap-3 ${getAlertBg(alert.type)}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                  <p className="text-xs text-slate-600 truncate">{alert.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domains & VPS Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Domínios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              DOMÍNIOS
            </h3>
            <a href="https://hpanel.hostinger.com/domains" target="_blank" rel="noopener noreferrer" 
               className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Ver todos <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {data?.domains.slice(0, 5).map((domain) => (
              <div key={domain.id} className="p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  domain.daysUntilExpiry <= 15 ? 'bg-red-500' :
                  domain.daysUntilExpiry <= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{domain.domain}</p>
                  <p className="text-xs text-slate-500">
                    {domain.daysUntilExpiry > 0 
                      ? `Expira em ${domain.daysUntilExpiry} dias`
                      : 'Expirado'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {domain.autoRenew && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      Auto
                    </span>
                  )}
                  <Shield className={`w-4 h-4 ${domain.status === 'active' ? 'text-emerald-500' : 'text-slate-300'}`} />
                </div>
              </div>
            ))}
            {(!data?.domains || data.domains.length === 0) && (
              <div className="p-4 text-center text-slate-500 text-sm">
                Nenhum domínio encontrado
              </div>
            )}
          </div>
        </div>

        {/* VPS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Server className="w-4 h-4" />
              VPS
            </h3>
            <a href="https://hpanel.hostinger.com/vps" target="_blank" rel="noopener noreferrer"
               className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Ver todas <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {data?.vpsList.map((vps) => (
              <div key={vps.id} className="p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  vps.status === 'running' || vps.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{vps.name}</p>
                  <p className="text-xs text-slate-500">{vps.ip} • {vps.datacenter}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${getStatusColor(vps.status)}`}>
                    {vps.status.toUpperCase()}
                  </span>
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
            {(!data?.vpsList || data.vpsList.length === 0) && (
              <div className="p-4 text-center text-slate-500 text-sm">
                Nenhuma VPS encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
