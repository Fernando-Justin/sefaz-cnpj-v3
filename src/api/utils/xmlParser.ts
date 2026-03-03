// Spec: SRD §4 — Parse do Retorno SOAP: XML da SEFAZ → objeto CompanyData
// A SEFAZ retorna os dados dentro de um envelope SOAP 1.2 / XML que deve ser mapeado para JSON

import { CompanyData } from '../../interfaces/CompanyData'

/**
 * Tipo bruto recebido pelo parseCompanyData.
 * Pode conter _rawXml (cliente HTTP nativo) ou estrutura JS (strong-soap legado).
 */
interface SefazRawResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/** Extrai o texto de um elemento XML simples: <tag>valor</tag> */
function xmlTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

/** Extrai todos os blocos de um elemento XML: <tag>...</tag>* → string[] */
function xmlTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  const matches: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) matches.push(m[1].trim())
  return matches
}

/**
 * Parseia a resposta bruta do envelope SOAP 1.2 da SEFAZ.
 * Extrai o bloco <retConsCad> e mapeia para CompanyData.
 */
function parseFromSoapEnvelope(xml: string): CompanyData {
  // Extrai o bloco retConsCad do envelope SOAP
  const retConsCad = xmlTag(xml, 'retConsCad')
  if (!retConsCad) {
    // Verifica se há erro SOAP Fault
    const faultMsg = xmlTag(xml, 'faultstring') || xmlTag(xml, 'Reason') || xmlTag(xml, 'Text')
    throw Object.assign(
      new Error(faultMsg || 'Resposta da SEFAZ não contém retConsCad'),
      { statusCode: 502 }
    )
  }

  const infCons = xmlTag(retConsCad, 'infCons')
  if (!infCons) throw Object.assign(new Error('Elemento infCons ausente na resposta'), { statusCode: 502 })

  const cStat = xmlTag(infCons, 'cStat')
  const xMotivo = xmlTag(infCons, 'xMotivo')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 [XML PARSING] Extração de dados do envelope SOAP')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Status (cStat):', cStat)
  console.log('📝 Motivo (xMotivo):', xMotivo)

  // cStat 111 = uma ocorrência | 112 = múltiplas ocorrências
  if (cStat !== '111' && cStat !== '112') {
    console.log('❌ ERRO: Status não reconhecido. Encerrando parse.\n')
    throw Object.assign(new Error(xMotivo || 'Sem dados retornados pela SEFAZ'), { sefazCode: cStat })
  }

  console.log('✅ Status válido, prosseguindo...')

  const infCadBlocks = xmlTags(infCons, 'infCad')
  if (!infCadBlocks.length) {
    console.log('❌ ERRO: Nenhum bloco infCad encontrado.\n')
    throw new Error('Nenhum dado cadastral encontrado na resposta da SEFAZ')
  }

  console.log(`📦 Blocos infCad encontrados: ${infCadBlocks.length}`)
  const infCad = infCadBlocks[0]

  const uf = xmlTag(infCad, 'UF')
  const enderBloco = xmlTag(infCad, 'ender')
  const xMun = xmlTag(enderBloco, 'xMun')
  const endereco = [
    xmlTag(enderBloco, 'xLgr'),
    xmlTag(enderBloco, 'nro'),
    xmlTag(enderBloco, 'xCpl'),
    xmlTag(enderBloco, 'xBairro'),
    xMun ? `${xMun}/${uf}` : '',
    xmlTag(enderBloco, 'CEP'),
  ].filter(Boolean).join(', ')

  const cnpj = xmlTag(infCad, 'CNPJ')
  const razaoSocial = xmlTag(infCad, 'xNome')
  const nomeFantasia = xmlTag(infCad, 'xFant')
  const situacaoCadastral = xmlTag(infCad, 'xSit')
  const dataAbertura = xmlTag(infCad, 'dIniAtiv')
  const cnae = xmlTag(infCad, 'CNAE')
  const xCnae = xmlTag(infCad, 'xCNAE')

  const result = {
    cnpj,
    razaoSocial,
    nomeFantasia,
    situacaoCadastral,
    dataAbertura,
    cnaePrincipal: cnae ? `${cnae}${xCnae ? ` - ${xCnae}` : ''}` : '',
    endereco,
  }

  console.log('\n✨ [DADOS PARSEADOS] Convertido para JSON:')
  console.log(JSON.stringify(result, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  return result
}

/**
 * Converte a resposta da SEFAZ num objeto CompanyData limpo.
 * Suporta:
 *  - { _rawXml } — XML bruto do envelope SOAP (cliente HTTP nativo, recomendado)
 *  - Objeto JS parseado (strong-soap legado)
 *
 * @param raw - Objeto resultante do parse do SOAP
 * @returns Objeto CompanyData com os campos normalizados
 * @throws Error se a resposta indicar rejeição ou dados ausentes
 */
export function parseCompanyData(raw: SefazRawResult): CompanyData {
  // Caminho principal — cliente HTTP nativo com XML bruto
  if (typeof raw._rawXml === 'string') {
    console.log('\n📋 [PARSE STRATEGY] Utilizando XML bruto (cliente HTTPS nativo)')
    return parseFromSoapEnvelope(raw._rawXml)
  }

  // Caminho legado — strong-soap já parseou em objeto JS
  const nfeResult = raw?.nfeResultMsg ?? raw?.consultaCadastroResult?.nfeResultMsg
  if (typeof nfeResult === 'string') {
    console.log('\n📋 [PARSE STRATEGY] Utilizando nfeResultMsg like string (legacy path)')
    return parseFromSoapEnvelope(nfeResult)
  }

  console.log('\n📋 [PARSE STRATEGY] Utilizando Objeto JS estruturado (strong-soap legado)')
  const result = raw?.consultaCadastroResult ?? raw?.ConsultaCadastroResult
  const infCons = nfeResult?.retConsCad?.infCons ?? nfeResult?.infCons ?? result?.infCons
  if (infCons) return parseFromStructuredObject(infCons)

  throw new Error('Estrutura de resposta da SEFAZ não reconhecida')
}

/** Parseia infCons já como objeto JS (caminho legado / strong-soap) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFromStructuredObject(infCons: any): CompanyData {
  const cStat = infCons?.cStat ?? ''
  if (cStat !== '111' && cStat !== '112') {
    const xMotivo = infCons?.xMotivo ?? 'Sem dados retornados pela SEFAZ'
    throw Object.assign(new Error(xMotivo), { sefazCode: cStat })
  }

  const infCad = infCons?.infCad?.[0] ?? infCons?.infCad
  if (!infCad) throw new Error('Nenhum dado cadastral encontrado na resposta da SEFAZ')

  const end = infCad.ender ?? {}
  const endereco = [
    end.xLgr,
    end.nro,
    end.xCpl,
    end.xBairro,
    end.xMun ? `${end.xMun}/${infCad.UF}` : '',
    end.CEP,
  ].filter(Boolean).join(', ')

  return {
    cnpj: infCad.CNPJ ?? '',
    razaoSocial: infCad.xNome ?? '',
    nomeFantasia: infCad.xFant ?? '',
    situacaoCadastral: infCad.xSit ?? '',
    dataAbertura: infCad.dIniAtiv ?? '',
    cnaePrincipal: infCad.CNAE ? `${infCad.CNAE}${infCad.xCNAE ? ` - ${infCad.xCNAE}` : ''}` : '',
    endereco,
  }
}
