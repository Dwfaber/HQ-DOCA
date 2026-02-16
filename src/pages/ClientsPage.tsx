import { useState, useEffect } from "react";
import { Building2, Phone, MapPin, RefreshCw, Plus, Loader2, MessageSquare, ChevronRight, Clock, Zap, Bot } from "lucide-react";
import { getClients } from "../services/supabase";
import type { Tenant } from "../services/supabase";

export default function ClientsPage() {
  const [clients, setClients] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Tenant | null>(null);
  

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const clientsData = await getClients();
      setClients(clientsData);

      // Carregar stats do MCP para cada cliente
      try {
      } catch {}
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  const activeClients = clients.filter(c => c.active).length;

  const planColors: Record<string, { bg: string; text: string }> = {
    starter: { bg: "bg-slate-100", text: "text-slate-600" },
    pro: { bg: "bg-blue-100", text: "text-blue-600" },
    premium: { bg: "bg-purple-100", text: "text-purple-600" },
    enterprise: { bg: "bg-orange-100", text: "text-orange-600" },
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="px-12 pt-12 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">CLIENTES.DOCAPERFORMANCE.COM.BR</p>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Clientes</h1>
            <p className="text-slate-500 mt-2">Tenants e organizações</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition">
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          </div>
        </div>
      </header>

      <section className="px-12 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-1">
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            <div className="p-6 text-center">
              <p className="font-mono text-xs text-slate-400 mb-1">TOTAL TENANTS</p>
              <p className="text-4xl font-bold text-slate-900">{clients.length}</p>
            </div>
            <div className="p-6 text-center">
              <p className="font-mono text-xs text-slate-400 mb-1">ATIVOS</p>
              <p className="text-4xl font-bold text-emerald-600">{activeClients}</p>
            </div>
            <div className="p-6 text-center">
              <p className="font-mono text-xs text-slate-400 mb-1">COM IA ATIVA</p>
              <p className="text-4xl font-bold text-blue-600">{clients.filter(c => c.agent_config?.enabled).length}</p>
            </div>
            <div className="p-6 text-center">
              <p className="font-mono text-xs text-slate-400 mb-1">COM WHATSAPP</p>
              <p className="text-4xl font-bold text-emerald-600">{clients.filter(c => c.zapi_config || c.agent_config?.whatsapp_provider).length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-12 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Lista de Clientes */}
          <div className="col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-orange-500 rounded-full" />
              <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">Lista de Tenants</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {clients.map((client) => {
                  const colors = planColors[client.plan] || planColors.starter;
                  return (
                    <div key={client.id} onClick={() => setSelectedClient(client)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedClient?.id === client.id ? "border-orange-400 shadow-md" : "border-slate-200"}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${client.active ? "bg-gradient-to-br from-orange-400 to-rose-500" : "bg-slate-300"}`}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{client.name}</h3>
                            <p className="text-xs text-slate-400">{client.specialty || client.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {client.agent_config?.enabled && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="IA Ativa" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {client.plan}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {client.agent_config?.ai_provider || "openai"} / {client.agent_config?.ai_model || "gpt-4o"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
                {clients.length === 0 && (
                  <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">Nenhum tenant cadastrado</div>
                )}
              </div>
            )}
          </div>

          {/* Detalhes do Cliente */}
          <div className="col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">Detalhes</h2>
            </div>

            {selectedClient ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${selectedClient.active ? "bg-gradient-to-br from-orange-400 to-rose-500" : "bg-slate-300"}`}>
                        {selectedClient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
                        <p className="text-slate-500">{selectedClient.slug}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedClient.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {selectedClient.active ? "Ativo" : "Inativo"}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[selectedClient.plan]?.bg || "bg-slate-100"} ${planColors[selectedClient.plan]?.text || "text-slate-600"}`}>
                            Plano {selectedClient.plan}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {selectedClient.phone && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <span>{selectedClient.phone}</span>
                        </div>
                      )}
                      {selectedClient.address && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-sm">{selectedClient.address}</span>
                        </div>
                      )}
                      {selectedClient.specialty && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <Zap className="w-5 h-5 text-slate-400" />
                          <span>{selectedClient.specialty}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Bot className="w-5 h-5 text-slate-400" />
                        <span>{selectedClient.agent_config?.ai_provider || "openai"} / {selectedClient.agent_config?.ai_model || "gpt-4o"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                        <span>{selectedClient.agent_config?.whatsapp_provider || "waha"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span>{selectedClient.business_hours?.open || "10:00"} - {selectedClient.business_hours?.close || "20:00"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuração IA */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-500" />
                    Configuração IA
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <p className={`font-semibold ${selectedClient.agent_config?.enabled ? "text-emerald-600" : "text-slate-400"}`}>
                        {selectedClient.agent_config?.enabled ? "✅ Ativa" : "❌ Desativada"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Personalidade</p>
                      <p className="font-semibold text-slate-800">{selectedClient.agent_config?.personality || "friendly"}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Provider</p>
                      <p className="font-semibold text-slate-800">{selectedClient.agent_config?.ai_provider || "openai"}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Modelo</p>
                      <p className="font-mono text-sm text-slate-800">{selectedClient.agent_config?.ai_model || "gpt-4o"}</p>
                    </div>
                  </div>
                </div>

                {/* Salas (se houver) */}
                {selectedClient.salas && selectedClient.salas.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Salas de Atendimento</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedClient.salas.map((sala: any) => (
                        <div key={sala.id} className={`p-3 rounded-xl ${sala.ativo ? "bg-emerald-50" : "bg-slate-50"}`}>
                          <p className="font-medium text-slate-800">{sala.nome}</p>
                          <p className="text-xs text-slate-500">{sala.profissional}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limites do Plano */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Limites do Plano</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-800">{selectedClient.plan_limits?.max_users || 3}</p>
                      <p className="text-xs text-slate-500">Usuários</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-800">{selectedClient.plan_limits?.max_conversations_month || 500}</p>
                      <p className="text-xs text-slate-500">Conversas/mês</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-800">{selectedClient.plan_limits?.max_knowledge_items || 50}</p>
                      <p className="text-xs text-slate-500">Knowledge Items</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Selecione um tenant para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
