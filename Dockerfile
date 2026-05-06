# Estágio único: Desenvolvimento e Teste Local
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte para o diretório de trabalho
COPY . .

# Expõe as portas padrão do Vite (5173 para dev e dev:local)
# e 5174 para o preview (se quiserem testar o build de produção)
EXPOSE 5173
EXPOSE 5174

# Define variáveis de ambiente para garantir que o Vite ouça em 0.0.0.0
# permitindo conexões externas (celular, etc) no Docker
ENV VITE_APP_HOST=0.0.0.0
ENV VITE_APP_PORT=5173

# O script 'dev' já possui o flag --host no package.json
# Para acessar do celular, use o IP do seu computador na mesma rede Wi-Fi.
CMD ["npm", "run", "dev"]
