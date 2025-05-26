# Gestor Financeiro Pessoal

## Objetivo
Avaliar o conhecimento técnico em React JS, Tailwind CSS, Node JS, TypeORM e SQL, além da capacidade de aplicar os princípios de Orientação a Objetos, Clean Code e testes unitários na construção de uma aplicação web funcional e bem estruturada. Também será avaliada a atenção aos detalhes de código, interface do usuário e as decisões de arquitetura tomadas.

## Descrição do Desafio
Desenvolver uma aplicação web para gerenciar finanças pessoais. A aplicação deve permitir o cadastro de contas bancárias e o registro de transações financeiras (débito, crédito, transferência) entre essas contas.

## Tecnologias Utilizadas

*   **Frontend:**
    *   React JS (com Hooks)
    *   TypeScript
    *   Tailwind CSS
    *   ESM (via esm.sh para dependências no navegador)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   TypeScript
    *   TypeORM (com SQLite)
    *   SQLite3
*   **Geral:**
    *   Git (Controle de Versão)
    *   Princípios de Clean Code e Orientação a Objetos

## Decisões de Arquitetura

### Frontend
*   **React com Hooks:** Utilizado para criar uma interface de usuário reativa e componentizada. Hooks como `useState`, `useEffect`, e `useCallback` são empregados para gerenciar estado, efeitos colaterais e otimizações de performance.
*   **Componentização:** A UI é dividida em componentes reutilizáveis (localizados em `src/components`) para promover a modularidade e a manutenibilidade.
*   **Tailwind CSS:** Framework CSS utility-first escolhido para estilização rápida, responsiva e customizável diretamente no HTML/JSX.
*   **TypeScript:** Para tipagem estática, melhorando a robustez e a experiência de desenvolvimento.
*   **Comunicação com API:** O frontend se comunica com o backend via requisições HTTP (usando `fetch`) para todas as operações CRUD (Create, Read, Update, Delete) de contas e transações.
*   **Gerenciamento de Estado Global Simples:** O estado principal (lista de contas e transações) é gerenciado no componente `App.tsx` e passado para os componentes filhos via props. Para aplicações maiores, um gerenciador de estado mais robusto (Context API, Redux, Zustand) poderia ser considerado.

### Backend
*   **Node.js com Express:** Plataforma e framework escolhidos pela sua popularidade, ecossistema vasto e eficiência na construção de APIs RESTful.
*   **TypeScript:** Adiciona tipagem estática, melhorando a qualidade e a manutenibilidade do código backend.
*   **Arquitetura em Camadas:**
    *   **Controllers (`src/controllers`):** Responsáveis por receber requisições HTTP, validar dados de entrada básicos e chamar os serviços correspondentes.
    *   **Services (`src/services`):** Contêm a lógica de negócios principal. Orquestram operações, realizam validações de negócios e interagem com as entidades do banco de dados.
    *   **Entities (`src/entities`):** Modelos de dados que representam as tabelas do banco de dados, definidos com decorators do TypeORM.
    *   **DataSource (`src/config/dataSource.ts`):** Ponto central de configuração da conexão do TypeORM com o banco de dados.
*   **TypeORM com SQLite:**
    *   TypeORM foi escolhido como ORM por seu forte suporte a TypeScript, facilidade de mapeamento objeto-relacional e recursos de migração.
    *   SQLite foi utilizado pela simplicidade de configuração para este desafio (não requer um servidor de banco de dados separado). Em produção, bancos como PostgreSQL ou MySQL seriam mais indicados.
*   **UUIDs para IDs:** Chaves primárias utilizam UUIDs para evitar conflitos e não expor a sequência de criação.
*   **Variáveis de Ambiente (`.env`):** Para configurações sensíveis e específicas do ambiente (ex: porta do servidor, caminho do banco de dados).

## Lógica de Desenvolvimento Chave

*   **Cadastro e Gerenciamento de Contas:**
    *   Criação de contas com nome, tipo e saldo inicial (opcional, não editável após criação).
    *   Edição do nome e tipo da conta.
    *   Exclusão de contas, permitida apenas se não houver transações associadas (verificado no backend).
    *   O saldo atual é calculado e atualizado dinamicamente com base nas transações.
*   **Registro e Gerenciamento de Transações:**
    *   Tipos: Débito, Crédito, Transferência.
    *   Atributos: tipo, valor, data, descrição (opcional), contas de origem/destino.
    *   Transferências debitam da origem e creditam no destino.
*   **Atualização de Saldos (Backend):**
    *   A lógica de atualização de saldos das contas ao criar ou excluir uma transação é encapsulada em transações de banco de dados (`AppDataSource.manager.transaction`) no backend. Isso garante atomicidade: se uma parte da operação falhar, todas as alterações são revertidas, mantendo a consistência dos dados.
    *   Validações de saldo suficiente são feitas antes de permitir débitos ou transferências.
*   **Exclusão de Transações (Backend):**
    *   Ao excluir uma transação, os saldos das contas envolvidas são revertidos para o estado anterior, também dentro de uma transação de banco de dados.
*   **Validações:**
    *   **Frontend:** Validações básicas nos formulários (campos obrigatórios, formato).
    *   **Backend:** Validações mais robustas e de regras de negócio (tipos válidos, saldo suficiente, IDs corretos) são implementadas nos serviços e controllers.

## Estrutura do Projeto

O projeto está organizado da seguinte forma (simplificado):

```
/ (Raiz do Projeto)
├── index.html                # Ponto de entrada do Frontend
├── index.tsx                 # Script principal do React
├── App.tsx                   # Componente principal da aplicação Frontend
├── constants.ts              # Constantes/Enums do Frontend
├── types.ts                  # Tipos TypeScript do Frontend
│
├── components/               # Componentes React reutilizáveis
│   ├── AccountForm.tsx
│   ├── AccountItem.tsx
│   ├── ... (outros componentes)
│
├── hooks/                    # Custom Hooks React (ex: useLocalStorage - agora removido)
│
├── backend/                  # Pasta do projeto Backend
│   ├── dist/                 # Código JavaScript transpilado (saída do build)
│   ├── node_modules/
│   ├── src/
│   │   ├── config/           # Configuração do TypeORM (dataSource.ts)
│   │   ├── constants/        # Enums do Backend (AccountType, TransactionType)
│   │   ├── controllers/      # Controladores Express (AccountController.ts, etc.)
│   │   ├── entities/         # Entidades TypeORM (Account.ts, Transaction.ts)
│   │   ├── migrations/       # Migrações do banco de dados
│   │   ├── services/         # Lógica de negócios (AccountService.ts, etc.)
│   │   ├── index.ts          # Ponto de entrada do Backend
│   │   └── server.ts         # Configuração do servidor Express
│   ├── tests/                # Testes unitários do Backend
│   │   └── services/
│   │       └── AccountService.spec.ts
│   ├── .env.example          # Exemplo de arquivo de variáveis de ambiente
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md             # README específico do Backend
│
└── README.md                 # Este arquivo (README principal)
```

## Instruções de Execução

### Pré-requisitos
*   Node.js (v18.x ou superior recomendado)
*   NPM (geralmente vem com Node.js) ou Yarn

### Backend Setup
1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    *   Copie o arquivo de exemplo: `cp .env.example .env`
    *   Edite `.env` se necessário (a configuração padrão usa `database.sqlite` na raiz de `backend/` e porta `3001`).
4.  **Execute as migrações do banco de dados:**
    (Este comando cria as tabelas no arquivo `database.sqlite`)
    ```bash
    npm run migration:run
    ```
    *Se você modificar as entidades (`src/entities`), precisará gerar novas migrações:*
    ```bash
    # Exemplo: npm run migration:generate src/migrations/NomeDaSuaMigracao
    ```
5.  **Inicie o servidor backend (modo de desenvolvimento):**
    ```bash
    npm run dev
    ```
    O backend estará rodando em `http://localhost:3001` (ou a porta configurada).

### Frontend Setup
1.  **Garanta que o backend esteja rodando.**
2.  **Abra o arquivo `index.html` principal (na raiz do projeto) em um navegador moderno.**
    *   Você pode precisar de um servidor local simples para servir o `index.html` devido ao uso de módulos ES6 e para evitar problemas com CORS se o backend e frontend estivessem em domínios/portas muito diferentes (embora o `cors` esteja habilitado no backend). Uma ferramenta como `live-server` (instalável via `npm install -g live-server`) pode ser usada:
        ```bash
        # Na raiz do projeto (onde está o index.html)
        live-server
        ```
    *   Alternativamente, para este desafio, abrir o `index.html` diretamente no navegador pode funcionar, já que as dependências são carregadas via CDN (esm.sh) e o backend tem CORS habilitado.

## Cobertura de Testes

### Backend
*   **Tecnologias:** Jest para o framework de testes e `ts-jest` para integração com TypeScript.
*   **O que foi testado:**
    *   `AccountService`: Testes unitários cobrem a criação de contas (com e sem saldo inicial, validação de saldo negativo) e a lógica de exclusão de contas (verificando transações associadas).
    *   Os mocks do TypeORM (`getRepository`, `manager`) são usados para isolar os serviços do banco de dados real durante os testes unitários.
*   **Próximos Passos para Testes (Backend):**
    *   Expandir a cobertura para todos os métodos de `AccountService`.
    *   Adicionar testes unitários para `TransactionService`, cobrindo a criação de transações, atualização de saldos, exclusão de transações com reversão de saldos e cenários de erro (ex: saldo insuficiente, transferência para a mesma conta).
    *   Implementar testes para os `Controllers` para verificar o roteamento, validação de entrada e códigos de status HTTP.
    *   Considerar testes de integração que interajam com um banco de dados de teste real para validar o fluxo completo.

### Frontend
*   Testes unitários e de componentes não foram implementados para o frontend como parte deste escopo inicial.
*   **Recomendações para Testes Futuros (Frontend):**
    *   Utilizar bibliotecas como React Testing Library e Jest.
    *   Testar componentes individualmente (renderização, interações).
    *   Testar a lógica de formulários e validações.
    *   Testar o fluxo de dados e a interação com a API (usando mocks para `fetch` ou bibliotecas como `msw`).

## Funcionalidades Implementadas

*   **Cadastro de Contas:**
    *   Criação com Nome, Tipo, Saldo Inicial.
    *   Listagem com Nome, Tipo, Saldo Atual.
    *   Edição (Nome, Tipo) e Exclusão de contas.
*   **Registro de Transações:**
    *   Criação com Tipo (Débito, Crédito, Transferência), Contas de Origem/Destino, Valor, Descrição, Data.
    *   Listagem com todas as informações relevantes.
    *   Exclusão de transações.
    *   **Filtragem de Transações:** Implementada no frontend e backend, permitindo filtrar por conta, data de início e data de fim.
*   **Transferências entre Contas:**
    *   Lógica de débito na origem e crédito no destino implementada e gerenciada atomicamente no backend.

## Melhorias e Considerações Futuras
*   **Autenticação e Autorização:** Implementar um sistema de usuários para que cada pessoa gerencie apenas suas finanças.
*   **Interface do Usuário (UI/UX):**
    *   Melhorar o feedback visual para erros e sucesso (ex: toasts/notifications em vez de `alert`).
    *   Adicionar paginação para listas longas de transações.
    *   Gráficos e relatórios visuais para análise financeira.
*   **Testes:** Aumentar a cobertura de testes no backend e implementar testes no frontend.
*   **Validação Avançada:** Usar bibliotecas como Zod ou Joi para validação de esquemas no backend.
*   **Deployment:** Configurar scripts e processos para deploy em plataformas como Vercel (frontend) e Heroku/Render (backend).
*   **Otimizações:** Para aplicações maiores, otimizar queries de banco de dados, lazy loading de componentes, etc.
*   **Internacionalização (i18n):** Suporte a múltiplos idiomas.
```