# Build stage
FROM maven:3.6.3-jdk-8-slim AS build
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:8-jre-slim
COPY --from=build /target/AttendanceManagement-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
