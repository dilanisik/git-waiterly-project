FROM node:18-alpine
WORKDIR /app
COPY . .
RUN mkdir -p images && cp -r "splitted files/images/." images/
EXPOSE 3000
CMD ["node", "site.js"]
