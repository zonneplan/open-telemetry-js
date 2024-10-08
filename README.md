# OpenTelemetry JS Wrapper

![](https://github.com/zonneplan/open-telemetry-js/actions/workflows/ci-main.yml/badge.svg)

## About this project

The aim of these packages is to provide some additional tools on top of the official [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) packages to make working with OpenTelemetry in a Node.js (with or without Nest) environment easier.

The packages provide:
- pre-configured OpenTelemetry integrations with sane defaults
- decorators to make Otel instrumentation non-invasive

## Motivation

We, at Zonneplan, have different (mono) repositories that utilize the power of OpenTelemetry. We built out a small internal package to let us easily integrate OpenTelemetry in our NestJS applications, with as few lines of code as necessary. Furthermore, we wanted to provide some tools to easily use metrics and spans in our applications. We decided that our tools may be useful for other people and thus decided to open-source it.

## Getting started

See the README in the [open-telemetry-node](./packages/open-telemetry-node/README.md) package for a quick start guide.

### OpenTelemetry stack for quickstart

There is a preconfigured OpenTelemetry setup available in [./docker-compose](./docker-compose/) that you can use to get started with an OpenTelemetry back-end quickly.

## Packages

This repository contains the following packages:

- [`open-telemetry-node`](./packages/open-telemetry-node/README.md): The package to set up OpenTelemetry in a node project, by using a simple configuration builder.
- [`open-telemetry-nest`](./packages/open-telemetry-nest/README.md): Additional utilities to provide easy integration in NestJS for logging and metrics.
- [`open-telemetry-zonneplan`](./packages/open-telemetry-zonneplan/README.md): Pre-built configuration for the Node configuration builder, allowing the use of OpenTelemetry in only 5 lines of code. This repository can be used as an example how to easily share a configuration for OpenTelemetry between multiple repositories.

## Examples

To showcase some of the functionality of this package, we have created an example with NestJS at [nest-app](./examples/nest-app).
