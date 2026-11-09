# Frontend — ESL Manager

Interface web para consultar e manter produtos, gerenciar etiquetas eletrônicas
e acompanhar a confirmação de conteúdo pelos dispositivos.

[Visão geral do projeto](../README.md) · [API e integração com dispositivos](../backend/README.md)

## Tecnologias

- React 19 e React DOM, com TypeScript 6.
- Vite 8 para desenvolvimento e build.
- React Router 8 para navegação no navegador.
- Lucide React para ícones e CSS organizado por componentes e páginas.
- ESLint e Prettier para análise e formatação.
- Vitest, Testing Library e jsdom como dependências de teste.

As versões declaradas estão em `package.json`; `package-lock.json` fixa a árvore
de dependências usada pelo `npm ci`.

## Instalação e execução

Use Node.js 24 com npm, compatível com os requisitos das ferramentas no lockfile.
Para consultar e salvar dados, inicie também o [backend](../backend/README.md).

Dentro de `frontend/`:

```bash
npm ci
cp .env.example .env
npm run dev
```

Abra o endereço informado no terminal, normalmente `http://localhost:5173`.
No Windows, copie `.env.example` para `.env` pelo terminal ou explorador de
arquivos. A configuração padrão conecta a interface ao backend na porta `8080`.

## Variáveis de ambiente

| Variável           | Padrão                  | Uso                                                    |
| ------------------ | ----------------------- | ------------------------------------------------------ |
| `VITE_API_URL`     | Vazio                   | Origem/base da API usada pelo navegador                |
| `VITE_BACKEND_URL` | `http://localhost:8080` | Destino do proxy `/api` no servidor de desenvolvimento |

Com `VITE_API_URL` vazio, as requisições usam caminhos relativos, como
`/api/produtos`. Durante o desenvolvimento, o proxy definido em `vite.config.ts`
encaminha esses caminhos ao backend.

Para mudar a porta do backend mantendo o proxy:

```dotenv
VITE_API_URL=
VITE_BACKEND_URL=http://localhost:8081
```

Para acesso direto pelo navegador, use uma origem como
`VITE_API_URL=http://localhost:8080`, sem acrescentar `/api`: o cliente já inclui
esse prefixo nos endpoints. Esse modo exige CORS se a API estiver em outra
origem; o backend atual não inclui essa configuração.

Reinicie o Vite após alterar o ambiente. As variáveis `VITE_*` usadas pelo cliente
são incorporadas ao build e não devem conter segredos.

## Telas e comportamento

| Rota         | Recursos                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `/`          | Resumo de etiquetas totais, disponíveis e associadas; atalhos para gestão                            |
| `/etiquetas` | Busca por nome/código, filtro por associação, cadastro, edição, exclusão, associação e desassociação |
| `/produtos`  | Busca por nome/código de barras, cadastro, edição de nome/preço e exclusão                           |

Rotas desconhecidas redirecionam para `/`. O código de barras de um produto não
pode ser editado após o cadastro. Preços são exibidos em reais, com formatação
`pt-BR`.

A tela de etiquetas distingue associação (**Disponível** ou **Associada**) de
sincronização (**Pendente**, **Enviando**, **Atualizada** ou **Falha na atualização**).
O estado **Atualizada** significa que o dispositivo confirmou o conteúdo atual;
não representa uma verificação contínua de conectividade.

A interface apresenta os motivos de bloqueio de exclusão/troca de código
recebidos da API. Produtos precisam ser desassociados antes de serem excluídos.
Para excluir etiquetas já utilizadas, é necessário aguardar a confirmação de
limpeza do dispositivo.

O registro de host e porta do dispositivo é feito pela API, sem uma tela dedicada.
Em caso de falha no envio, registre novamente o dispositivo seguindo o
[contrato do backend](../backend/README.md#integração-com-dispositivos).

## Organização do código

```text
src/
├── main.tsx                 # Inicialização, StrictMode e BrowserRouter
├── App.tsx                  # Coordenação de produtos, etiquetas e mensagens
├── routes/AppRoutes.tsx     # Rotas e composição das páginas
├── pages/                  # Início, etiquetas e produtos
├── components/             # Layout, modal, botões, ícones e diálogos
├── config/
│   ├── api.ts              # Fetch, timeout e erros HTTP
│   └── pages.ts            # Caminhos e metadados da navegação
├── services/eslManagerApi.ts # Endpoints e conversão dos DTOs
├── hooks/                  # Consultas, mutações e estado dos diálogos
├── types/                  # Tipos de produtos, etiquetas e diálogos
├── styles/                 # CSS base, layout, componentes e páginas
├── utils/formatPrice.ts    # Formatação monetária
└── index.css               # Entrada dos estilos
```

`eslManagerApi.ts` converte os nomes dos campos da API para os tipos da interface:
por exemplo, `codigoBarras` para `code` e `codigoDispositivo` para `identifier`.

`useApiList` centraliza carregamento, erros e atualização das listas. As consultas
ocorrem a cada cinco segundos quando a página está visível, também ao recuperar
foco/visibilidade e por ação manual. Requisições antigas são canceladas, e leituras
são suspensas durante mutações para evitar sobrescrever alterações com respostas
anteriores. Não há WebSocket nem dados simulados como alternativa à API.

O cliente HTTP tem timeout de 15 segundos e usa o campo `detail` dos erros da API
nas mensagens. Se uma gravação exceder o prazo, atualize a lista antes de repetir
a operação, pois ela pode ter sido processada pelo servidor.

## Comandos

Execute dentro de `frontend/`:

| Comando                | Finalidade                                                   |
| ---------------------- | ------------------------------------------------------------ |
| `npm ci`               | Instala dependências a partir do lockfile                    |
| `npm run dev`          | Inicia o servidor de desenvolvimento                         |
| `npm run build`        | Executa `tsc -b` e gera a aplicação em `dist/`               |
| `npm run preview`      | Serve o build localmente para conferência                    |
| `npm run lint`         | Executa ESLint                                               |
| `npm run format:check` | Verifica a formatação com Prettier                           |
| `npm run format`       | Reescreve a formatação dos arquivos abrangidos pelo Prettier |
| `npm test`             | Executa Vitest com ambiente jsdom                            |

Não há arquivos de teste na árvore atual. O comando `npm test` está preparado
para testes futuros e pode encerrar com erro por não encontrar testes.

## Build e hospedagem

```bash
npm run build
npm run preview
```

Publique o conteúdo de `dist/` em um servidor de arquivos estáticos. Como a
aplicação usa `BrowserRouter`, configure fallback para `index.html` nas rotas
da interface, permitindo abrir `/etiquetas` e `/produtos` diretamente.

O proxy de desenvolvimento não faz parte dos arquivos de `dist/`. Com
`VITE_API_URL` vazio, configure no servidor de hospedagem o encaminhamento de
`/api` ao backend antes do fallback da SPA. Para usar outra origem, defina
`VITE_API_URL` antes do build e configure CORS na API. `npm run preview` serve
para conferência local do build.

## Diagnóstico

| Sintoma                                                | Verificação                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| Não foi possível conectar ao servidor                  | Confira backend, porta e `VITE_BACKEND_URL`                 |
| Erro de CORS com API direta                            | Use o proxy no desenvolvimento ou configure CORS no backend |
| Listas vazias sem erro                                 | Cadastre produtos/etiquetas; não há carga inicial incluída  |
| Etiqueta aguardando registro                           | Registre host e porta pela API de dispositivos              |
| Mudanças no `.env` não aparecem                        | Reinicie o Vite ou gere novamente o build                   |
| Abrir uma rota diretamente retorna `404` na hospedagem | Configure fallback das rotas da interface para `index.html` |
