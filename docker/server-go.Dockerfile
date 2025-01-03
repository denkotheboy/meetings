# Для сборки
FROM golang:1.23.4-alpine AS builder
ARG PORT
WORKDIR /app
COPY ../server-go/go.mod ../server-go/go.sum ./
RUN go mod download
COPY ../server-go/ .
RUN go build -o server .
EXPOSE ${PORT}

# Маловестный образ
FROM debian:bullseye-slim
ARG PORT
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE ${PORT}
CMD ["./server"]
