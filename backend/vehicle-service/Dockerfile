FROM eclipse-temurin:17-jdk-alpine
RUN apk add --no-cache curl

WORKDIR /app

# Copy the JAR file
COPY target/*.jar app.jar

# Expose the port
EXPOSE 8084

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]