// HQ-DOCA Hostinger API Routes
// Endpoints para o Command Center consumir dados do Hostinger

import express from 'express';
import { hostingerService } from '../services/hostinger.service';

const router = express.Router();

// Middleware de autenticação (você pode integrar com seu auth existente)
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO: Integrar com Logto auth
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ==================== ENDPOINTS ====================

/**
 * GET /api/hostinger/dashboard
 * Retorna todos os dados do dashboard em uma única chamada
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const data = await hostingerService.getDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do Hostinger' });
  }
});

/**
 * GET /api/hostinger/domains
 * Lista todos os domínios
 */
router.get('/domains', requireAuth, async (req, res) => {
  try {
    const domains = await hostingerService.getDomains();
    res.json(domains);
  } catch (error) {
    console.error('Erro ao buscar domínios:', error);
    res.status(500).json({ error: 'Erro ao buscar domínios' });
  }
});

/**
 * GET /api/hostinger/domains/expiring
 * Lista domínios que vão expirar em breve
 */
router.get('/domains/expiring', requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const domains = await hostingerService.getExpiringDomains(days);
    res.json(domains);
  } catch (error) {
    console.error('Erro ao buscar domínios expirando:', error);
    res.status(500).json({ error: 'Erro ao buscar domínios expirando' });
  }
});

/**
 * GET /api/hostinger/vps
 * Lista todas as VPS
 */
router.get('/vps', requireAuth, async (req, res) => {
  try {
    const vpsList = await hostingerService.getVPSList();
    res.json(vpsList);
  } catch (error) {
    console.error('Erro ao buscar VPS:', error);
    res.status(500).json({ error: 'Erro ao buscar VPS' });
  }
});

/**
 * GET /api/hostinger/vps/:id/metrics
 * Retorna métricas de uma VPS específica
 */
router.get('/vps/:id/metrics', requireAuth, async (req, res) => {
  try {
    const metrics = await hostingerService.getVPSMetrics(req.params.id);
    res.json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas da VPS:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

/**
 * GET /api/hostinger/billing
 * Retorna informações de billing
 */
router.get('/billing', requireAuth, async (req, res) => {
  try {
    const billing = await hostingerService.getBillingInfo();
    res.json(billing);
  } catch (error) {
    console.error('Erro ao buscar billing:', error);
    res.status(500).json({ error: 'Erro ao buscar billing' });
  }
});

/**
 * GET /api/hostinger/dns/:domain
 * Retorna registros DNS de um domínio
 */
router.get('/dns/:domain', requireAuth, async (req, res) => {
  try {
    const records = await hostingerService.getDNSRecords(req.params.domain);
    res.json(records);
  } catch (error) {
    console.error('Erro ao buscar DNS:', error);
    res.status(500).json({ error: 'Erro ao buscar registros DNS' });
  }
});

/**
 * GET /api/hostinger/alerts
 * Retorna alertas gerados automaticamente
 */
router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const alerts = await hostingerService.generateAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

/**
 * GET /api/hostinger/health
 * Health check do serviço Hostinger
 */
router.get('/health', async (req, res) => {
  try {
    // Tenta uma chamada simples para verificar se está funcionando
    await hostingerService.getDomains();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: (error as Error).message });
  }
});

export default router;
