FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Para desarrollo
EXPOSE 3010

# Usamos una variable de entorno para la URL de la API
ENV NEXT_PUBLIC_API_URL=http://localhost:8010

CMD ["npm", "run", "dev", "--", "-p", "3010"]
