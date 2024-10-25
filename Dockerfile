# Use the official Golang image to build the application
FROM golang:1.23 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY *.go ./

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Start a new stage from scratch
FROM alpine:latest

# Set the Current Working Directory inside the container
WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .

COPY ./static/ /root/static/

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]