# ----------- Giai đoạn build -----------
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

COPY server /app
COPY mvnw /app
COPY .mvn /app/.mvn

RUN chmod +x ./mvnw

RUN ./mvnw clean package -DskipTests

# ----------- Giai đoạn chạy -----------
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
