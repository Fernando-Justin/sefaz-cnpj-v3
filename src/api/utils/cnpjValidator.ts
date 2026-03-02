// Spec: SRD §5 — Validações Core: CNPJ com regex + cálculo modular RFB
// Protege o backend de disparar chamadas SOAP com CNPJs estruturalmente inválidos

/**
 * Valida o formato e os dígitos verificadores de um CNPJ.
 * @param cnpj - CNPJ em formato numérico puro (apenas dígitos, sem máscara)
 * @returns true se o CNPJ for estruturalmente válido, false caso contrário
 */
export function isValidCnpj(cnpj: string): boolean {
  // Valida: exatamente 14 dígitos numéricos
  if (!/^\d{14}$/.test(cnpj)) return false

  // Rejeita sequências inválidas conhecidas (ex: 00000000000000)
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Cálculo do primeiro dígito verificador (RFB)
  const calcDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, idx) => acc + parseInt(digit) * weights[idx], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calcDigit(cnpj.slice(0, 12), weights1)
  const digit2 = calcDigit(cnpj.slice(0, 13), weights2)

  return (
    digit1 === parseInt(cnpj[12]) &&
    digit2 === parseInt(cnpj[13])
  )
}

/**
 * Formata um CNPJ numérico puro no padrão visual: xx.xxx.xxx/xxxx-xx
 * @param cnpj - CNPJ com 14 dígitos
 */
export function formatCnpj(cnpj: string): string {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}
