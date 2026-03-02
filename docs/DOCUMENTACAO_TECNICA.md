---

## 1. VISÃO GERAL
- **Propósito**: O sistema permite a consulta de situação cadastral e dados básicos de Pessoas Jurídicas (PJ) no estado de SP diretamente pelo WebService governamental da SEFAZ de forma simplificada e on-the-fly.
- **Público-alvo**: Usuários humanos que precisem validar rapidamente dados e o status oficial de empresas sem lidar com a complexidade técnica do protocolo SOAP do governo.
- **Stack principal**: Node.js (Express), React (Vite) e Tailwind CSS, intermediando comunicações SOAP governamentais via `strong-soap` com mTLS.

---

## 2. ANÁLISE DOS ARQUIVOS PRINCIPAIS

### 📄 PRD.md

Define o escopo do **Product Requirements Document**, centrando em uma interface Web simples para entrada de CNPJ/UF e retorno em tela. Determina o que será feito (validações, integração SOAP) e os non-goals (sem banco de dados ou cache local).

### 📄 .context/srd.md

Documenta o **System Requirements Document**, traduzindo o PRD em arquitetura técnica. Especifica a topologia Monorepo, contratos de API REST (códigos HTTP), limites (Rate Limiting de 10 req/min) e a mecânica de segurança (mTLS via certificado A1 local no backend).

### 📄 .context/context.md

Consolida o **Contexto Técnico e Ferramental**, registrando versões exatas das bibliotecas (Node 20, React 18, Tailwind 3.4). Documenta o porquê do uso do `strong-soap`, as variáveis de ambiente essenciais (`.env`) e regras de infra de timeout e indisponibilidade.

### 📄 docs/Revisao_PRD_SRD.md

É uma **Auditoria de Consistência** entre o Produto (PRD) e o Sistema (SRD). Mapeia falhas iniciais de alinhamento estrutural, sugere o uso de Rate Limit explícito e define a necessidade de proteger as chaves de certificado no backend.

### 📄 docs/architecture-decisions.md

Registra **ADRs (Architecture Decision Records)** básicos. Seu objetivo documentar a razão da escolha das tecnologias Node.js, React, Tailwind e SOAP para o projeto, servindo como histórico de decisão de design (atualmente em estágio inicial/esboço).

---

## 3. ARQUITETURA

- **Padrão Arquitetural**: MVC / Monorepo (Backend API REST + Frontend SPA).
- **Estrutura de Pastas**:
  ```text
  sefaz-cnpj-v3/
  ├── certs/          # Repositório de Certificados Digitais A1 locais para mTLS
  ├── src/
  │   ├── api/        # Backend (Node.js/Express)
  │   │   ├── controllers/, services/, utils/, app.ts
  │   ├── components/ # Frontend UI Components (React/Tailwind)
  │   ├── pages/      # Frontend Views (React/Tailwind)
  │   ├── interfaces/ # Contratos TypeScript compartilhados (CompanyData)
  ```
- **Fluxo Principal**:
  1. `Frontend` valida formato/dígitos e chama `API Local`.
  2. `API Express (RateLimiter)` aceita e envia a requisição ao `Service`.
  3. `Service` monta o envelope SOAP, anexa o Certificado Digital (`.pfx`) configurado no `.env` e bate na Sefaz.
  4. XML Sefaz retorna, `Service` converte e repassa JSON limpo (`CompanyData`) ao `Frontend` que exibe em tela.

---

## 4. PONTOS DE ATENÇÃO

- **Dependências críticas**: A biblioteca `strong-soap` é o coração da comunicação mTLS com a base governamental e lida com as complexidades legadas como WSDL e SOAP.
- **Débitos técnicos visíveis**: A arquitetura de interface e rotas SOAP ainda usa tratamentos manuais sem tipagem estrita para requests/responses da SEFAZ, devido à tipagem natural do TypeScript para SOAP ser limitada; e o ADR (`architecture-decisions.md`) ainda está em formato de rascunho.
- **Próximos passos sugeridos**: Implementar testes unitários (citados no SDD/context), finalizar a documentação do ADR com decisões técnicas concretas do porquê Node foi preferido, e criar um script de healthcheck que valide o WSDL da SEFAZ antes de iniciar o Express.
