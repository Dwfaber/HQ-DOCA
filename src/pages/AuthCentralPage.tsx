import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  Ban,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
} from "lucide-react";
import { authClient } from "../lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: string;
  image?: string;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  members?: any[];
}

export default function AuthCentralPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sessions] = useState<Session[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    
    try {
      // Carrega usuários via admin API
      const usersRes = await authClient.admin.listUsers({
        query: { limit: 100 }
      });
      
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users as User[]);
      }

      // Carrega organizações
      const orgsRes = await authClient.organization.list();
      if (orgsRes.data) {
        // Para cada org, busca membros
        const orgsWithMembers = await Promise.all(
          orgsRes.data.map(async (org: any) => {
            try {
              const fullOrg = await authClient.organization.getFullOrganization({
                query: { organizationId: org.id }
              });
              return {
                ...org,
                members: fullOrg.data?.members || []
              };
            } catch {
              return { ...org, members: [] };
            }
          })
        );
        setOrganizations(orgsWithMembers);
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleBanUser(userId: string, ban: boolean) {
    setActionLoading(userId);
    try {
      if (ban) {
        await authClient.admin.banUser({ userId });
      } else {
        await authClient.admin.unbanUser({ userId });
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar usuário");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevokeSessions(userId: string) {
    setActionLoading(userId);
    try {
      await authClient.admin.revokeUserSessions({ userId });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao revogar sessões");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSetRole(userId: string, role: "user" | "admin") {
    setActionLoading(userId);
    try {
      await authClient.admin.setRole({ userId, role });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar role");
    } finally {
      setActionLoading(null);
    }
  }

  // Filtra usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    if (selectedOrg === "all") return matchesSearch;
    
    const org = organizations.find(o => o.id === selectedOrg);
    const isMember = org?.members?.some((m: any) => m.userId === user.id);
    return matchesSearch && isMember;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-orange-400" />
            Auth Central
          </h1>
          <p className="text-gray-500">Gerenciamento de usuários e sessões</p>
        </div>
        
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Usuários"
          value={users.length}
          icon={Users}
          color="orange"
        />
        <StatCard
          label="Sessões Ativas"
          value={sessions.length}
          icon={Shield}
          color="emerald"
        />
        <StatCard
          label="Organizações"
          value={organizations.length}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Usuários Banidos"
          value={users.filter(u => u.banned).length}
          icon={Ban}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-orange-500/50"
          />
        </div>
        
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="h-10 px-4 rounded-xl bg-black/30 border border-white/10 text-white outline-none"
        >
          <option value="all">Todas Organizações</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Criado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(user => {
                const isLoading = actionLoading === user.id;
                
                // Encontra orgs do usuário
                const userOrgs = organizations.filter(org => 
                  org.members?.some((m: any) => m.userId === user.id)
                );
                
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name || "Sem nome"}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {userOrgs.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {userOrgs.map(org => (
                                <span key={org.id} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                  {org.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => handleSetRole(user.id, e.target.value as "user" | "admin")}
                        disabled={isLoading}
                        className="px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.banned ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                            <XCircle className="w-3 h-3" /> Banido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Ativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleBanUser(user.id, !user.banned)}
                              className={`p-2 rounded-lg transition ${
                                user.banned
                                  ? "hover:bg-emerald-500/20 text-emerald-400"
                                  : "hover:bg-red-500/20 text-red-400"
                              }`}
                              title={user.banned ? "Desbanir" : "Banir"}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRevokeSessions(user.id)}
                              className="p-2 rounded-lg hover:bg-yellow-500/20 text-yellow-400 transition"
                              title="Revogar todas sessões"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    red: "from-red-500/20 to-red-500/5 border-red-500/30 text-red-400",
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
