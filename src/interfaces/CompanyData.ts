// Spec: SRD §3 — Contrato do payload de resposta GET /api/v1/companies/:cnpj/:uf (200 OK)
// Define os campos retornados pela SEFAZ após parse do XML da ConsultaCadastro

/**
 * Dados cadastrais da Pessoa Jurídica retornados pela SEFAZ.
 * Todos os campos são strings para compatibilidade com os valores do XML SOAP.
 */
export interface CompanyData {
  /** CNPJ formatado: xx.xxx.xxx/xxxx-xx */
  cnpj: string;

  /** Razão Social registrada na Receita Federal */
  razaoSocial: string;

  /** Nome Fantasia (pode ser vazio) */
  nomeFantasia: string;

  /** Situação cadastral: "Habilitado", "Credenciado com restrição", "Habilitado parcialmente", etc. */
  situacaoCadastral: string;

  /** Data de abertura da empresa no formato AAAA-MM-DD */
  dataAbertura: string;

  /** Código e descrição da atividade principal (CNAE) */
  cnaePrincipal: string;

  /** Endereço completo: Logradouro, Número, Complemento, Bairro, Município/UF, CEP */
  endereco: string;
}
