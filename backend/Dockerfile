# ============================
# 🏗️ Stage 1: Build the app
# ============================
FROM gradle:8.8-jdk21 AS builder

# Set working directory inside container
WORKDIR /app

# Copy all project files
COPY . .

# Build the Spring Boot jar (skip tests for faster build)
RUN gradle clean bootJar -x test

# ============================
# 🚀 Stage 2: Run the app
# ============================
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy jar from the build stage
COPY --from=builder /app/build/libs/Backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the app port
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
