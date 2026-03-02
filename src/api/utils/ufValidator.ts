// Spec: SRD §5 — Validações Core: UF restrita ao conjunto suportado
// O SRD define SP como escopo inicial; estrutura preparada para expansão futura

/** Lista de UFs habilitadas para consulta. Expandir conforme novos WSDLs forem configurados. */
const SUPPORTED_UFS = ['SP'] as const

export type SupportedUf = typeof SUPPORTED_UFS[number]

/**
 * Valida se a UF informada está na lista de estados suportados.
 * @param uf - Sigla do estado em maiúsculas (ex: "SP")
 * @returns true se a UF for suportada
 */
export function isValidUf(uf: string): uf is SupportedUf {
  return (SUPPORTED_UFS as readonly string[]).includes(uf.toUpperCase())
}
