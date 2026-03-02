// Spec: SRD §4 — Integração SOAP com a SEFAZ via strong-soap + mTLS (Certificado Digital A1)
// Isola toda a comunicação governamental SOAP nesta camada de serviço
// strong-soap não possui @types — importado via require para evitar erros TS7016

import https from 'https'
import fs from 'fs'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const soapLib = require('strong-soap').soap as {
  createClient: (url: string, options: object, callback: (err: Error | null, client: SoapClient) => void) => void
}
import { CompanyData } from '../../interfaces/CompanyData'
import { ISefazService } from '../../interfaces/ISefazService'
import { parseCompanyData } from '../utils/xmlParser'

/** Tipo mínimo do client SOAP retornado pelo strong-soap */
interface SoapClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [method: string]: (params: unknown, callback: (err: Error | null, result: unknown) => void) => void
}

function buildHttpsAgent(): https.Agent {
  const certPath = process.env.CERT_PATH ?? ''
  const certPass = process.env.CERT_PASS ?? ''

  if (!certPath) {
    throw Object.assign(new Error('Variável CERT_PATH não definida no .env'), { statusCode: 500 })
  }

  const absolutePath = path.resolve(certPath)
  if (!fs.existsSync(absolutePath)) {
    throw Object.assign(
      new Error(`Certificado Digital não encontrado em: ${absolutePath}`),
      { statusCode: 500 }
    )
  }

  return new https.Agent({
    pfx: fs.readFileSync(absolutePath),
    passphrase: certPass,
    rejectUnauthorized: false,
  })
}

/** Implementação concreta do ISefazService usando strong-soap */
export class SefazService implements ISefazService {

  /**
   * Consulta a situação cadastral de uma PJ na SEFAZ via SOAP.
   * @param cnpj - CNPJ numérico puro (14 dígitos)
   * @param uf   - UF suportada (ex: "SP")
   */
  async query(cnpj: string, uf: string): Promise<CompanyData> {
    if (process.env.MOCK_SEFAZ === 'true') {
      return {
        cnpj,
        razaoSocial: 'EMPRESA MOCKADA PARA TESTES LTDA',
        nomeFantasia: 'MOCK TESTE APP',
        situacaoCadastral: 'Ativa',
        dataAbertura: '2023-01-01',
        cnaePrincipal: '6204-0/00 - Consultoria em tecnologia da informação',
        endereco: 'RUA DOS TESTES, 123 - CENTRO - SÃO PAULO/SP'
      }
    }

    const wsdlUrl = process.env.SEFAZ_WSDL_URL_SP ?? ''
    const timeoutMs = parseInt(process.env.SOAP_TIMEOUT_MS ?? '15000', 10)

    if (!wsdlUrl) {
      throw Object.assign(new Error('Variável SEFAZ_WSDL_URL_SP não definida no .env'), { statusCode: 500 })
    }

    const httpsAgent = buildHttpsAgent()

    // Opções passadas ao strong-soap para configurar o client HTTP com mTLS
    const wsdlOptions = { httpsAgent }

    // Criação do client SOAP com o WSDL da SEFAZ
    const client: SoapClient = await new Promise((resolve, reject) => {
      soapLib.createClient(wsdlUrl, wsdlOptions, (err: Error | null, soapClient: SoapClient) => {
        if (err) reject(Object.assign(err, { statusCode: 502 }))
        else resolve(soapClient)
      })
    })

    // Parâmetros da operação ConsultaCadastro conforme WSDL da SEFAZ
    // A versão do lote é um atributo do nó consCad
    const requestParams = {
      consCad: {
        attributes: {
          versao: '2.00'
        },
        infCons: {
          xServ: 'CONS-CAD',
          UF: uf.toUpperCase(),
          CNPJ: cnpj,
        },
      }
    }

    // Chamada com timeout controlado (SRD §6)
    const raw = await Promise.race([
      new Promise<unknown>((resolve, reject) => {
        client.consultaCadastro(requestParams, (err: Error | null, result: unknown) => {
          if (err) reject(Object.assign(err, { statusCode: 502 }))
          else resolve(result)
        })
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error('Timeout: a SEFAZ demorou para responder'), { statusCode: 504 })),
          timeoutMs
        )
      ),
    ])

    // Converte o resultado bruto do SOAP para o contrato CompanyData
    return parseCompanyData(raw as Record<string, unknown>)
  }
}

// Instância singleton exportada para uso no Controller
export const sefazService = new SefazService()
