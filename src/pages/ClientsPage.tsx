import { useEffect, useState } from "react";
import { Building2, Users, MessageSquare, TrendingUp, RefreshCw, Plus, Settings, ExternalLink, Loader2, Calendar, UserPlus } from "lucide-react";
import { authClient } from "../lib/auth";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  metadata?: { tenant_id?: string; plan?: string; mrr?: number; domain?: string };
  members?: any[];
  _stats?: { conversations: number; leads: number; messages: number };
}

const API_URL = "https://api.docaperformance.com.br";

export default function ClientsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);

  useEffect(() => { loadOrganizations(); }, []);

  async function loadOrganizations() {
    setLoading(true);
    setError(null);
    try {
      const orgsRes = await authClient.organization.list();
      if (orgsRes.data) {
        const orgsWithDetails = await Promise.all(
          orgsRes.data.map(async (org: any) => {
            try {
              const fullOrg = await authClient.organization.getFullOrganization({ query: { organizationId: org.id } });
              let stats = { conversations: 0, leads: 0, messages: 0 };
              const tenantId = org.metadata?.tenant_id;
              if (tenantId) {
                try {
                  const statsRes = await fetch(`${API_URL}/api/stats?tenant_id=${tenantId}`);
                  if (statsRes.ok) stats = await statsRes.json();
                } catch { /* ignore */ }
              }
              return { ...org, members: fullOrg.data?.members || [], _stats: stats };
            } catch { return { ...org, members: [], _stats: { conversations: 0, leads: 0, messages: 0 } }; }
          })
        );
        setOrganizations(orgsWithDetails);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar organizações");
    } finally { setLoading(false); }
  }

  const totalUsers = organizations.reduce((acc, org) => acc + (org.members?.length || 0), 0);
  const totalConversations = organizations.reduce((acc, org) => acc + (org._stats?.conversations || 0), 0);
  const totalMRR = organizations.reduce((acc, org) => acc + (org.metadata?.mrr || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-orange-400" />
            Clientes
          </h1>
          <p className="text-gray-500">Gerenciamento de organizações e clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadOrganizations} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button onClick={() => setShowNewOrgModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Clientes" value={organizations.length} icon={Building2} color="orange" />
        <StatCard label="Total Usuários" value={totalUsers} icon={Users} color="blue" />
        <StatCard label="Conversas Hoje" value={totalConversations} icon={MessageSquare} color="emerald" />
        <StatCard label="MRR Total" value={`R$ ${totalMRR.toLocaleString("pt-BR")}`} icon={TrendingUp} color="purple" />
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {organizations.map((org) => <ClientCard key={org.id} org={org} onRefresh={loadOrganizations} />)}
          {organizations.length === 0 && <div className="col-span-full p-8 text-center text-gray-500">Nenhum cliente cadastrado</div>}
        </div>
      )}

      {showNewOrgModal && <NewOrgModal onClose={() => setShowNewOrgModal(false)} onCreated={() => { setShowNewOrgModal(false); loadOrganizations(); }} />}
    </div>
  );
}

function ClientCard({ org, onRefresh }: { org: Organization; onRefresh: () => void }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await authClient.organization.inviteMember({ organizationId: org.id, email: inviteEmail, role: "member" });
      alert("Convite enviado!");
      setInviteEmail("");
      setShowInvite(false);
      onRefresh();
    } catch (err: any) { alert(err.message || "Erro ao enviar convite"); }
    finally { setInviting(false); }
  }

  const plan = org.metadata?.plan || "Starter";
  const mrr = org.metadata?.mrr || 0;
  const domain = org.metadata?.domain;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">{org.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="text-white font-semibold">{org.name}</h3>
            <p className="text-xs text-gray-500">{org.slug}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${plan === "Premium" ? "bg-purple-500/20 text-purple-400" : plan === "Pro" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{plan}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-black/30"><p className="text-lg font-bold text-white">{org.members?.length || 0}</p><p className="text-[10px] text-gray-500">Usuários</p></div>
        <div className="text-center p-2 rounded-lg bg-black/30"><p className="text-lg font-bold text-white">{org._stats?.conversations || 0}</p><p className="text-[10px] text-gray-500">Conversas</p></div>
        <div className="text-center p-2 rounded-lg bg-black/30"><p className="text-lg font-bold text-white">{org._stats?.leads || 0}</p><p className="text-[10px] text-gray-500">Leads</p></div>
      </div>

      {mrr > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <span className="text-sm text-emerald-400">MRR</span>
          <span className="text-lg font-bold text-emerald-400">R$ {mrr.toLocaleString("pt-BR")}</span>
        </div>
      )}

      {org.members && org.members.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {org.members.slice(0, 4).map((member: any, i: number) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white" title={member.user?.name || member.user?.email}>{member.user?.name?.charAt(0) || "?"}</div>
            ))}
          </div>
          {org.members.length > 4 && <span className="text-xs text-gray-500">+{org.members.length - 4}</span>}
        </div>
      )}

      {showInvite && (
        <div className="flex gap-2 mb-4">
          <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" className="flex-1 h-9 px-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm outline-none" />
          <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="px-3 h-9 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50">{inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}</button>
          <button onClick={() => setShowInvite(false)} className="px-3 h-9 rounded-lg bg-white/5 text-gray-400 text-sm">✕</button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => setShowInvite(!showInvite)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm"><UserPlus className="w-4 h-4" />Convidar</button>
        {domain && <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm"><ExternalLink className="w-4 h-4" /></a>}
        <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm"><Settings className="w-4 h-4" /></button>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-gray-500"><Calendar className="w-3 h-3" />Criado em {new Date(org.createdAt).toLocaleDateString("pt-BR")}</div>
    </div>
  );
}

function NewOrgModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name || !slug) return;
    setLoading(true);
    try {
      await authClient.organization.create({ name, slug });
      onCreated();
    } catch (err: any) { alert(err.message || "Erro ao criar organização"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Novo Cliente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="Nome da empresa" className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="nome-da-empresa" className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !name || !slug} className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Cliente"}</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between"><Icon className="w-5 h-5" /><span className="text-2xl font-bold text-white">{value}</span></div>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  );
}
