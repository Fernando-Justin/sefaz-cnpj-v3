// Spec: SRD §4 — Parse do Retorno SOAP: XML da SEFAZ → objeto CompanyData
// A SEFAZ retorna os dados dentro de um envelope SOAP/XML que deve ser mapeado para JSON

import { CompanyData } from '../../interfaces/CompanyData'

/**
 * Tipo bruto que o strong-soap retorna após parsear o XML da ConsultaCadastro.
 * Os nomes de campo seguem a estrutura do WSDL da SEFAZ/SP.
 */
interface SefazRawResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Converte a resposta XML já parseada pelo strong-soap num objeto CompanyData limpo.
 * @param raw - Objeto resultante do parse do SOAP pelo strong-soap
 * @returns Objeto CompanyData com os campos normalizados
 * @throws Error se a resposta indicar rejeição ou dados ausentes
 */
export function parseCompanyData(raw: SefazRawResult): CompanyData {
  // O caminho exato dos nós depende do WSDL ConsultaCadastro4 da SEFAZ.
  // Estrutura esperada: raw.consultaCadastroResult.infCad[0]
  const result = raw?.consultaCadastroResult ?? raw?.ConsultaCadastroResult
  const infCons = result?.infCons

  // Verifica motivo de rejeição da SEFAZ antes de tentar extrair dados
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
    `${end.xMun}/${infCad.UF}`,
    end.CEP,
  ]
    .filter(Boolean)
    .join(', ')

  return {
    cnpj: infCad.CNPJ ?? '',
    razaoSocial: infCad.xNome ?? '',
    nomeFantasia: infCad.xFant ?? '',
    situacaoCadastral: infCad.xSit ?? '',
    dataAbertura: infCad.dIniAtiv ?? '',
    cnaePrincipal: infCad.CNAE ? `${infCad.CNAE} - ${infCad.xCNAE ?? ''}` : '',
    endereco,
  }
}
