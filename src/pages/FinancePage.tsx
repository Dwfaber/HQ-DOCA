import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, Loader2, Cpu, Server, Cloud, Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { getRevenues, getCosts, supabase } from "../services/supabase";
import type { HQRevenue, HQCost } from "../services/supabase";

const categoryIcons: Record<string, React.ElementType> = {
  llm: Cpu,
  infra: Server,
  services: Cloud,
  tools: Cloud,
};

const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
  llm: { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
  infra: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  services: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
  tools: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" },
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState<HQRevenue[]>([]);
  const [costs, setCosts] = useState<HQCost[]>([]);
  const [filter, setFilter] = useState<"all" | "mensalidade" | "extra">("all");
  const [editMode, setEditMode] = useState(false);
  
  // Forms
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<HQRevenue | null>(null);
  const [editingCost, setEditingCost] = useState<HQCost | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [revenuesData, costsData] = await Promise.all([
        getRevenues(),
        getCosts()
      ]);
      setRevenues(revenuesData);
      setCosts(costsData);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  // CRUD Revenues
  async function saveRevenue(data: Partial<HQRevenue>) {
    if (editingRevenue) {
      await supabase.from("hq_revenues").update(data).eq("id", editingRevenue.id);
    } else {
      await supabase.from("hq_revenues").insert(data);
    }
    setShowRevenueForm(false);
    setEditingRevenue(null);
    loadData();
  }

  async function deleteRevenue(id: string) {
    if (confirm("Excluir esta receita?")) {
      await supabase.from("hq_revenues").delete().eq("id", id);
      loadData();
    }
  }

  // CRUD Costs
  async function saveCost(data: Partial<HQCost>) {
    if (editingCost) {
      await supabase.from("hq_costs").update(data).eq("id", editingCost.id);
    } else {
      await supabase.from("hq_costs").insert(data);
    }
    setShowCostForm(false);
    setEditingCost(null);
    loadData();
  }

  async function deleteCost(id: string) {
    if (confirm("Excluir este custo?")) {
      await supabase.from("hq_costs").delete().eq("id", id);
      loadData();
    }
  }

  // Calcular métricas
  const mrr = revenues.filter(r => r.type === "mensalidade").reduce((acc, r) => acc + r.value, 0);
  const totalCosts = costs.reduce((acc, c) => {
    const monthlyValue = c.recurrence === "yearly" ? c.value / 12 : c.value;
    return acc + monthlyValue;
  }, 0);
  const netProfit = mrr - totalCosts;
  const margin = mrr > 0 ? (netProfit / mrr) * 100 : 0;

  const costsByCategory = costs.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { items: [], total: 0 };
    const monthlyValue = c.recurrence === "yearly" ? c.value / 12 : c.value;
    acc[c.category].items.push({ ...c, monthlyValue });
    acc[c.category].total += monthlyValue;
    return acc;
  }, {} as Record<string, { items: any[]; total: number }>);

  const filteredRevenues = filter === "all" ? revenues : revenues.filter(r => 
    filter === "mensalidade" ? r.type === "mensalidade" : r.type !== "mensalidade"
  );

  const payingClients = revenues.filter(r => r.type === "mensalidade").length;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">FINANCEIRO.DOCAPERFORMANCE.COM.BR</p>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Financeiro</h1>
            <p className="text-slate-500 mt-2">MRR, custos e margem de lucro</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setEditMode(!editMode)} 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${editMode ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              {editMode ? "✓ Editando" : "Editar"}
            </button>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
      ) : (
        <>
          {/* Métricas Principais */}
          <section className="px-12 mb-8">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-200" />
                  <span className="text-sm text-emerald-100">MRR</span>
                </div>
                <p className="text-4xl font-bold">R${mrr >= 1000 ? (mrr / 1000).toFixed(1) + "k" : mrr}</p>
                <p className="text-emerald-200 text-sm mt-1">Receita Recorrente</p>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingDown className="w-6 h-6 text-rose-200" />
                  <span className="text-sm text-rose-100">mensal</span>
                </div>
                <p className="text-4xl font-bold">R${totalCosts.toFixed(0)}</p>
                <p className="text-rose-200 text-sm mt-1">Custos Totais</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-200" />
                  <span className="text-sm text-blue-100">{margin.toFixed(1)}% margem</span>
                </div>
                <p className="text-4xl font-bold">R${netProfit >= 1000 ? (netProfit / 1000).toFixed(1) + "k" : netProfit.toFixed(0)}</p>
                <p className="text-blue-200 text-sm mt-1">Lucro Líquido</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-4xl font-bold text-slate-900">{payingClients}</p>
                <p className="text-slate-500 text-sm mt-1">Clientes Pagantes</p>
              </div>
            </div>
          </section>

          <section className="px-12 pb-12">
            <div className="grid grid-cols-12 gap-6">
              {/* Lista de Receitas */}
              <div className="col-span-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">Receitas</h2>
                    <div className="flex items-center gap-2">
                      {editMode && (
                        <button onClick={() => { setEditingRevenue(null); setShowRevenueForm(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition">
                          <Plus className="w-4 h-4" /> Adicionar
                        </button>
                      )}
                      <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === "all" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                        Todos
                      </button>
                      <button onClick={() => setFilter("mensalidade")} className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === "mensalidade" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                        Mensalidades
                      </button>
                      <button onClick={() => setFilter("extra")} className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === "extra" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                        Extras
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredRevenues.map((rev) => {
                      const startDate = rev.start_date ? new Date(rev.start_date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) : "-";
                      const isExtra = rev.type !== "mensalidade";
                      
                      return (
                        <div key={rev.id} className={`flex items-center justify-between p-4 rounded-xl transition ${isExtra ? "bg-purple-50" : "bg-slate-50 hover:bg-slate-100"}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${isExtra ? "bg-purple-500" : "bg-gradient-to-br from-slate-600 to-slate-800"}`}>
                              {rev.client_name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{rev.client_name}</h3>
                              <p className="text-xs text-slate-400">Desde {startDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isExtra ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {rev.type}
                            </span>
                            <div className="text-right min-w-[100px]">
                              <p className="font-bold text-slate-900">R${rev.value.toLocaleString("pt-BR")}</p>
                              <p className="text-xs text-slate-400">/mês</p>
                            </div>
                            {editMode && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => { setEditingRevenue(rev); setShowRevenueForm(true); }} className="p-2 rounded-lg hover:bg-white transition">
                                  <Edit2 className="w-4 h-4 text-slate-400" />
                                </button>
                                <button onClick={() => deleteRevenue(rev.id)} className="p-2 rounded-lg hover:bg-red-50 transition">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {filteredRevenues.length === 0 && (
                      <div className="p-8 text-center text-slate-400">
                        Nenhuma receita cadastrada
                        {editMode && <p className="text-sm mt-2">Clique em "Adicionar" para começar</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar - Custos */}
              <div className="col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Custos</h2>
                    {editMode && (
                      <button onClick={() => { setEditingCost(null); setShowCostForm(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-600 transition">
                        <Plus className="w-4 h-4" /> Adicionar
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {Object.entries(costsByCategory).map(([category, data]) => {
                      const Icon = categoryIcons[category] || Cloud;
                      const colors = categoryColors[category] || categoryColors.services;
                      const percentage = totalCosts > 0 ? (data.total / totalCosts) * 100 : 0;

                      return (
                        <div key={category} className={`p-4 rounded-xl ${colors.bg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                              <span className="font-medium text-slate-700 capitalize">{category}</span>
                            </div>
                            <span className={`font-bold ${colors.text}`}>R${data.total.toFixed(0)}</span>
                          </div>
                          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                            <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="mt-2 space-y-1">
                            {data.items.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">{item.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600">R${item.monthlyValue.toFixed(0)}</span>
                                  {editMode && (
                                    <button onClick={() => { setEditingCost(item); setShowCostForm(true); }} className="p-1 rounded hover:bg-white/50">
                                      <Edit2 className="w-3 h-3 text-slate-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(costsByCategory).length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        Nenhum custo cadastrado
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-6 text-white">
                  <h2 className="font-semibold mb-2">Meta MRR</h2>
                  <p className="text-3xl font-bold mb-2">R$10k</p>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((mrr / 10000) * 100, 100)}%` }} />
                  </div>
                  <p className="text-sm text-orange-100">{((mrr / 10000) * 100).toFixed(0)}% alcançado</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modal Receita */}
      {showRevenueForm && (
        <RevenueModal
          revenue={editingRevenue}
          onSave={saveRevenue}
          onClose={() => { setShowRevenueForm(false); setEditingRevenue(null); }}
        />
      )}

      {/* Modal Custo */}
      {showCostForm && (
        <CostModal
          cost={editingCost}
          onSave={saveCost}
          onDelete={editingCost ? () => { deleteCost(editingCost.id); setShowCostForm(false); setEditingCost(null); } : undefined}
          onClose={() => { setShowCostForm(false); setEditingCost(null); }}
        />
      )}
    </div>
  );
}

// Modal de Receita
function RevenueModal({ revenue, onSave, onClose }: { revenue: HQRevenue | null; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    client_name: revenue?.client_name || "",
    client_slug: revenue?.client_slug || "",
    type: revenue?.type || "mensalidade",
    value: revenue?.value || 0,
    start_date: revenue?.start_date || new Date().toISOString().split("T")[0],
    notes: revenue?.notes || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{revenue ? "Editar" : "Nova"} Receita</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
            <input type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value, client_slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Dr. Hair Contagem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="mensalidade">Mensalidade</option>
                <option value="implementação">Implementação</option>
                <option value="extra">Extra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Opcional" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Cancelar</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Custo
function CostModal({ cost, onSave, onDelete, onClose }: { cost: HQCost | null; onSave: (data: any) => void; onDelete?: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    category: cost?.category || "services",
    name: cost?.name || "",
    value: cost?.value || 0,
    recurrence: cost?.recurrence || "monthly",
    notes: cost?.notes || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{cost ? "Editar" : "Novo"} Custo</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Anthropic API" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="llm">LLM / APIs</option>
                <option value="infra">Infraestrutura</option>
                <option value="services">Serviços</option>
                <option value="tools">Ferramentas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recorrência</label>
            <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
              <option value="one-time">Único</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          {onDelete && (
            <button onClick={onDelete} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Cancelar</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
