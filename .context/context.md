# Technical Context (context.md)

> Origem: [SRD.md](./srd.md) | [PRD.md](../PRD.md)

## 1. Stack e Versões Exatas

- **Ambiente de Execução:** Node.js (v20.x LTS)
- **Linguagem:** TypeScript (v5.x)
- **Backend:** Express (v4.18.x)
- **Frontend:** React (v18.x) empacotado via Vite
- **Estilização:** Tailwind CSS (v3.4.x)
- **Comunicação SOAP:** `strong-soap` (v3.x). _Motivo: Possui melhor suporte maduro aos metadados complexos do WSDL governamental e injeção de HTTPS Agent (mTLS/Certificados) comparado ao `soap` base._
- **Segurança (Gateway):** `express-rate-limit` (v7.1.x)

## 2. Dependências do Projeto (Monorepo)

**Produção (dependencies):**

- `express` & `cors` (Core da API REST)
- `strong-soap` (Cliente Consumidor de WSDL SEFAZ)
- `dotenv` (Injeção segura das variáveis e senhas do certificado)
- `express-rate-limit` (Contenção de abusos de IP/DDoS local)
- `react`, `react-dom` & `tailwindcss` (Core do Frontend Visual)

**Desenvolvimento (devDependencies):**

- `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/react`
- `vite` (Bundler do Frontend)
- `tsx` ou `ts-node-dev` (Hot-reload do Backend)
- `jest`, `ts-jest`, `@testing-library/react` (Framework de testes exigido pelo SDD)

## 3. Variáveis de Ambiente Necessárias (`.env`)

- `PORT`: Porta de execução (ex: 3000).
- `NODE_ENV`: Contexto atual (`development` | `production`).
- `SEFAZ_WSDL_URL_SP`: Endpoint absoluto para o WSDL Estadual (SP).
- `CERT_PATH`: Caminho físico absoluto/relativo no servidor apontando para o arquivo físico `.pfx` ou `.p12`.
- `CERT_PASS`: Senha criptográfica para desbloquear a chave privada do certificado.
- `SOAP_TIMEOUT_MS`: Threshold de falha (Valor padrão fixado no SRD em `15000` / 15 segundos).

## 4. Integração Externa (SEFAZ)

- **Alvo:** WebService Estadual "ConsultaCadastro" SOAP 1.2.
- **Protocolo de Transporte:** HTTPS Exclusivo. O Handshake exige `Client Certificate` (mTLS). O objeto `https.Agent` do Node.js será ancorado dentro da chamada da lib `strong-soap`.
- **Comportamento em Indisponibilidade:**
  - Timeout por demora (>15s): O gateway do Express corta a request e devolve `504 Gateway Timeout` ao React.
  - Rejeição/Falha de Certificado: Parse imediato devolvendo `502 Bad Gateway` (Erro Sefaz) ou `500 Internal Error` (Arquivo de certificado corrompido localmente).

## 5. Configuração de Ambiente

**Requisitos Mínimos:**

- Node.js v20+ instanciado.
- Arquivo de Certificado Digital A1 (.pfx) válido emitido para a empresa e depositado localmente na pasta `certs/`.
- Arquivo `.env` corretamente populado.

**Scripts de Início Rápido (Ideais):**

- Instalação: `npm install` (Instala tanto dependências de back quanto front em workspaces).
- Dev Mode: `npm run dev` (Inicia o Vite e o Express Node.js em modo watch simultâneos).
- Test Mode: `npm run test` (Executa spec-validations do SDD).
- Prod Mode: `npm run build && npm run start` (Compila TypeScript, e o Vite empacota o React na pasta public/ do Express).
