# Usa una imagen oficial de Node.js como imagen base
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación de Next.js
RUN npm run build

# Expone el puerto en el que se ejecuta la aplicación de Next.js
EXPOSE 3579

# Comando para iniciar la aplicación
CMD ["npm", "start"]
