import { useEffect, useState } from "react";
import { Bot, RefreshCw, Loader2, DollarSign, Zap, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { getApiBalance, getUsageByClient, updateApiCredit } from "../services/supabase";
import type { ApiBalance } from "../services/supabase";

interface ClientUsage {
  name: string;
  provider: string;
  tokens: number;
  cost: number;
  requests: number;
}

export default function LLMUsagePage() {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<ApiBalance[]>([]);
  const [clients, setClients] = useState<ClientUsage[]>([]);
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editCredit, setEditCredit] = useState("");
  const [editThreshold, setEditThreshold] = useState("");

  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      if (period === "day") start.setDate(end.getDate() - 1);
      else if (period === "week") start.setDate(end.getDate() - 7);
      else start.setMonth(end.getMonth() - 1);

      const [balanceData, usageData] = await Promise.all([
        getApiBalance(),
        getUsageByClient(start.toISOString().split("T")[0], end.toISOString().split("T")[0]),
      ]);
      setBalances(balanceData || []);
      setClients(usageData || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCredit(provider: string) {
    try {
      await updateApiCredit(provider, parseFloat(editCredit), parseFloat(editThreshold));
      setEditingProvider(null);
      loadData();
    } catch (err) {
      alert("Erro ao salvar");
    }
  }

  const totalCredit = balances.reduce((acc, b) => acc + b.total_credit, 0);
  const totalSpent = balances.reduce((acc, b) => acc + b.total_spent, 0);
  const totalBalance = balances.reduce((acc, b) => acc + b.balance, 0);
  const lowBalanceCount = balances.filter(b => b.is_low).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-orange-400" />Consumo LLM
          </h1>
          <p className="text-gray-500">Monitoramento de uso e custos com IA</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value as "day"|"week"|"month")} className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none">
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
          </select>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Crédito Total" value={`$${totalCredit.toFixed(2)}`} icon={DollarSign} color="blue" />
        <StatCard label="Gasto Total" value={`$${totalSpent.toFixed(2)}`} icon={Zap} color="orange" />
        <StatCard label="Saldo Restante" value={`$${totalBalance.toFixed(2)}`} icon={DollarSign} color={totalBalance < 50 ? "red" : "emerald"} />
        <StatCard label="Alertas" value={lowBalanceCount.toString()} icon={AlertTriangle} color={lowBalanceCount > 0 ? "red" : "emerald"} subvalue={lowBalanceCount > 0 ? "saldo baixo!" : "ok"} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Saldo por Provider</h2>
            {balances.length === 0 ? (
              <p className="text-gray-500">Nenhum provider configurado.</p>
            ) : (
              <div className="space-y-4">
                {balances.map((b) => (
                  <div key={b.provider} className={`p-4 rounded-xl ${b.is_low ? "bg-red-500/10 border border-red-500/30" : "bg-black/30"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.provider === "anthropic" ? "bg-orange-500/20" : "bg-emerald-500/20"}`}>
                          <Bot className={`w-5 h-5 ${b.provider === "anthropic" ? "text-orange-400" : "text-emerald-400"}`} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold capitalize">{b.provider}</h3>
                          {b.is_low && <p className="text-xs text-red-400">⚠️ Saldo baixo!</p>}
                        </div>
                      </div>
                      {editingProvider === b.provider ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editCredit} onChange={(e) => setEditCredit(e.target.value)} placeholder="Crédito" className="w-24 h-8 px-2 rounded bg-black/50 border border-white/20 text-white text-sm" />
                          <input type="number" value={editThreshold} onChange={(e) => setEditThreshold(e.target.value)} placeholder="Alerta" className="w-20 h-8 px-2 rounded bg-black/50 border border-white/20 text-white text-sm" />
                          <button onClick={() => handleSaveCredit(b.provider)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingProvider(null)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xl font-bold ${b.is_low ? "text-red-400" : "text-white"}`}>${b.balance.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">de ${b.total_credit.toFixed(2)}</p>
                          </div>
                          <button onClick={() => { setEditingProvider(b.provider); setEditCredit(b.total_credit.toString()); setEditThreshold(b.alert_threshold.toString()); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${b.is_low ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(0, Math.min(100, (b.balance / b.total_credit) * 100))}%` }} />
                      </div>
                      <span className="text-sm text-gray-400">${b.total_spent.toFixed(2)} gasto</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Uso por Cliente</h2>
            {clients.length === 0 ? (
              <p className="text-gray-500">Nenhum uso registrado no período.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tokens</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Requests</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map((c, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-medium">{c.name || "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${c.provider === "anthropic" ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}>{c.provider}</span></td>
                      <td className="px-4 py-3 text-gray-400">{formatTokens(c.tokens)}</td>
                      <td className="px-4 py-3 text-gray-400">{c.requests}</td>
                      <td className="px-4 py-3 text-white font-medium">${c.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subvalue }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string; subvalue?: string }) {
  const colors: Record<string, string> = {
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    red: "from-red-500/20 to-red-500/5 border-red-500/30 text-red-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {subvalue && <p className="text-xs text-gray-500 mt-1">{subvalue}</p>}
    </div>
  );
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
}
