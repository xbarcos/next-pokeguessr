# PokéGuessr

### Essa é uma tentativa de fazer uma cópia do antigo Monképo, após o mesmo ficar offline. Trata-se de um "Wordle Like" baseado no universo de Pokémon.

### Esse projeto ainda está em fase beta, portanto pode e deverá ocorrer bugs.

# TODO
* Implementação de um monólito Server-Client. O projeto deverá cada vez menos ter validações e tarefas sensíveis feitas pelo client;
* Implementação de um banco de dados não relacional, responsável por salvar uma vez ao dia o pokémon do dia que foi escolhido;
* Implementação de um worker, responsável por executar os scripts de buscar todos os pokémons e também o script para setar o pokémon do dia;
* Melhorar comunicação https, criptografando dados sensíveis e não permitindo que o client tenha acesso direto às informações;
* Outras possíveis melhorias a serem descobertas com os testes durante a fase beta.

# Tecnologias utilizadas
* Next.js
* Typescript
* Tailwindcss
* Shacdn/ui
* Lucide-Icons

# Scripts
* Atualizar dependências do projeto: `npm install`;
* Executar fetch de todos os pokemons para arquivo json local: `npm run fetch-pokemon`;
* Executar validate do objeto de pokemon no json: `npm run validate-pokemon`;
* Rodar o projeto em ambiente dev: `npm run dev`;
* Buildar projeto para deploy em production: `npm run build`
