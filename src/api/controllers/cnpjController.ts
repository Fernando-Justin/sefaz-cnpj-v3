// Spec: SRD §3 — Contrato GET /api/v1/companies/:cnpj/:uf
// Recebe, valida e encaminha a consulta de CNPJ para o Service, retornando a resposta padronizada

import { Request, Response, NextFunction } from 'express'
import { isValidCnpj } from '../utils/cnpjValidator'
import { isValidUf } from '../utils/ufValidator'
import { sefazService } from '../services/sefazService'

/**
 * Handler do endpoint GET /api/v1/companies/:cnpj/:uf
 * Valida os parâmetros de entrada, aciona o sefazService e mapeia os códigos HTTP de retorno.
 */
export async function getCompanyByCnpj(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cnpj, uf } = req.params

    // Remove caracteres não numéricos do CNPJ (caso venha com máscara)
    const cnpjNormalized = cnpj.replace(/\D/g, '')

    // Validação de UF (SRD §5)
    if (!isValidUf(uf)) {
      res.status(400).json({
        error: 'UF_INVALIDA',
        message: `A UF "${uf}" não é suportada. UFs disponíveis: MG`,
      })
      return
    }

    // Validação de CNPJ: formato + dígitos verificadores RFB (SRD §5)
    if (!isValidCnpj(cnpjNormalized)) {
      res.status(400).json({
        error: 'CNPJ_INVALIDO',
        message: 'O CNPJ informado é inválido. Verifique o número e tente novamente.',
      })
      return
    }

    // Chama a camada de Service (SRD §2 MVC)
    const companyData = await sefazService.query(cnpjNormalized, uf)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ [RESPONSE] Retornando dados validados ao cliente')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Status HTTP: 200')
    console.log('📋 Payload:')
    console.log(JSON.stringify(companyData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    res.status(200).json(companyData)
  } catch (err) {
    // Encaminha para o handler global de erros (configurado em app.ts)
    next(err)
  }
}
