# ==========================================
# Multi-stage Dockerfile for Spring Boot App
# ==========================================

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Install bash/sed for wrapper script compatibility
RUN apk add --no-cache bash

# Copy gradle wrapper & configuration files
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle

# Fix Windows CRLF line endings on gradlew and make executable
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build production jar without tests (tests run in CI stage)
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Install curl for healthcheck & tzdata for accurate timezone
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=UTC

# Create unprivileged system user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create logs directory with proper ownership
RUN mkdir -p /app/logs && chown -R spring:spring /app

# Copy built artifact from builder stage
COPY --from=builder --chown=spring:spring /app/build/libs/server-0.0.1-SNAPSHOT.jar app.jar

USER spring:spring

EXPOSE 8080

# Production JVM optimizations for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
