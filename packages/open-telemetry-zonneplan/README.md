# OpenTelemetry Zonneplan config

![](https://github.com/zonneplan/open-telemetry-js/actions/workflows/ci-main.yml/badge.svg)

Find the source code at [zonneplan/open-telemetry-js](https://github.com/zonneplan/open-telemetry-js).

## Set up

```
npm install @zonneplan/open-telemetry-zonneplan
```

Requires Node.js 22.15 or later. The package is built on the OpenTelemetry JS SDK 3.x and `@opentelemetry/api` 1.10: SDK objects you pass in, such as span processors, samplers, exporters and metric readers, must come from the 3.x packages (`@opentelemetry/sdk-trace`, `@opentelemetry/sdk-metrics` and so on).
