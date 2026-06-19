# 🎮 Pokédex Battle System

## 📌 Sobre o Projeto

O **Pokédex Battle System** é uma aplicação desenvolvida em **React Native com Expo**, inspirada no universo Pokémon, que permite aos usuários criar uma conta, gerenciar seu perfil de treinador, montar equipes, capturar Pokémon e participar de batalhas.

O projeto foi desenvolvido com foco em conceitos de desenvolvimento mobile, consumo de APIs REST, autenticação de usuários, gerenciamento de estado e persistência de dados.

---

## 👩‍💻 Desenvolvedoras

### Letícia Borges

Estudante de Análise e Desenvolvimento de Sistemas na Fatec Zona Leste.

### Yasmin Oliveira

Estudante de Análise e Desenvolvimento de Sistemas na Fatec Zona Leste.

---

## 🎯 Objetivos

* Desenvolver uma aplicação mobile inspirada no universo Pokémon.
* Aplicar conceitos de integração com APIs REST.
* Implementar autenticação e gerenciamento de usuários.
* Trabalhar com armazenamento local e persistência de dados.
* Criar uma interface moderna utilizando conceitos de Pixel Art.

---

## 🚀 Funcionalidades

### 🔐 Autenticação

* Cadastro de usuários
* Login
* Logout
* Validação de senha
* Controle de sessão

### 👤 Perfil do Treinador

* Exibição dos dados do usuário
* Estatísticas de batalhas
* Pokémon capturados
* Progresso da Pokédex

### 📖 Pokédex

* Listagem de Pokémon
* Visualização em formato de cartas
* Informações detalhadas dos Pokémon
* Scroll infinito

### 🏆 Time Pokémon

* Visualização do time atual
* Alteração dos Pokémon do time
* Integração com API para atualização do time

### ⚔️ Sistema de Batalha

* Seleção automática de adversários
* Simulação de batalhas
* Registro de vitórias e derrotas
* Captura de Pokémon após vitória

### 🎨 Interface

* Tema Pixel Art inspirado nos jogos Pokémon clássicos
* Animações de carregamento
* Componentes personalizados
* Layout responsivo

---

## 🏗️ Estrutura do Projeto

```bash
src/
│
├── app/
│   ├── (auth)/
│   │   ├── index.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   │
│   ├── (app)/
│   │   ├── pokedex.tsx
│   │   ├── team.tsx
│   │   ├── battle.tsx
│   │   ├── perfil.tsx
│   │   ├── loading.tsx
│   │   └── _layout.tsx
│
├── component/
│   ├── card/
│   ├── list/
│   ├── pokemonStyle/
│   └── ...
│
├── context/
│   └── AuthContext.tsx
│
├── integration/
│   ├── authIntegration.ts
│   ├── pokemonIntegration.ts
│   └── teamIntegration.ts
│
├── @types/
│   └── pokemon.ts
│
├── assets/
│   ├── images/
│   └── icons/
│
└── constants/
```

---

## 🛠️ Tecnologias Utilizadas

### Front-end

* React Native
* Expo
* TypeScript
* Expo Router

### Comunicação com API

* Axios

### Persistência

* AsyncStorage

### Controle de Estado

* React Context API

### Estilização

* StyleSheet
* Componentização React Native

---

## 📱 Como Executar

### Instalar dependências

```bash
npm install
```

### Executar o projeto

```bash
npx expo start
```

### Executar no navegador

```bash
w
```

### Executar em dispositivo Android

```bash
a
```

---

## 📚 Conceitos Aplicados

* Desenvolvimento Web
* Componentização
* Consumo de API REST
* Autenticação
* Gerenciamento de Estado
* Persistência de Dados
* Responsividade
* UX/UI
* Programação Assíncrona

---

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais na disciplina de Desenvolvimento Mobile da Fatec Zona Leste.

---

## 🎮 Telas

<img width="959" height="473" alt="Captura de tela 2026-06-19 144345" src="https://github.com/user-attachments/assets/5ac9f435-8fc6-438c-98d2-b1c2fbddb67b" />

---

<img width="959" height="470" alt="Captura de tela 2026-06-19 143521" src="https://github.com/user-attachments/assets/e7c6c820-0f56-4fb4-9456-18ab71082177" />

---

<img width="959" height="475" alt="Captura de tela 2026-06-19 143536" src="https://github.com/user-attachments/assets/4cdb18b4-8a48-4e77-9be2-0a9d8ad52f0d" />

---

<img width="959" height="466" alt="Captura de tela 2026-06-19 143544" src="https://github.com/user-attachments/assets/ec549f34-8551-4edb-b017-d68d9db1f2a1" />

---

<img width="953" height="467" alt="Captura de tela 2026-06-19 143611" src="https://github.com/user-attachments/assets/dc90e90c-2109-43dc-8fa8-a8ef596fa203" />








⭐ Projeto desenvolvido por **Letícia Borges** e **Yasmin Oliveira**.
