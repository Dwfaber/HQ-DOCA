import { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  CreditCard,
  Activity,
  AlertCircle,
  Info
} from 'lucide-react';
import { hostingerService } from '../services/hostinger.service';
import type { DashboardData } from '../services/hostinger.service';

export default function HostingerPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await hostingerService.getDashboardData();
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
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-400">Erro ao carregar Hostinger</p>
            <p className="text-sm text-red-400/70">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="ml-auto px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm"
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
            <h2 className="text-lg font-semibold text-white">Hostinger</h2>
            <p className="text-xs text-gray-500">
              Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Globe className="w-4 h-4" />
            Domínios
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary.totalDomains || 0}
          </div>
          {data?.summary.expiringDomains ? (
            <p className="text-xs text-amber-400 mt-1">
              {data.summary.expiringDomains} expirando
            </p>
          ) : (
            <p className="text-xs text-emerald-400 mt-1">Todos em dia</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Server className="w-4 h-4" />
            VPS
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary.activeVPS || 0}/{data?.summary.totalVPS || 0}
          </div>
          <p className="text-xs text-emerald-400 mt-1">
            {data?.summary.activeVPS === data?.summary.totalVPS ? 'Todas ativas' : 'Verificar'}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <CreditCard className="w-4 h-4" />
            Subscriptions
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.summary.activeSubscriptions || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Ativas</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">
              {data?.summary.criticalAlerts || 0}
            </span>
            <span className="text-lg font-bold text-amber-400">
              +{data?.summary.warningAlerts || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {data?.summary.criticalAlerts ? 'Ação necessária' : 'Tudo certo'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ALERTAS
          </h3>
          {data.alerts.slice(0, 5).map((alert) => (
            <div 
              key={alert.id}
              className={`rounded-xl border p-3 flex items-center gap-3 ${getAlertBg(alert.type)}`}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{alert.title}</p>
                <p className="text-xs text-gray-400">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Domains & VPS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400">DOMÍNIOS</h3>
            <a href="https://hpanel.hostinger.com/domains" target="_blank" rel="noopener noreferrer" 
               className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Ver todos <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
            {data?.domains.slice(0, 5).map((domain) => (
              <div key={domain.id} className="p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  domain.daysUntilExpiry <= 15 ? 'bg-red-500' :
                  domain.daysUntilExpiry <= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{domain.domain}</p>
                  <p className="text-xs text-gray-500">
                    {domain.daysUntilExpiry > 0 ? `Expira em ${domain.daysUntilExpiry} dias` : 'Expirado'}
                  </p>
                </div>
                {domain.autoRenew && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Auto</span>
                )}
                <Shield className={`w-4 h-4 ${domain.status === 'active' ? 'text-emerald-500' : 'text-gray-600'}`} />
              </div>
            ))}
            {(!data?.domains || data.domains.length === 0) && (
              <div className="p-4 text-center text-gray-500 text-sm">Nenhum domínio</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400">VPS</h3>
            <a href="https://hpanel.hostinger.com/vps" target="_blank" rel="noopener noreferrer"
               className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Ver todas <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
            {data?.vpsList.map((vps) => (
              <div key={vps.id} className="p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  vps.status === 'running' || vps.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{vps.name}</p>
                  <p className="text-xs text-gray-500">{vps.ip} • {vps.datacenter}</p>
                </div>
                <span className={`text-xs font-medium ${
                  vps.status === 'running' || vps.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {vps.status.toUpperCase()}
                </span>
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
            ))}
            {(!data?.vpsList || data.vpsList.length === 0) && (
              <div className="p-4 text-center text-gray-500 text-sm">Nenhuma VPS</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
