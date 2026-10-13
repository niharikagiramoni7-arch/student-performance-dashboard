# ==========================================
# Multi-Stage Dockerfile for Spring Boot App
# Compatible with Render, Railway & Docker
# ==========================================

# 1. Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source code (including static frontend)
COPY backend/src ./src

# Package production JAR skipping unit tests
RUN mvn clean package -DskipTests -B

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add curl for health check
RUN apk --no-cache add curl

# Create non-root user and ensure data dir is writable for H2 fallback
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && mkdir -p /app/data && chown -R appuser:appgroup /app

# Copy compiled jar from build stage
COPY --from=builder --chown=appuser:appgroup /workspace/target/student-performance-backend-0.0.1-SNAPSHOT.jar app.jar

# Dynamic port assignment for Render ($PORT)
ENV PORT=8080
EXPOSE 8080

USER appuser

# Start application using Render's dynamic PORT
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
