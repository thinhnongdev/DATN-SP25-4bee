# ---------- Giai đoạn build ----------
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy toàn bộ server vào container build
COPY server /app

# Build file JAR
RUN ./mvnw clean package -DskipTests

# ---------- Giai đoạn runtime ----------
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy file JAR từ container build
COPY --from=builder /app/target/*.jar app.jar

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
