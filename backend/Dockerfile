# ============================
# 🏗️ Stage 1: Build the app
# ============================
FROM gradle:8.8-jdk21 AS builder

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

COPY src src

RUN ./gradlew clean bootJar -x test --no-daemon

# ============================
# 🚀 Stage 2: Run the app
# ============================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/Backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
