FROM node:18-alpine
WORKDIR /app
COPY splitted\ files/ .
COPY Dockerfile .
EXPOSE 3000
CMD ["node", "site.js"]
