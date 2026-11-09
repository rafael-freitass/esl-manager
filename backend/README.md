# Backend — ESL Manager

API REST responsável pelo catálogo de produtos, cadastro de etiquetas,
associações e sincronização de conteúdo com dispositivos na rede local.

[Visão geral do projeto](../README.md) · [Frontend](../frontend/README.md)

## Tecnologias e organização

O `pom.xml` declara Java 25 e Spring Boot 4.1.2, com Spring Web MVC, Spring Data
JPA, Jakarta Validation e driver PostgreSQL. O Maven Wrapper configura Maven
3.10.0. Os dados são persistidos nas tabelas `produtos` e `etiquetas`.

Os pacotes ficam em `src/main/java/br/edu/ifpr/eslmanager/`:

| Pacote            | Responsabilidade                                                        |
| ----------------- | ----------------------------------------------------------------------- |
| `api` e `api/dto` | Controllers REST, validação de entrada, respostas e tratamento de erros |
| `domain`          | Entidades, estados de sincronização e regras de limpeza                 |
| `repository`      | Persistência JPA, bloqueios e atualizações condicionais de versão       |
| `service`         | Operações transacionais, eventos e execução assíncrona                  |
| `adapter`         | Contrato de transporte e implementação HTTP/JSON                        |

## Configuração e execução

Requisitos: JDK 25 e um PostgreSQL acessível. A versão do PostgreSQL não está
fixada no repositório. Não é necessário instalar Maven separadamente.

Crie o banco antes da primeira execução:

```bash
psql -h localhost -U postgres -c 'CREATE DATABASE esl_manager;'
```

Execute os comandos abaixo dentro de `backend/`:

```bash
export DB_USERNAME=postgres
read -rsp 'Senha do PostgreSQL: ' DB_PASSWORD
export DB_PASSWORD
bash mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run` e defina as variáveis de ambiente no
terminal correspondente. A API utiliza a porta `8080` por padrão.

| Variável de ambiente    | Padrão                                         | Finalidade                                            |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| `DB_USERNAME`           | `postgres`                                     | Usuário do banco                                      |
| `DB_PASSWORD`           | Sem padrão; obrigatória                        | Senha do banco                                        |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/esl_manager` | Sobrescreve o endereço JDBC configurado               |
| `SERVER_PORT`           | `8080`                                         | Sobrescreve a porta HTTP do Spring Boot               |
| `ESL_HTTP_TIMEOUT`      | `7s`                                           | Prazo positivo para conexão e resposta do dispositivo |

A configuração está em `src/main/resources/application.properties`. O backend
não carrega arquivos `.env` por conta própria: exporte as variáveis no processo
que inicia o Java. O Hibernate usa `ddl-auto=update`; não há migrações versionadas
nem carga inicial de dados incluídas.

## API REST

Base local: `http://localhost:8080`. Requisições com corpo usam
`Content-Type: application/json`. As listagens retornam arrays sem paginação.

### Produtos

| Método   | Caminho                              | Corpo / comportamento                                                                      |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `GET`    | `/api/produtos`                      | Lista produtos ordenados por nome                                                          |
| `POST`   | `/api/produtos`                      | `{ "codigoBarras": "7891234567890", "nome": "Café 500 g", "preco": 19.90 }`; retorna `201` |
| `PATCH`  | `/api/produtos/{codigoBarras}`       | `{ "nome": "Café 500 g", "preco": 21.90 }`; exige ambos os campos                          |
| `PATCH`  | `/api/produtos/{codigoBarras}/preco` | `{ "preco": 21.90 }`                                                                       |
| `DELETE` | `/api/produtos/{codigoBarras}`       | Exclui se não houver etiquetas associadas; retorna `204`                                   |

O código de barras é único, obrigatório e limitado a 32 caracteres; o nome é
obrigatório e limitado a 120. O preço aceita de `0` a `99999999.99`, com até duas
casas decimais. O código de barras não é alterado pelos endpoints de atualização.
Uma resposta de produto contém `codigoBarras`, `nome` e `preco`.

### Etiquetas

| Método   | Caminho                       | Corpo / comportamento                                                        |
| -------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `GET`    | `/api/etiquetas`              | Lista; aceita `busca` por nome/código e `status=DISPONIVEL` ou `ASSOCIADA`   |
| `GET`    | `/api/etiquetas/{id}`         | Consulta uma etiqueta                                                        |
| `POST`   | `/api/etiquetas`              | `{ "nome": "Prateleira A1", "codigoDispositivo": "ESL-001" }`; retorna `201` |
| `PUT`    | `/api/etiquetas/{id}`         | Mesmo corpo do cadastro; atualiza nome e código                              |
| `DELETE` | `/api/etiquetas/{id}`         | Exclui quando permitido; retorna `204`                                       |
| `PUT`    | `/api/etiquetas/{id}/produto` | `{ "codigoBarras": "7891234567890" }`; associa ou substitui o produto        |
| `DELETE` | `/api/etiquetas/{id}/produto` | Desassocia e solicita limpeza; retorna a etiqueta                            |

O nome é obrigatório e limitado a 24 caracteres. O código do dispositivo é
obrigatório, único, limitado a 64 caracteres e normalizado para maiúsculas, sem
espaços nas extremidades. Cada etiqueta referencia no máximo um produto; várias
etiquetas podem referenciar o mesmo produto.

A resposta inclui `id`, `nome`, `codigoDispositivo`, `status`,
`codigoBarrasProduto`, `statusAtualizacao`, `erroAtualizacao`,
`aguardandoRegistro`, `podeExcluir` e `motivoBloqueioExclusao`.

### Erros e regras de exclusão

O tratamento centralizado retorna `ProblemDetail`, com mensagem no campo `detail`:

- `400`: falha de validação dos dados enviados.
- `404`: produto ou etiqueta não encontrado.
- `409`: código duplicado ou operação bloqueada por uma regra de negócio.

Produtos associados não podem ser excluídos. A exclusão de etiquetas e a troca
de código exigem ausência de produto e confirmação da limpeza da versão atual.
A exceção é uma etiqueta recém-criada, ainda sem registro, associação ou alteração
de versão. Renomear uma etiqueta não exige a limpeza.

## Integração com dispositivos

### Registro de endereço

Cadastre primeiro a etiqueta pela interface ou API. Depois, o dispositivo deve
informar seu endereço ao backend:

```bash
curl -X POST http://localhost:8080/api/dispositivos/registro \
  -H 'Content-Type: application/json' \
  -d '{"codigoDispositivo":"ESL-001","host":"192.168.1.50","porta":80}'
```

O retorno `200` contém `codigoDispositivo`, `host` e `porta`. A porta deve estar
entre `1` e `65535`. São aceitos `localhost`, IPs de loopback, IPv4 privados
(`10/8`, `172.16/12`, `192.168/16`) e IPv6 locais únicos (`fc00::/7`). Não são
aceitos URLs, nomes DNS arbitrários, IPs públicos ou porta embutida no host.

O endereço precisa ser alcançável **a partir do backend**. `localhost` aponta
para a própria máquina ou ambiente de execução do backend. Cada registro gera
uma nova versão e solicita envio, mesmo quando o endereço não mudou.

### Conteúdo e confirmação

O dispositivo deve implementar `POST http://{host}:{porta}/display`. Exemplo de
corpo enviado pelo backend (a versão varia a cada alteração):

```json
{
  "codigoDispositivo": "ESL-001",
  "versao": 3,
  "produto": {
    "codigoBarras": "7891234567890",
    "nome": "Café 500 g",
    "preco": 19.9
  }
}
```

Para limpar o display, o backend envia `"produto": null`. O dispositivo deve
responder com HTTP `200`, `Content-Type: application/json` e confirmação (ACK):

```json
{
  "codigoDispositivo": "ESL-001",
  "versao": 3,
  "aplicada": true
}
```

O código e a versão inteira devem corresponder exatamente ao envio, e `aplicada`
deve ser o booleano `true`. Uma resposta HTTP de sucesso sem ACK válido não
confirma a atualização. Redirecionamentos não são seguidos.

### Ciclo de sincronização

| Estado       | Significado                                                 |
| ------------ | ----------------------------------------------------------- |
| `PENDENTE`   | Conteúdo atual ainda não confirmado; pode aguardar registro |
| `ENVIANDO`   | Tentativa de envio em andamento                             |
| `ATUALIZADA` | ACK válido da versão atual persistido                       |
| `ERRO`       | Tentativa encerrada sem confirmação válida                  |

Os envios são disparados após o commit da transação, em um executor com duas
threads e fila de até 100 tarefas. O HTTP é executado fora da transação do banco.
Atualizações condicionais por versão, código e endereço evitam que respostas
antigas confirmem um conteúdo mais recente.

Alterações efetivas de nome/preço do produto, associação, desassociação e registro
solicitam sincronização. Repetir uma associação já existente ou uma desassociação
já concluída no cadastro não dispara um novo envio.

Os erros possíveis são `TIMEOUT`, `FALHA_COMUNICACAO`, `RESPOSTA_HTTP_INVALIDA`,
`ACK_INVALIDO`, `ENVIO_NAO_AGENDADO`, `ENVIO_INTERROMPIDO` e `FALHA_INTERNA`.
Para solicitar uma nova tentativa após falha, registre novamente o dispositivo.
Não há retentativa periódica automática. Ao iniciar, o backend marca envios que
ficaram em `ENVIANDO` como interrompidos; a fila não é persistente. A recuperação
atual pressupõe uma única instância do backend.

## Build e verificações

Dentro de `backend/`:

```bash
bash mvnw clean package
java -jar target/eslmanager-0.0.1-SNAPSHOT.jar
```

A execução do JAR exige as mesmas variáveis de ambiente e conexão PostgreSQL.
Para executar testes quando forem adicionados:

```bash
bash mvnw test
```

Há dependências de teste configuradas, mas não há classes de teste na árvore
atual. Um build concluído não comprova a integração com banco ou hardware.

## Diagnóstico

| Sintoma                                    | Verificação                                                         |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Falha ao iniciar por configuração do banco | Confira `DB_PASSWORD`, usuário, URL JDBC e existência do banco      |
| Etiqueta pendente, aguardando registro     | Registre o código já cadastrado com host e porta acessíveis         |
| `TIMEOUT` ou `FALHA_COMUNICACAO`           | Confira rede, porta, serviço `/display` e `ESL_HTTP_TIMEOUT`        |
| `ACK_INVALIDO`                             | Confira tipo de conteúdo, código, versão inteira e `aplicada: true` |
| Exclusão retorna `409`                     | Remova associações; para etiquetas, aguarde o ACK de limpeza        |

Não há autenticação nem configuração explícita de CORS no backend. O frontend
usa o proxy do Vite no desenvolvimento; uma implantação com origens distintas
precisa configurar CORS ou um proxy que exponha a API na mesma origem.
