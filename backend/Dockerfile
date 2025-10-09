# =========================
# 🏗️ Stage 1: Build the app
# =========================
FROM gradle:8.8-jdk23 AS builder

# Set working directory inside container
WORKDIR /app

# Copy everything
COPY . .

# Build the app (skip tests for faster build)
RUN gradle clean build -x test

# =========================
# 🚀 Stage 2: Run the app
# =========================
FROM eclipse-temurin:23-jdk-alpine

# Set working directory
WORKDIR /app

# Copy only the jar file from build stage
COPY --from=builder /app/build/libs/Backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
