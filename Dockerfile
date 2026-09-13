FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV REPORTS_DIR=/app/reports
ENV REQUEST_TIMEOUT_MS=5000

ENTRYPOINT ["node", "src/index.js"]
