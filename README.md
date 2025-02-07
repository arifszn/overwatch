# Overwatch - Logging Infrastructure

A logging infrastructure setup using ClickHouse, Vector, and Grafana for efficient log aggregation, processing, and visualization.

## Project Structure
```
├── docker-compose.yml          # Main Docker Compose file
├── app/                        # Example Express.js app
│   ├── app.js                  # Main Express app
│   ├── logger.js               # Logger for the Express app
│   └── Dockerfile              # Dockerfile for the Express app
├── clickhouse/                 # ClickHouse configurations
│   ├── init.sql                # SQL script to create log tables
│   └── Dockerfile              # Custom ClickHouse image (if needed)
├── vector/                     # Vector configurations
│   └── vector.yaml             # Vector configuration
├── grafana/                    # Grafana configurations
│   ├── provisioning/           # Grafana provisioning configurations
│   └── dashboards/             # Grafana pre-configured dashboards
└── README.md                   # Project documentation
```

## Overview

This project implements a modern logging infrastructure using:
- **ClickHouse**: High-performance columnar database for log storage
- **Vector**: Data pipeline tool for collecting and transforming logs
- **Grafana**: Visualization and monitoring platform
- **Express.js**: Example application generating logs

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd logging-infrastructure
cp .env.example .env
```

2. Start the infrastructure:
```bash
docker-compose up -d
```

3. Access the services:
- Grafana: http://localhost:3001 (credentials: admin/password)
- ClickHouse: localhost:8123 (HTTP) or localhost:9000 (native)
- Example App: http://localhost:3000

## Configuration

### Vector Configuration
Vector is configured to:
- Collect logs from the example application
- Transform and structure log data
- Forward processed logs to ClickHouse

Key configuration file: `vector/vector.yaml`

### ClickHouse Configuration
ClickHouse is set up with:
- Optimized table schema for log storage
- Proper indexing for efficient queries
- TTL policies for log retention

Initial setup script: `clickhouse/init.sql`

### Grafana Setup
Grafana comes pre-configured with:
- ClickHouse data source
- Sample dashboards for log visualization
- Basic alerting rules

## Maintenance

### Log Retention
- Configure log retention in `clickhouse/init.sql`
- Default retention period: 30 days

### Scaling
- Vector can be scaled horizontally for increased log processing
- ClickHouse supports cluster deployment for larger datasets

## Support

For support and questions:
- Create an issue in the repository
