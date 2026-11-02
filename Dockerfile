# ---------- Etapa 1: frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
# vite.config.ts deja el build en ../src/main/resources/static
RUN npm run build

# ---------- Etapa 2: backend ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Se descargan primero las dependencias para aprovechar la caché de capas
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
COPY --from=frontend /app/src/main/resources/static ./src/main/resources/static
RUN mvn -B -q package -DskipTests

# ---------- Etapa 3: ejecución ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S canchaya && adduser -S canchaya -G canchaya
COPY --from=build /app/target/canchaya-api-*.jar app.jar
USER canchaya

EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -Duser.timezone=America/Bogota"

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
