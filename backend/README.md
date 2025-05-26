
# Personal Finance Manager - Backend

This is the backend for the Personal Finance Manager application, built with Node.js, Express, TypeScript, TypeORM, and SQLite.

## Table of Contents
1.  [Decisões de Arquitetura](#decisões-de-arquitetura)
2.  [Lógica de Desenvolvimento](#lógica-de-desenvolvimento)
3.  [Estrutura do Projeto](#estrutura-do-projeto)
4.  [Instruções de Execução](#instruções-de-execução)
    *   [Pré-requisitos](#pré-requisitos)
    *   [Instalação](#instalação)
    *   [Configuração do Ambiente](#configuração-do-ambiente)
    *   [Migrações do Banco de Dados](#migrações-do-banco-de-dados)
    *   [Executando a Aplicação](#executando-a-aplicação)
    *   [Executando Testes](#executando-testes)
5.  [Endpoints da API](#endpoints-da-api)
6.  [Cobertura de Testes](#cobertura-de-testes)


## Decisões de Arquitetura

*   **Node.js com Express:** Escolhido pela sua popularidade, vasta comunidade, e eficiência para construir APIs RESTful. Express é minimalista e flexível.
*   **TypeScript:** Para adicionar tipagem estática ao JavaScript, melhorando a robustez do código, a manutenibilidade e a experiência de desenvolvimento, especialmente em projetos maiores.
*   **TypeORM:** Um ORM (Object-Relational Mapper) maduro para TypeScript e JavaScript. Facilita a interação com bancos de dados SQL, suporta o padrão Data Mapper, e oferece boa integração com TypeScript (decorators para entidades, etc.). Alternativas como Sequelize foram consideradas, mas TypeORM foi preferido pelo seu foco em TypeScript.
*   **SQLite:** Selecionado pela simplicidade de configuração para este desafio, não requerendo um servidor de banco de dados separado. Para um ambiente de produção, um banco de dados mais robusto como PostgreSQL ou MySQL seria recomendado.
*   **Arquitetura em Camadas:**
    *   **Controllers (`src/controllers`):** Responsáveis por lidar com as requisições HTTP, validar entradas básicas e chamar os serviços apropriados.
    *   **Services (`src/services`):** Contêm a lógica de negócios principal da aplicação. São responsáveis pela orquestração das operações, validações complexas e interações com o repositório de dados (via TypeORM).
    *   **Entities (`src/entities`):** Define a estrutura das tabelas do banco de dados usando decorators do TypeORM.
    *   **Data Source (`src/config/dataSource.ts`):** Configuração da conexão com o banco de dados para o TypeORM.
*   **UUIDs para IDs:** Utilizados para chaves primárias para evitar conflitos em sistemas distribuídos e não expor a sequência de criação de registros.
*   **Variáveis de Ambiente (`.env`):** Para gerenciar configurações sensíveis ou específicas do ambiente (porta, caminho do banco de dados).

## Lógica de Desenvolvimento

*   **Criação de Transações e Atualização de Saldos:**
    *   Ao criar uma transação (débito, crédito, transferência), os saldos das contas envolvidas são atualizados atomicamente. Isso é gerenciado dentro de uma transação de banco de dados (`AppDataSource.manager.transaction(async (entityManager) => { ... })`) para garantir que, se qualquer parte da operação falhar (ex: atualização de saldo, salvamento da transação), todas as alterações sejam revertidas, mantendo a consistência dos dados.
    *   Para débitos e transferências, o saldo da conta de origem é verificado antes de permitir a transação.
*   **Exclusão de Transações e Reversão de Saldos:**
    *   Similarmente à criação, a exclusão de uma transação também ocorre dentro de uma transação de banco de dados.
    *   Os valores são revertidos nos saldos das contas: se um débito é excluído, o valor é creditado de volta à conta de origem; se um crédito é excluído, o valor é debitado da conta de destino.
*   **Exclusão de Contas:**
    *   Uma conta só pode ser excluída se não houver transações associadas a ela (nem como origem, nem como destino). Isso previne inconsistências e perda de histórico financeiro atrelado a uma conta.
*   **Validações:**
    *   Validações básicas (campos obrigatórios, tipos) são feitas nos controllers.
    *   Validações de lógica de negócios (saldo suficiente, contas válidas) são feitas nos services.

## Estrutura do Projeto

```
/backend
  /dist                 # Código transpilado para JavaScript (gerado pelo build)
  /node_modules         # Dependências do projeto
  /src
    /config             # Configurações (ex: TypeORM DataSource)
      dataSource.ts
    /constants          # Constantes e Enums (AccountType, TransactionType)
    /controllers        # Lógica de manipulação de requisições HTTP (Express)
      AccountController.ts
      TransactionController.ts
    /entities           # Definições de entidades TypeORM (modelos de dados)
      Account.ts
      Transaction.ts
    /migrations         # Arquivos de migração do banco de dados TypeORM
      placeholder.txt
    /services           # Lógica de negócios da aplicação
      AccountService.ts
      TransactionService.ts
    index.ts            # Ponto de entrada principal da aplicação (inicializa o servidor)
    server.ts           # Configuração e inicialização do servidor Express
  /tests                # Testes unitários e de integração
    /services
      AccountService.spec.ts # Exemplo de teste
  .env.example          # Exemplo de arquivo de variáveis de ambiente
  .gitignore
  jest.config.js        # Configuração do Jest (se não estiver no package.json)
  package.json
  README.md
  tsconfig.json         # Configuração do TypeScript
```

## Instruções de Execução

### Pré-requisitos
*   Node.js (versão 18.x ou superior recomendada)
*   NPM ou Yarn

### Instalação
1.  Clone o repositório (ou navegue para a pasta `backend` se já baixou).
2.  Instale as dependências:
    ```bash
    cd backend
    npm install
    # ou
    # yarn install
    ```

### Configuração do Ambiente
1.  Crie um arquivo `.env` na raiz da pasta `backend` copiando o `.env.example`:
    ```bash
    cp .env.example .env
    ```
2.  Edite o arquivo `.env` conforme necessário. Por padrão, ele usará um arquivo SQLite chamado `database.sqlite` na raiz da pasta `backend`.
    ```
    PORT=3001
    DATABASE_PATH=./database.sqlite
    ```

### Migrações do Banco de Dados
O TypeORM usa migrações para gerenciar o esquema do banco de dados.

1.  **Gerar uma nova migração (após fazer alterações nas entidades):**
    ```bash
    npm run migration:generate InitialSchema
    # Substitua 'InitialSchema' por um nome descritivo para sua migração.
    # Ex: npm run migration:generate src/migrations/InitialSchema
    ```
    Isso criará um novo arquivo de migração na pasta `src/migrations`. Você pode precisar ajustar o caminho no comando se a estrutura for diferente.

2.  **Executar migrações (para aplicar o esquema ao banco de dados):**
    ```bash
    npm run migration:run
    ```
    Isso criará o arquivo `database.sqlite` (se não existir) e aplicará todas as migrações pendentes.

3.  **Reverter a última migração (se necessário):**
    ```bash
    npm run migration:revert
    ```

### Executando a Aplicação

*   **Modo de Desenvolvimento (com auto-reload usando `ts-node-dev`):**
    ```bash
    npm run dev
    ```
    O servidor estará disponível em `http://localhost:3001` (ou a porta definida no `.env`).

*   **Modo de Produção:**
    1.  Compile o código TypeScript para JavaScript:
        ```bash
        npm run build
        ```
    2.  Inicie o servidor:
        ```bash
        npm start
        ```

### Executando Testes
(Configuração de teste com Jest é fornecida. Pode precisar de ajustes).
```bash
npm test
```

## Endpoints da API

(Assumindo que o servidor está rodando em `http://localhost:3001`)

### Contas (`/api/accounts`)
*   `POST /`: Cria uma nova conta.
    *   Corpo: `{ "name": "string", "type": "AccountType", "initialBalance": number (opcional) }`
*   `GET /`: Lista todas as contas.
*   `GET /:id`: Obtém uma conta específica pelo ID.
*   `PUT /:id`: Atualiza uma conta (nome, tipo).
    *   Corpo: `{ "name": "string" (opcional), "type": "AccountType" (opcional) }`
*   `DELETE /:id`: Exclui uma conta (se não tiver transações associadas).

### Transações (`/api/transactions`)
*   `POST /`: Cria uma nova transação.
    *   Corpo: `{ "type": "TransactionType", "amount": number, "date": "YYYY-MM-DD", "description": "string" (opcional), "sourceAccountId": "uuid" (opcional), "destinationAccountId": "uuid" (opcional) }`
    *   `sourceAccountId` é obrigatório para `Débito` e `Transferência`.
    *   `destinationAccountId` é obrigatório para `Crédito` e `Transferência`.
*   `GET /`: Lista todas as transações.
    *   Query params opcionais: `accountId`, `startDate`, `endDate`.
*   `DELETE /:id`: Exclui uma transação (e reverte os saldos).

## Cobertura de Testes

*   **O que foi testado (exemplo):**
    *   A `AccountService` possui testes unitários para a lógica de criação de contas, incluindo validação de saldo inicial e atribuição de valores padrão.
    *   A lógica de exclusão de contas, verificando se há transações associadas, também é coberta.
*   **Como os testes foram implementados:**
    *   Utiliza-se Jest como framework de testes.
    *   As dependências do TypeORM (como `getRepository`) são mockadas para isolar os serviços durante os testes unitários. Isso permite testar a lógica de negócios do serviço sem depender de uma conexão real com o banco de dados.
    *   Os mocks são configurados no início de cada suíte de testes (`describe`) ou em um arquivo de setup global do Jest (não incluído neste exemplo básico).
*   **Próximos Passos para Testes:**
    *   Expandir a cobertura para todos os métodos de todos os serviços (`TransactionService`).
    *   Testar cenários de erro (ex: tentar criar uma transferência com saldo insuficiente).
    *   Adicionar testes de integração para verificar a interação entre controllers, services e o banco de dados (usando um banco de dados de teste).
    *   Testar os controllers para garantir que as rotas estão funcionando corretamente e validando as entradas.

---

Este `README.md` fornece um guia abrangente. Você precisará adaptar os comandos de migração e teste conforme a configuração exata do seu ambiente e `package.json`.
