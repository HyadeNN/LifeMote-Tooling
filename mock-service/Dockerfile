# mock-service dockerfile is much simpler because it doesn't have to install any dependencies. It just needs to build the Go application and run it.

FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY main.go .
RUN go build -o mockservice main.go

FROM alpine:3.18
WORKDIR /root/
COPY --from=builder /app/mockservice .
EXPOSE 5000
CMD ["./mockservice"]
