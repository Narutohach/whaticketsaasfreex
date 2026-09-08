FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache jq
COPY build ./build
COPY server.js ./
COPY add-env-vars.sh ./
RUN chmod +x add-env-vars.sh
RUN npm install express@4.21.2 --legacy-peer-deps
EXPOSE 3250
CMD ["sh", "-c", "sh ./add-env-vars.sh && node server.js"]
