FROM openjdk:17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY ../pom.xml ../pom.xml
COPY ../common-libs ../common-libs
RUN apk add --no-cache maven
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]