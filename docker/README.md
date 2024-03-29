# Grafana + OpenTelemetry docker compose setup

This repository contains a docker-compose setup for Grafana and OpenTelemetry. The setup includes the following components:
- Grafana
- Prometheus
- Grafana Loki - log ingest & storage
- Grafana Tempo - trace ingest & storage
- Grafana Agent - metrics, logs, and traces collection via the OpenTelemetry protocol

## Requirements

- Docker Desktop or other runtime that supports docker-compose

## Usage

To start the setup, run the following command:

```bash
docker-compose up
```

This will start all the components and make them available on the following ports:
- Grafana: [http://localhost:3000](http://localhost:3000)
- Prometheus: [http://localhost:9090](http://localhost:9090)
- Grafana Loki: [http://localhost:3100](http://localhost:3100)
- Grafana Tempo: [http://localhost:3200](http://localhost:3200)
