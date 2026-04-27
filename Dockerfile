FROM node:18-alpine
WORKDIR /app
COPY "splitted files/" .
EXPOSE 3000
CMD ["node", "site.js"]
