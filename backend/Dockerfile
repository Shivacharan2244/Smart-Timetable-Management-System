# ==============================================================================
# Multi-Stage Dockerfile for Spring Boot 3.3.4 (Java 21) on Render
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Build Stage
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /build

# Copy Maven settings and retry/backoff configuration
COPY .mvn ./.mvn
COPY pom.xml .

# Pre-fetch project dependencies and build plugins using configured retry & mirror settings.
# Docker caches this layer: changes to source code will NOT re-download dependencies!
RUN mvn dependency:resolve dependency:resolve-plugins -s .mvn/settings.xml -B

# Copy project source code
COPY src ./src

# Build production executable JAR (skipping unit/integration tests)
RUN mvn clean package -DskipTests -s .mvn/settings.xml -B

# ------------------------------------------------------------------------------
# 2. Production Runtime Stage (Lightweight Alpine JRE)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user setup with explicit write permissions for data and uploads directories
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && mkdir -p /app/data /app/uploads \
    && chown -R appuser:appgroup /app

# Copy built JAR artifact from build stage with correct ownership
COPY --from=build /build/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

# Spring Boot default port (Render automatically maps $PORT at runtime)
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
