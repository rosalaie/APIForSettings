# APIForSettings

API REST desenvolvida com Node.js, Express, Prisma ORM, MySQL e React.

## Tecnologias

### Backend
- Node.js
- Express
- Prisma ORM
- MySQL
- Nodemon

### Frontend
- React
- React Scripts

---

# 1. Clonar o projeto

```bash
git clone https://github.com/rosalaie/APIForSettings.git
```

Entrar na pasta do projeto:

```bash
cd APIForSettings
```

---

# 2. Instalar dependências do Backend

Na raiz do projeto execute:

```bash
npm install
```

Caso seja necessário instalar manualmente:

```bash
npm install express
npm install prisma @prisma/client
npm install mysql2
npm install dotenv
npm install cors
npm install -D nodemon
Obs.
I Instala as bibliotecas de criptografia e token no lugar correto
npm install bcryptjs jsonwebtoken

II no front npm install react-router-dom (para as rotas)
```

---

# 3. Instalar dependências do Frontend

Entrar na pasta:

```bash
cd frontend
```

Instalar:

```bash
npm install
```

Caso seja necessário:

```bash
npm install firebase
npm install react-scripts
```
npm install react-router-dom (para as rotas)

Voltar para a raiz:

```bash
cd ..
```

---

# 4. Instalar o MySQL

Ubuntu / Lubuntu

```bash
sudo apt update
sudo apt install mysql-server
```

Verificar instalação:

```bash
sudo systemctl status mysql
```

Entrar no MySQL:

```bash
sudo mysql
```

---

# 5. Criar usuário do projeto so se for criar um usuario novo

Dentro do MySQL:

```sql
CREATE USER '
IDENTIFIED BY '';

GRANT ALL PRIVILEGES
ON *.*
TO ''@'localhost';

FLUSH PRIVILEGES;
```

Criar banco:

```sql
CREATE DATABASE APIForSettings;
```

Verificar:

```sql
SHOW DATABASES;
```

Sair:

```sql
exit;
```

---

# 6. Configurar o Prisma

## IMPORTANTE

Após clonar o projeto pode ocorrer erro no Prisma.

Caso isso aconteça:

Apague:

```
.env
```

e, se necessário, recrie a configuração do Prisma.

Criar novamente:

```bash
npx prisma init
```

No arquivo `.env`, alterar a URL:

```env
DATABASE_URL="mysql://sobmedida:%40uu73@localhost:3306/APIForSettings"
```



---
ou apenas de npm install prisma. Ao fazer a instala;'ao, instalar a mesmo versao do prisma do projeto 6...

# 7. Configurar schema.prisma

O generator deve estar assim:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

# 8. Gerar o Prisma Client

```bash
npx prisma generate
```

Caso ainda não existam as tabelas:

```bash
npx prisma db push
```

ou

```bash
npx prisma migrate deploy
```

(se houver migrations)

--- 
se fizer alteracoes envolvendo o banco rode npx prisma migrate dev --name criacao_tabela_users (exemplo)
# 9. Rodar o Backend

```bash
npm run dev
```

ou

```bash
node server.js
```

---

# 10. Rodar o Frontend

Entrar na pasta:

```bash
cd frontend
```

Executar:

```bash
npm start
```

O React abrirá em:

```
http://localhost:3000
```

---

# Problemas comuns

## Prisma Client não inicializado

Erro:

```
@prisma/client did not initialize yet
```

Solução:

```bash
npx prisma generate
```

---

## react-scripts not found

Executar:

```bash
cd frontend
npm install
```

Se necessário:

```bash
npm install react-scripts
```

---

## Banco não conecta

Verificar se o MySQL está ativo:

```bash
sudo systemctl status mysql
```

Iniciar:

```bash
sudo systemctl start mysql
```

---

## Ver bancos

```sql
SHOW DATABASES;
```

---

## Entrar no banco

```sql
USE APIForSettings;
```

---

## Ver tabelas

```sql
SHOW TABLES;
```

---

## Ver registros

```sql
SELECT * FROM User;
```

---

# Git

Salvar alterações:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

---

# Estrutura do projeto

```
APIForSettings
│
├── frontend/
│
├── prisma/
│   └── schema.prisma
│
├── server.js
├── package.json
└── README.md
```
