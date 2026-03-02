// Spec: SRD §5 — Rate Limit e SRD §6 — Tratamento Genérico de Erros HTTP
// Configura o App Express com middlewares de segurança, rotas e error handler padronizado

import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { getCompanyByCnpj } from './controllers/cnpjController'

const app = express()

// ─── Middlewares Globais ──────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// Rate Limit: máximo de 10 requisições por IP a cada 1 minuto (SRD §5)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'LIMITE_EXCEDIDO',
    message: 'Você atingiu o limite de consultas. Aguarde 1 minuto e tente novamente.',
  },
})

// ─── Rotas da API ─────────────────────────────────────────────────────────────
// SRD §3: Endpoint único de consulta
app.get('/api/v1/companies/:cnpj/:uf', apiLimiter, getCompanyByCnpj)

// ─── Handler Global de Erros (SRD §6) ────────────────────────────────────────
app.use((err: Error & { statusCode?: number; sefazCode?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500

  // Nunca expor stack trace ao client (SRD §6)
  res.status(status).json({
    error: err.name ?? 'ERRO_INTERNO',
    message: err.message ?? 'Erro inesperado. Tente novamente.',
  })
})

export default app
