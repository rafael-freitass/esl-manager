# ESL Manager — Frontend

Aplicação web para consultar produtos e gerenciar etiquetas eletrônicas de
preço (ESL), incluindo a associação entre etiquetas e produtos. A interface está
em português (pt-BR) e foi construída com React, TypeScript, Vite e React
Router.

## Requisitos

- Node.js 20.19 ou superior, ou 22.12 ou superior.
- npm.

## Como executar

Na pasta `frontend`, instale as dependências e inicie o servidor de
desenvolvimento:

```bash
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador. Para gerar
e servir localmente a versão de produção:

```bash
npm run build
npm run preview
```

## Funcionalidades

- **Início (`/`)**: resumo de etiquetas totais, disponíveis e associadas, com
  atalhos para as demais áreas.
- **Etiquetas (`/etiquetas`)**: consulta, busca por identificador, filtro por
  status, criação, edição e exclusão de etiquetas; associação e remoção da
  associação com produtos. Identificadores são normalizados para maiúsculas e
  não podem se repetir.
- **Produtos (`/produtos`)**: catálogo para consulta com busca por nome ou
  código e exibição de preço.

Atualmente os Mockups das etiquetas estão em `src/data/labels.json` e dos produtos estão em
`src/data/products.json`. Ambos são dados JSON, que servem como demonstração. A conexão com o banco de dados ocorrerá posteriomente.

## Comandos

| Comando                | Descrição                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento do Vite.                               |
| `npm run build`        | Verifica os tipos com TypeScript e gera os arquivos de produção em `dist/`. |
| `npm run preview`      | Serve localmente a build de produção.                                       |
| `npm run lint`         | Analisa o projeto com ESLint.                                               |
| `npm run format`       | Formata os arquivos com Prettier.                                           |
| `npm run format:check` | Verifica a formatação sem alterar os arquivos.                              |

## Estrutura do projeto

```text
src/
├── components/       # Layout, elementos compartilhados e diálogos de etiquetas
├── config/           # Metadados das páginas e rotas
├── data/             # Dados locais de produtos e etiquetas
├── hooks/            # Estado e operações de gerenciamento de etiquetas
├── Pages/            # Telas de início, etiquetas e produtos
├── routes/           # Definição das rotas da aplicação
├── styles/           # Estilos de layout, componentes, páginas e responsividade
├── types/            # Tipos do domínio e dos diálogos
├── utils/            # Funções utilitárias, como formatação de preços
├── App.tsx           # Composição da aplicação e diálogos globais
└── main.tsx          # Ponto de entrada React e configuração do roteador
```
