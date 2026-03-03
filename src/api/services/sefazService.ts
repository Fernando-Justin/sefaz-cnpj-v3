// Spec: SRD §4 — Integração SOAP com a SEFAZ via cliente HTTP nativo + mTLS (Certificado Digital A1)
// Usa https.request nativo em vez de strong-soap para evitar falhas de parse com SOAP 1.2 da SEFAZ.
// O strong-soap tem incompatibilidade com o namespace específico usado pelo WSDL CadConsultaCadastro4.

import https from 'https'
import fs from 'fs'
import path from 'path'
import { CompanyData } from '../../interfaces/CompanyData'
import { ISefazService } from '../../interfaces/ISefazService'
import { parseCompanyData } from '../utils/xmlParser'

/** Mapeamento de UF (sigla) → cUF (código IBGE) conforme Manual de Integração NF-e */
const UF_TO_CODE: Record<string, string> = {
  'MG': '31',
  'SP': '35',
  'RJ': '33',
  'BA': '05',
  'SC': '24',
  'RS': '43',
  'PR': '41',
  'ES': '32',
  'PE': '26',
  'CE': '23',
  'PA': '15',
  'GO': '52',
  'PB': '21',
  'MA': '11',
  'PI': '16',
  'RN': '20',
  'AL': '27',
  'MT': '28',
  'MS': '10',
  'DF': '53',
  'AC': '04',
  'AM': '02',
  'AP': '16',
  'RO': '23',
  'RR': '24',
  'TO': '29'
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

/**
 * Envia uma requisição SOAP 1.2 diretamente via https.request.
 * Evita dependência do strong-soap, que falha ao parsear respostas SOAP 1.2 da SEFAZ.
 * @param url - Endpoint SOAP da SEFAZ
 * @param soapBody - Conteúdo do corpo SOAP (nfeDadosMsg)
 * @param cUF - Código IBGE da UF (ex: '31' para MG)
 * @param agent - Agente HTTPS configurado com certificado mTLS
 * @param timeoutMs - Timeout em milissegundos
 */
function sendSoapRequest(url: string, soapBody: string, cUF: string, agent: https.Agent, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const envelope =
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope" xmlns:tns="http://www.portalfiscal.inf.br/nfe/wsdl/CadConsultaCadastro4">` +
      `<soap12:Header>` +
      `<nfeCabecMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/CadConsultaCadastro4">` +
      `<cUF>${cUF}</cUF>` +
      `<versaoDados>2.00</versaoDados>` +
      `</nfeCabecMsg>` +
      `</soap12:Header>` +
      `<soap12:Body>${soapBody}</soap12:Body>` +
      `</soap12:Envelope>`

    const bodyBuffer = Buffer.from(envelope, 'utf-8')
    const parsedUrl = new URL(url)

    // 📨 LOG: Requisição SOAP
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📨 [SOAP REQUEST] Enviando para SEFAZ/MG')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 URL:', url)
    console.log('⏱️  Timeout:', timeoutMs, 'ms')
    console.log('\n📋 Body SOAP (XML):')
    console.log(envelope)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      agent,
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/CadConsultaCadastro4/consultaCadastro"',
        'Content-Length': bodyBuffer.length,
      },
    }

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8')
        
        // 📥 LOG: Resposta SOAP bruta
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📥 [SOAP RESPONSE] Recebido da SEFAZ/MG')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔢 Status HTTP:', res.statusCode || 'indisponível')
        console.log('📦 Tamanho da resposta:', body.length, 'bytes')
        console.log('\n📄 Resposta SOAP (XML RAW):')
        console.log(body)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        if (res.statusCode && res.statusCode >= 400) {
          reject(Object.assign(new Error(`HTTP ${res.statusCode} da SEFAZ: ${body.slice(0, 200)}`), { statusCode: 502 }))
        } else {
          resolve(body)
        }
      })
    })

    req.on('timeout', () => {
      req.destroy()
      reject(Object.assign(new Error('Timeout: a SEFAZ demorou para responder'), { statusCode: 504 }))
    })

    req.on('error', (err) => reject(Object.assign(err, { statusCode: 502 })))
    req.write(bodyBuffer)
    req.end()
  })
}

/** Implementação concreta do ISefazService usando HTTPS nativo com mTLS */
export class SefazService implements ISefazService {

  /**
   * Consulta a situação cadastral de uma PJ na SEFAZ via SOAP 1.2.
   * @param cnpj - CNPJ numérico puro (14 dígitos)
   * @param uf   - UF suportada (ex: "MG")
   */
  async query(cnpj: string, uf: string): Promise<CompanyData> {
    // 🔍 LOG: Iniciando consulta
    console.log('\n🔍 [CONSULTA] Iniciando busca de CNPJ na SEFAZ/MG')
    console.log('   CNPJ:', cnpj)
    console.log('   UF:', uf.toUpperCase())
    
    if (process.env.MOCK_SEFAZ === 'true') {
      console.log('   ⚠️  Modo MOCK ativado - não consultando SEFAZ real\n')
      return {
        cnpj,
        razaoSocial: 'EMPRESA MOCKADA PARA TESTES LTDA',
        nomeFantasia: 'MOCK TESTE APP',
        situacaoCadastral: 'Ativa',
        dataAbertura: '2023-01-01',
        cnaePrincipal: '6204-0/00 - Consultoria em tecnologia da informação',
        endereco: 'RUA DOS TESTES, 123 - CENTRO - BELO HORIZONTE/MG'
      }
    }

    const endpoint = process.env.SEFAZ_ENDPOINT_MG
      ?? 'https://nfe.fazenda.mg.gov.br:443/nfe2/services/CadConsultaCadastro4'
    const timeoutMs = parseInt(process.env.SOAP_TIMEOUT_MS ?? '15000', 10)

    const httpsAgent = buildHttpsAgent()

    // Payload XML que vai dentro do nfeDadosMsg
    // Namespace correto conforme Manual de Integração da NF-e: http://www.portalfiscal.inf.br/nfe
    const soapBody =
      `<tns:nfeDadosMsg>` +
      `<ConsCad versao="2.00" xmlns="http://www.portalfiscal.inf.br/nfe">` +
      `<infCons>` +
      `<xServ>CONS-CAD</xServ>` +
      `<UF>${uf.toUpperCase()}</UF>` +
      `<CNPJ>${cnpj}</CNPJ>` +
      `</infCons>` +
      `</ConsCad>` +
      `</tns:nfeDadosMsg>`

    const cUF = UF_TO_CODE[uf.toUpperCase()]
    if (!cUF) {
      throw Object.assign(
        new Error(`UF "${uf}" não mapeada para cUF. Estados suportados: ${Object.keys(UF_TO_CODE).join(', ')}`),
        { statusCode: 400 }
      )
    }

    const responseXml = await sendSoapRequest(endpoint, soapBody, cUF, httpsAgent, timeoutMs)

    return parseCompanyData({ _rawXml: responseXml })
  }
}

// Instância singleton exportada para uso no Controller
export const sefazService = new SefazService()
