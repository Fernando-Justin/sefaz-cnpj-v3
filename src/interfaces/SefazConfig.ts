// Spec: SRD §4 — Integração SOAP e Certificado Digital
// Define a estrutura de configuração necessária para acessar o WebService da SEFAZ com mTLS

import https from 'https'

/**
 * Configuração da chamada SOAP ao WebService da SEFAZ.
 * Os valores devem ser injetados via variáveis de ambiente (.env) — nunca hardcoded.
 */
export interface SefazConfig {
  /** URL completa do WSDL do WebService de ConsultaCadastro da UF (ex: MG) */
  wsdlUrl: string;

  /**
   * Agente HTTPS com o Certificado Digital A1 (.pfx) configurado.
   * Responsável pelo handshake mTLS com a SEFAZ.
   */
  httpsAgent: https.Agent;

  /** Timeout máximo (ms) para a chamada SOAP. Após esse limite gera erro de timeout */
  timeoutMs: number;

  /** UF de destino da consulta (ex: "MG") */
  uf: string;
}
