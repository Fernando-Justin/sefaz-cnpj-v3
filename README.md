# 🏢 Sefaz CNPJ v3

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SOAP](https://img.shields.io/badge/Integration-SOAP_mTLS-blue)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Visão Geral

**Sefaz CNPJ v3** é uma solução _Fullstack_ (Backend Node.js + Frontend React) de alta performance projetada para simplificar a vida de desenvolvedores e usuários na consulta de dados de Pessoas Jurídicas (PJ).

O sistema encapsula a complexidade do protocolo SOAP exigido pelo WebService da Secretaria da Fazenda (SEFAZ) do estado de São Paulo, provendo uma interface Web moderna, limpa e segura, que realiza a autenticação máquina-a-máquina (mTLS) utilizando um Certificado Digital corporativo (A1).

---

## 🏗️ Estrutura de Documentação (Software Design Documents - SDD)

Este projeto adota uma disciplina estrita de engenharia de software baseada em documentos de design técnico. Todo código refletido aqui é fruto de planejamento prévio. A documentação vive ativamente no repositório:

- **📄 [PRD](PRD.md) (Product Requirements Document)**
  Define o "porquê" do projeto. Traduz objetivos de negócios em requisitos de produto, mapendo casos de uso, restrições não-funcionais e o valor entregue ao usuário final.

- **📄 [SRD](.context/srd.md) (Software Requirements Document)**
  A "ponte" para a engenharia. Descreve as especificações técnicas, modelagem de APIs, tratamentos de payloads, arquitetura de rede e requisitos funcionais rigorosos derivados do PRD.

- **📄 [Architecture](docs/architecture-decisions.md)**
  Central(ADRs - Architecture Decision Records) para decisões de design crítico. Documenta os motivos pelas quais as tecnologias (Node.js, React, strict-soap) e padrões (MVC, rate-limiting) foram os escolhidos em detrimento de suas alternativas.

- **📄 [Plan](.context/plan.md)**
  Roadmap executivo do projeto. Organiza cronogramas, roteiros táticos, _milestones_ principais e ciclos de entrega contínua.

- **📄 [Context](.context/context.md)**
  O ecossistema do projeto. Detalha premissas do ambiente, infraestrutura local, hard-dependencies e o contexto de integração com a malha tributária do Governo (SEFAZ).

---

## 💻 Stack Tecnológica

O projeto foi construído sobre uma base sólida e moderna, favorecendo tipagem estrita e DX (Developer Experience):

- **Core:** Node.js, Express, React, Vite
- **Linguagem:** TypeScript (End-to-end)
- **Integração:** `strong-soap` (Para lidar com WSDL Sefaz) + mTLS via cliente Node HTTPS
- **Styling:** Tailwind CSS (Utilitário-primeiro)
- **Quality & Segurança:** Jest (Testes), `express-rate-limit` (Prevenção DDoS/Abuso de IP)

---

## 📂 Estrutura de Pastas

Organizado sob a ótica de um monorepo pragmático:

```text
sefaz-cnpj-v3/
├── .context/           # Documentos SDD vivos (Context, Plan, SRD)
├── certs/              # 🔒 Repositório de configuração do Certificado A1 (.pfx)
├── docs/               # Documentação técnica e ADRs exportados
├── src/
│   ├── api/            # 🟢 Backend Node.js (Controllers, rotas, parsers XML)
│   │   └── services/   # Camada robusta de injeção mTLS e consumo SOAP Sefaz
│   ├── components/     # 🔵 Frontend estático (Componentização em React)
│   ├── interfaces/     # Contratos e Tipos TypeScript agnósticos
│   └── pages/          # Rotas de Apresentação (UI Container)
├── tests/              # Sandbox robusta de testes (Jest)
└── package.json        # Manifest e scripts utilitários
```

---

## 🚀 Quick Start

Estamos felizes em ter você a bordo! Seguir estas etapas isolará o projeto e o manterá focado no desenvolvimento do produto principal.

### 1. Pré-Requisitos

- Node.js LTS (v20+)
- Gerenciador de dependências (`npm` ou `yarn`)
- O arquivo do Certificado Digital corporativo (`.pfx`) (Apenas se quiser bater no serviço real da SEFAZ, do contrário, usaremos Mock).

### 2. Configurando o Ambiente

Clone o repositório e crie o seu arquivo de segredos baseando-se no exemplo:

```bash
# Clone
git clone https://github.com/Fernando-Justin/sefaz-cnpj-v3.git
cd sefaz-cnpj-v3

# Variáveis
cp .env.example .env
```

**Configurando o `.env` (Modo MOCK de Desenvolvimento):**
Para trabalhar no Frontend ou lógicas de controller sem precisar do certificado real:

```env
SEFAZ_WSDL_URL_SP=https://ws.fazenda.sp.gov.br/ws/cadconsultacadastro4.asmx?wsdl
CERT_PATH=certs/certificado.pfx
CERT_PASS=1234
MOCK_SEFAZ=true # <--- Muito importante para testar sem o token real
```

### 3. Rodando Localmente

Use o utilitário nativo que levanta o TSX e o Vite de maneira simultânea (ambos com hot-reload):

```bash
# Baixa repositórios Node
npm install

# Subir a frota inteira (Backend na porta 3000 / Frontend na 5173)
npm run dev
```

> _Visite `http://localhost:5173` no seu navegador._

### 4. Alternativa (Docker em Breve)

_(Se o repositório possuir um `Dockerfile` e Compose em atualizações futuras)_:

```bash
docker-compose up --build
```

---

## 🤝 Como Contribuir

Excelentes softwares são feitos pela comunidade. Encorajamos engenheiros a contribuir:

1. Faça o **Fork** deste projeto
2. Crie a sua _Feature Branch_ (`git checkout -b feature/AmazingFeature`)
3. Siga o fluxo do documento preexistente [SDD](#%EF%B8%8F-estrutura-de-documentação-software-design-documents---sdd) para alinhar a mudança pretendida.
4. Rode as suítes de teste antes de dar commit (`npm run test`)
5. Faça o commit de forma semântica (`git commit -m 'feat: Add some AmazingFeature'`)
6. Faça o _Push_ para a branch (`git push origin feature/AmazingFeature`)
7. Abra um **Pull Request** detalhando sua alteração no corpo da PR!

## 📜 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais informações.
