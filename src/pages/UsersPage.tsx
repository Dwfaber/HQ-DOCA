import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Key,
  RefreshCw,
  Plus,
  Loader2,
  Calendar,
  Mail,
  Phone,
  Globe,
  Settings,
  Shield,
  Activity,
  Zap,
  Database,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Edit,
  MessageSquare
} from "lucide-react";
import { authClient } from "../lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

interface ApiConfig {
  provider: "zapi" | "waha" | "evolution";
  instanceId: string;
  status: "active" | "inactive" | "error";
  token?: string;
  webhook?: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  domain?: string;
  tenantId: string;
  plan: "Starter" | "Pro" | "Premium";
  createdAt: string;
  users: User[];
  apis: ApiConfig[];
  _stats?: {
    totalMessages: number;
    totalConversations: number;
    activeUsers: number;
  };
}

const API_URL = "https://api.docaperformance.com.br";

export default function UsersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const orgsRes = await authClient.organization.list();
      if (orgsRes.data) {
        const clientsWithDetails = await Promise.all(
          orgsRes.data.map(async (org: any) => {
            try {
              const fullOrg = await authClient.organization.getFullOrganization({
                query: { organizationId: org.id }
              });

              const tenantId = org.metadata?.tenant_id;
              let apis: ApiConfig[] = [];
              let stats = { totalMessages: 0, totalConversations: 0, activeUsers: 0 };

              if (tenantId) {
                try {
                  // Buscar APIs configuradas
                  const apisRes = await fetch(`${API_URL}/api/tenants/${tenantId}/apis`);
                  if (apisRes.ok) {
                    apis = await apisRes.json();
                  }
                } catch { /* ignore */ }

                try {
                  // Buscar stats
                  const statsRes = await fetch(`${API_URL}/api/stats?tenant_id=${tenantId}`);
                  if (statsRes.ok) {
                    const s = await statsRes.json();
                    stats = {
                      totalMessages: s.messages || 0,
                      totalConversations: s.conversations || 0,
                      activeUsers: fullOrg.data?.members?.length || 0
                    };
                  }
                } catch { /* ignore */ }
              }

              const users: User[] = (fullOrg.data?.members || []).map((m: any) => ({
                id: m.user?.id || m.id,
                email: m.user?.email || "",
                name: m.user?.name,
                role: m.role || "member",
                createdAt: m.createdAt || org.createdAt,
                lastLogin: m.user?.lastLogin
              }));

              return {
                id: org.id,
                name: org.name,
                slug: org.slug,
                email: org.metadata?.email,
                phone: org.metadata?.phone,
                domain: org.metadata?.domain,
                tenantId: tenantId || "",
                plan: org.metadata?.plan || "Starter",
                createdAt: org.createdAt,
                users,
                apis,
                _stats: stats
              } as Client;
            } catch {
              return {
                id: org.id,
                name: org.name,
                slug: org.slug,
                tenantId: org.metadata?.tenant_id || "",
                plan: "Starter",
                createdAt: org.createdAt,
                users: [],
                apis: [],
                _stats: { totalMessages: 0, totalConversations: 0, activeUsers: 0 }
              } as Client;
            }
          })
        );
        setClients(clientsWithDetails);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  const totalClients = clients.length;
  const totalUsers = clients.reduce((acc, c) => acc + c.users.length, 0);
  const totalApis = clients.reduce((acc, c) => acc + c.apis.length, 0);
  const activeApis = clients.reduce(
    (acc, c) => acc + c.apis.filter(a => a.status === "active").length,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            Usuários & Cadastros
          </h1>
          <p className="text-gray-500">Gerenciamento de clientes, usuários e APIs configuradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadClients}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Cadastro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Clientes" value={totalClients} icon={Building2} color="orange" />
        <StatCard label="Total Usuários" value={totalUsers} icon={Users} color="blue" />
        <StatCard label="APIs Configuradas" value={totalApis} icon={Key} color="purple" />
        <StatCard label="APIs Ativas" value={activeApis} icon={Activity} color="emerald" />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <ClientDetailCard
              key={client.id}
              client={client}
              expanded={expandedClient === client.id}
              onToggle={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
              onRefresh={loadClients}
            />
          ))}
          {clients.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white/5 rounded-2xl border border-white/10">
              Nenhum cliente cadastrado
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
          onCreated={() => {
            setShowNewClientModal(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
}

function ClientDetailCard({
  client,
  expanded,
  onToggle,
  onRefresh
}: {
  client: Client;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const planColors = {
    Starter: "bg-gray-500/20 text-gray-400",
    Pro: "bg-blue-500/20 text-blue-400",
    Premium: "bg-purple-500/20 text-purple-400"
  };

  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-400",
    inactive: "bg-gray-500/20 text-gray-400",
    error: "bg-red-500/20 text-red-400"
  };

  const providerIcons = {
    zapi: "⚡",
    waha: "🐳",
    evolution: "🔄"
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header - sempre visível */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{client.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${planColors[client.plan]}`}>
                {client.plan}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {client.users.length} usuários
              </span>
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                {client.apis.length} APIs
              </span>
              {client.domain && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {client.domain}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini stats */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{client._stats?.totalMessages || 0}</p>
              <p className="text-xs text-gray-500">mensagens</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{client._stats?.totalConversations || 0}</p>
              <p className="text-xs text-gray-500">conversas</p>
            </div>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/10 p-5 space-y-6 bg-black/20">
          {/* Dados de Cadastro */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dados de Cadastro
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoField
                label="Tenant ID"
                value={client.tenantId}
                copyable
                copied={copiedField === "tenant"}
                onCopy={() => copyToClipboard(client.tenantId, "tenant")}
              />
              <InfoField
                label="Slug"
                value={client.slug}
                copyable
                copied={copiedField === "slug"}
                onCopy={() => copyToClipboard(client.slug, "slug")}
              />
              <InfoField
                label="Email"
                value={client.email || "Não informado"}
                icon={<Mail className="w-3.5 h-3.5" />}
              />
              <InfoField
                label="Telefone"
                value={client.phone || "Não informado"}
                icon={<Phone className="w-3.5 h-3.5" />}
              />
              <InfoField
                label="Domínio"
                value={client.domain || "Não configurado"}
                icon={<Globe className="w-3.5 h-3.5" />}
                link={client.domain ? `https://${client.domain}` : undefined}
              />
              <InfoField
                label="Criado em"
                value={new Date(client.createdAt).toLocaleDateString("pt-BR")}
                icon={<Calendar className="w-3.5 h-3.5" />}
              />
            </div>
          </div>

          {/* APIs Configuradas */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Key className="w-4 h-4" />
              APIs Configuradas
            </h4>
            {client.apis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {client.apis.map((api, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-black/30 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{providerIcons[api.provider]}</span>
                        <span className="text-white font-medium uppercase">{api.provider}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[api.status]}`}>
                        {api.status === "active" ? "Ativo" : api.status === "error" ? "Erro" : "Inativo"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Instance ID</span>
                        <div className="flex items-center gap-2">
                          <code className="text-gray-300 bg-black/50 px-2 py-0.5 rounded text-xs">
                            {api.instanceId.slice(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(api.instanceId, `api-${idx}`)}
                            className="text-gray-500 hover:text-white transition"
                          >
                            {copiedField === `api-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {api.webhook && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Webhook</span>
                          <span className="text-gray-300 text-xs">Configurado ✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-gray-500">
                Nenhuma API configurada
              </div>
            )}
          </div>

          {/* Usuários */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários ({client.users.length})
            </h4>
            {client.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-white/5">
                      <th className="pb-2 font-medium">Nome</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Função</th>
                      <th className="pb-2 font-medium">Cadastro</th>
                      <th className="pb-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {client.users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs text-white">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            {user.name || "—"}
                          </div>
                        </td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === "owner" || user.role === "admin"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {user.role === "owner" ? "Proprietário" : user.role === "admin" ? "Admin" : "Membro"}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-gray-500">
                Nenhum usuário cadastrado
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm">
              <Shield className="w-4 h-4" />
              Permissões
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition text-sm">
              <MessageSquare className="w-4 h-4" />
              Ver Conversas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  copyable,
  copied,
  onCopy,
  link
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
  link?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          {icon}
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              {value}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className={value === "Não informado" || value === "Não configurado" ? "text-gray-500" : ""}>
              {value}
            </span>
          )}
        </div>
        {copyable && onCopy && (
          <button onClick={onCopy} className="text-gray-500 hover:text-white transition">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function NewClientModal({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<"Starter" | "Pro" | "Premium">("Starter");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name || !slug) return;
    setLoading(true);
    try {
      await authClient.organization.create({
        name,
        slug,
        metadata: {
          email,
          phone,
          plan,
          tenant_id: `tenant_${slug}_${Date.now()}`
        }
      });
      onCreated();
    } catch (err: any) {
      alert(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Novo Cadastro de Cliente
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }}
                placeholder="Nome da empresa"
                className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nome-da-empresa"
                className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500/50 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com"
                className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full h-10 px-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Plano</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Starter", "Pro", "Premium"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`py-2 rounded-xl border transition text-sm font-medium ${
                    plan === p
                      ? p === "Premium"
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                        : p === "Pro"
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-gray-500/20 border-gray-500/50 text-gray-300"
                      : "bg-black/30 border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name || !slug}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400"
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5" />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  );
}