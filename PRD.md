# Product Requirements Document (PRD)

## 1. Visão Geral

**Nome do Produto:** Consulta CNPJ SEFAZ
**Propósito:** Fornecer uma interface simples para que usuários humanos consultem a situação cadastral e os dados de Pessoas Jurídicas (PJ) diretamente no WebService da SEFAZ (focado na UF de SP).

## 2. Escopo

**O que está incluído:**

- Interface de usuário (Web) para inserção de CNPJ e UF.
- Integração de Backend (API) via monorepo com o WebService SOAP "ConsultaCadastro" da SEFAZ/SP.
- Autenticação com a SEFAZ utilizando Certificado Digital M2M.
- Segurança: Rate Limiting para evitar bloqueios ou abusos.
- Exibição do status e dados cadastrais retornados pela SEFAZ na tela.

**O que NÃO está incluído (Non-Goals):**

- Armazenamento de dados do CNPJ em banco de dados interno.
- Camada de cache.
- Consultas retroativas ou histórico de buscas.
- Exibição de dados altamente sensíveis (QSA/Capital Social não serão parseados caso retornados pela SEFAZ por precaução, mantendo o App simples).

## 3. Requisitos Funcionais (Core Features)

1. **Formulário de Entrada:** O usuário deve poder digitar o CNPJ e selecionar a UF.
2. **Submissão de Consulta:** O sistema deve validar (frontend) a formatação básica do CNPJ e enviar a requisição para a API local.
3. **Integração SEFAZ (SOAP):** A API deve envelopar os dados no formato SOAP exigido pela SEFAZ/SP e anexar o Certificado Digital configurado.
4. **Apresentação de Resultados (Payload 200):** O frontend deve exibir de forma clara os dados extraídos: CNPJ, Razão Social, Nome Fantasia, Situação Cadastral, Data de Abertura, Atividade Principal (CNAE) e Endereço.
5. **Tratamento de Erros:** Exibir mensagens amigáveis em caso de falha de conexão, certificado inválido, excesso de tentativas (Rate Limit), CNPJ não encontrado ou instabilidade na SEFAZ.

## 4. Requisitos Não Funcionais

- **Stack Tecnológico:** Node.js (Backend) e React com Tailwind CSS (Frontend). Estrutura mantida num único repositório.
- **Protocolo de Integração:** SOAP (SEFAZ).
- **Segurança (Certificado):** O Certificado Digital ficará armazenado APENAS no servidor (API), injetado via variáveis de ambiente (`.env`). Sob hipótese alguma será exposto no client-side.
- **Segurança (Rate Limit):** A API limitará o máximo de requisições por IP por minuto para proteger o certificado corporativo.
- **Desempenho:** O tempo de resposta estará estritamente acoplado à SEFAZ. O sistema deve apresentar um _loading_ na tela.

## 5. Casos de Uso (User Stories)

- **Como** um humano querendo verificar uma empresa, **eu quero** digitar o CNPJ na tela, **para que** eu veja imediatamente o status cadastral e nome da empresa na SEFAZ-SP.
- **Como** um humano querendo verificar uma empresa, **eu quero** ser avisado caso o CNPJ seja inválido ou não exista na base da SEFAZ.
- **Como** administrador do sistema, **eu quero** que o Rate Limit impeça uso abusivo **para que** a infraestrutura do Estado não me bloqueie.

## 6. Critérios de Aceite

- [ ] O projeto executa e apresenta uma tela limpa e intuitiva (React + Tailwind).
- [ ] O backend consegue ler um Certificado Digital local e montar a requisição SOAP.
- [ ] O Rate Limit é disparado após exceder o limite seguro definido.
- [ ] O retorno SOAP em XML é convertido e os dados essenciais (ex: Razão Social, Situação) são apresentados na tela sem persistência no servidor.
