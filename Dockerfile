# ---------- STAGE 1: BUILD ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Копируем всё и сразу собираем (без go-offline)
COPY pom.xml .
COPY src src
RUN mvn -B -q clean package -DskipTests

# ---------- STAGE 2: RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
