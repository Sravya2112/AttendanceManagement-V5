# Build stage
FROM maven:3.8.7-eclipse-temurin-8 AS build
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:8-jre
COPY --from=build /target/AttendanceManagement-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
