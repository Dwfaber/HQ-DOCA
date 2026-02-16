# 🐙 HQ-DOCA - Integração Hostinger

Este módulo integra o **Hostinger MCP Server** ao HQ-DOCA, permitindo que o Command Center exiba informações reais sobre domínios, VPS e billing diretamente da sua conta Hostinger.

## 📁 Estrutura dos Arquivos

```
hq-doca-hostinger/
├── services/
│   └── hostinger.service.ts    # Serviço que conecta ao MCP
├── routes/
│   └── hostinger.routes.ts     # API endpoints
├── components/
│   └── HostingerPanel.tsx      # Componente React para o Command Center
├── docker-compose.yml          # Docker com Hostinger MCP
├── .env.example                # Variáveis de ambiente
└── README.md                   # Este arquivo
```

## 🚀 Implementação

### 1. Copiar arquivos para o HQ-DOCA

```bash
# No seu VPS, dentro do projeto HQ-DOCA:

# Copiar o serviço
cp services/hostinger.service.ts src/services/

# Copiar as rotas
cp routes/hostinger.routes.ts src/routes/

# Copiar o componente
cp components/HostingerPanel.tsx src/components/
```

### 2. Configurar variáveis de ambiente

Adicione no seu `.env`:

```env
HOSTINGER_API_TOKEN=AB5lKkljrIbx2wUs1ldX5Kh4karjcLFB9LDb50Kgfa28cee4
```

### 3. Registrar as rotas na API

No seu arquivo principal da API (ex: `src/index.ts` ou `src/app.ts`):

```typescript
import hostingerRoutes from './routes/hostinger.routes';

// Registrar rotas
app.use('/api/hostinger', hostingerRoutes);
```

### 4. Adicionar o componente ao PainelPage

No arquivo `src/pages/PainelPage.tsx`, importe e use o HostingerPanel:

```tsx
import HostingerPanel from '../components/HostingerPanel';

// Dentro do componente, na seção de alertas ou onde preferir:
<HostingerPanel />
```

### 5. Instalar dependências

```bash
npm install @modelcontextprotocol/sdk
```

### 6. Iniciar o Hostinger MCP Server

**Opção A: Via Docker (Recomendado)**

```bash
docker-compose up -d hostinger-mcp
```

**Opção B: Direto no VPS**

```bash
npm install -g hostinger-api-mcp@latest

# Rodar em background
export API_TOKEN=seu_token_aqui
nohup hostinger-api-mcp --http --host 0.0.0.0 --port 8100 > /var/log/hostinger-mcp.log 2>&1 &
```

## 📡 API Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/hostinger/dashboard` | Dados completos do dashboard |
| `GET /api/hostinger/domains` | Lista de domínios |
| `GET /api/hostinger/domains/expiring?days=30` | Domínios expirando |
| `GET /api/hostinger/vps` | Lista de VPS |
| `GET /api/hostinger/vps/:id/metrics` | Métricas de uma VPS |
| `GET /api/hostinger/billing` | Informações de billing |
| `GET /api/hostinger/dns/:domain` | Registros DNS |
| `GET /api/hostinger/alerts` | Alertas automáticos |
| `GET /api/hostinger/health` | Health check |

## 🔧 Ferramentas Disponíveis no MCP

O Hostinger MCP Server expõe **118 ferramentas** organizadas em categorias:

| Categoria | Ferramentas | Exemplos |
|-----------|-------------|----------|
| **VPS** | 62 | Criar, reiniciar, métricas, firewall, snapshots |
| **domains** | 17 | Listar, verificar disponibilidade, DNS, privacy |
| **hosting** | 13 | WordPress, backups, PHP version |
| **billing** | 9 | Subscriptions, pagamentos, catálogo |
| **DNS** | 8 | Registros A, CNAME, MX, TXT |
| **reach** | 8 | Notificações, webhooks |

## 🎨 Preview do Componente

O `HostingerPanel` exibe:
- 📊 Cards com métricas (domínios, VPS, alertas)
- ⚠️ Alertas de domínios expirando
- 🌐 Lista de domínios com status
- 🖥️ Lista de VPS com status
- 🔄 Auto-refresh a cada 5 minutos

## 🔐 Segurança

- O token da Hostinger só é acessível pelo backend
- Todas as rotas requerem autenticação
- Cache de 5 minutos para reduzir chamadas à API
- O MCP server roda localmente no VPS

## 🐛 Troubleshooting

**Erro 403 na API Hostinger:**
- Verifique se o token está correto
- Confirme que o MCP está rodando no VPS (mesmo IP que acessa o hPanel)

**MCP não conecta:**
```bash
# Verificar se está rodando
curl http://localhost:8100/health

# Ver logs
docker logs hostinger-mcp-server
```

**Dados não aparecem:**
- Verifique o console do navegador
- Confirme que a API está respondendo: `curl http://localhost:3101/api/hostinger/health`

## 📝 Próximos Passos

1. [ ] Adicionar gráficos de uso da VPS (CPU, RAM, Disco)
2. [ ] Implementar ações (renovar domínio, reiniciar VPS)
3. [ ] Notificações push para alertas críticos
4. [ ] Histórico de métricas
5. [ ] Integração com Slack/Discord para alertas
