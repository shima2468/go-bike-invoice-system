# Deploy Strapi on Railway / Render / Docker
FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
COPY --from=build /app ./
RUN mkdir -p .tmp
EXPOSE 1337
CMD ["npm", "run", "start"]
