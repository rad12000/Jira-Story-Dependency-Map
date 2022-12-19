# UI Stage 1
FROM node:18-alpine as uiStage
WORKDIR /app
COPY ./ui/package*.json ./
RUN npm install
COPY ./ui .
RUN npm run build --omit=dev

FROM node:18-alpine
WORKDIR /app
COPY ./api/package*.json ./
RUN npm install --omit=dev
COPY --from=uiStage /app/dist /public
COPY ./api .
EXPOSE 80
ENV DISABLE_CORS=true
CMD [ "node", "app.js" ]