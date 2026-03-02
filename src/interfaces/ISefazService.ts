// Spec: SRD §2 — Contrato do Service na camada MVC
// Define o contrato público que qualquer implementação do SefazService deve cumprir

import { CompanyData } from './CompanyData'

/**
 * Contrato da camada de Service para integração com a SEFAZ.
 * Garante que o Controller dependa de uma abstração, não de uma implementação concreta.
 */
export interface ISefazService {
  /**
   * Consulta a situação cadastral de uma PJ na SEFAZ.
   * @param cnpj - CNPJ em formato numérico puro (14 dígitos, sem máscara)
   * @param uf   - UF da empresa (ex: "SP")
   * @returns    - Promessa que resolve com os dados cadastrais da empresa
   * @throws     - Erro com código HTTP apropriado em caso de falha (timeout, SOAP fault, etc.)
   */
  query(cnpj: string, uf: string): Promise<CompanyData>;
}
