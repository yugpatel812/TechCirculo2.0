FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY mvnw .
RUN chmod +x mvnw
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN ./mvnw clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/tech-circulo.jar tech-circulo.jar

EXPOSE 8084

# Run the application
ENTRYPOINT ["java", "-jar", "tech-circulo.jar"]