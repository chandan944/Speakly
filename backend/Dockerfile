# ============================
# 🏗️ Stage 1: Build the app
# ============================
FROM gradle:8.8-jdk23 AS builder

# Set working directory inside container
WORKDIR /app

# Copy gradle wrapper files first (for better caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (this layer will be cached)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the Spring Boot jar (skip tests for faster build)
RUN ./gradlew clean bootJar -x test --no-daemon

# ============================
# 🚀 Stage 2: Run the app
# ============================
FROM eclipse-temurin:23-jdk-alpine

# Set working directory
WORKDIR /app

# Copy jar from the build stage
COPY --from=builder /app/build/libs/Backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the app port
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
