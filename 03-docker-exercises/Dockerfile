# Use the java version installed locally for the bootcamp
# NOTE: The alpine image is small since it comes with a minimal toolkit to run java apps
FROM amazoncorretto:17-alpine-jdk

# Expose the port to which the app publishes its http content
EXPOSE 8080

# Create a directory to copy the built artifact to
RUN mkdir /app
WORKDIR /app

# Copy the artifact into the app
COPY build/libs/docker-exercises-project-1.0-SNAPSHOT.jar .

# Run the app on starting the container
CMD ["java", "-jar", "docker-exercises-project-1.0-SNAPSHOT.jar"]