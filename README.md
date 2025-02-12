<div align="center">
    <h2 style="display: flex; align-items: center; gap: 8px; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
            <path d="M3 12A9 3 0 0 0 21 12"/>
        </svg> 
        Overwatch
    </h2>
</div>

A logging infrastructure setup using ClickHouse, Vector, and Grafana for efficient log aggregation, processing, and visualization.

## Overview

This project implements a modern logging infrastructure using:

- **ClickHouse**: High-performance columnar database for log storage
- **Vector**: Data pipeline tool for collecting and transforming logs
- **Grafana**: Visualization and monitoring platform
- **Express.js**: Example application generating logs

## Architecture

```mermaid
flowchart LR
    subgraph App["Express.js Application"]
        winston["Winston Logger"]
    end
    subgraph Collection["Log Collection"]
        logfile["Log Files"]
        vector["Vector Agent"]
    end
    subgraph Storage["Log Storage"]
        clickhouse["ClickHouse DB"]
    end
    subgraph Visualization["Log Visualization"]
        grafana["Grafana"]
    end
    winston -->|writes| logfile
    vector -->|reads| logfile
    vector -->|transforms & forwards| clickhouse
    grafana -->|queries| clickhouse
    style App fill:#e1f7d5
    style Collection fill:#ffebbb
    style Storage fill:#c9e4ff
    style Visualization fill:#f7d5e1
```

## Workflow

### 1. Data Collection

- Use an Express.js app to generate logs.
- Send logs to Vector using file-based inputs.

### 2. Data Transformation

- Vector processes and enriches logs (e.g., parsing JSON, adding metadata).

### 3. Data Storage

- Vector sends processed logs to ClickHouse.

### 4. Data Visualization

- Connect Grafana to ClickHouse.
- Create dashboards to visualize logs and metrics.

<img src="https://github.com/user-attachments/assets/7bea8925-3a91-43d7-8cd5-b436e8ad3429" alt="Workflow" width="600px"/>

## Project Structure

```
├── docker-compose.yml          # Main Docker Compose file
├── app/                        # Example Express.js app
│   ├── app.js                  # Main file for the Express app
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

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/arifszn/overwatch.git
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

```yaml
# Source: Read logs from the application log files
sources:
  app_logs:
    type: file
    include:
      - /app/logs/*.log
    read_from: beginning

# Transform: Parse the logs into structured data
transforms:
  parse_logs:
    type: remap
    inputs:
      - app_logs
    source: |
      parsed, err = parse_json(.message)
      if err != null {
        log("Failed to parse JSON", level: "error")
      } else {
        . = parsed
      }

# Sink: Send parsed logs to ClickHouse
sinks:
  clickhouse_sink:
    type: clickhouse
    inputs:
      - parse_logs
    endpoint: '${CLICKHOUSE_ENDPOINT}'
    database: 'overwatch'
    table: 'app_logs'
    compression: gzip
    format: json_each_row
    auth:
      strategy: basic
      user: '${CLICKHOUSE_USER}'
      password: '${CLICKHOUSE_PASSWORD}'
    batch:
      max_size: 1048576
```

### ClickHouse Configuration

ClickHouse is set up with:

- Optimized table schema for log storage
- Proper indexing for efficient queries
- TTL policies for log retention

Initial setup script: `clickhouse/init.sql`

```sql
-- Create a database
CREATE DATABASE IF NOT EXISTS overwatch;

-- Create a table to store app logs with OpenTelemetry schema
CREATE TABLE IF NOT EXISTS overwatch.app_logs
(
    Timestamp DateTime64(3),
    SeverityText String,  -- OpenTelemetry equivalent of log level
    SeverityNumber Int8,  -- Numeric representation of severity
    Body String,  -- Log message
    ServiceName String,  -- Service generating the log
    TraceId String,  -- OpenTelemetry Trace ID (if available)
    SpanId String,  -- OpenTelemetry Span ID (if available)
    ResourceAttributes String,  -- JSON string for resource-level attributes
    LogAttributes String  -- JSON string for structured log-specific attributes
)
ENGINE = MergeTree()
ORDER BY (Timestamp)
TTL toDateTime(Timestamp) + INTERVAL 30 DAY; -- Auto cleanup after 30 days
```

### Grafana Setup

Grafana comes pre-configured with:

- ClickHouse data source
- Sample dashboards for log visualization

## Deep Dive into Components

### ClickHouse

ClickHouse is an open-source columnar database management system designed for large-scale analytics and business intelligence workloads. It is known for its high performance in processing and querying vast amounts of data.

<img width="110" alt="Clickhouse" src="https://github.com/user-attachments/assets/c036be24-aeff-4c99-9f88-79b57ae81b28" />

#### Protocol Support

ClickHouse supports multiple wire protocols, including MySQL and others, which allows clients that do not have native ClickHouse connectors to interact with it using the MySQL or other protocols.

#### Why is ClickHouse so fast?

ClickHouse achieves high performance through several optimizations:

- **Columnar Storage:** Stores data by columns rather than rows, which is efficient for analytical queries that aggregate data across many rows but fewer columns.
- **Vectorized Execution:** Processes data in batches, allowing for better CPU utilization and reduced overhead.
- **Native Compression:** Uses efficient compression algorithms that are optimized for both speed and space.
- **Asynchronous I/O and Multi-threading:** Allows for concurrent reading and processing of data.

#### Benchmark

[The billion docs JSON Challenge](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)

<table>
<tr>
    <td align="center">
    <img src="https://github.com/user-attachments/assets/492261de-9820-44bb-ac81-2450e9ca2db5" alt="Storage" width="600px" />
    </td>
    <td align="center">
    <img src="https://github.com/user-attachments/assets/d5e6c8b6-65d5-46ed-9405-01956572bc8c" alt="Query" width="600px" />
    </td>
</tr>
</table>

#### Column-Oriented Database

A column-oriented database stores data by columns rather than by rows. This architecture is particularly advantageous for read-heavy workloads, such as analytics and reporting, where queries often aggregate data across many rows but only a few columns. By storing columns separately, the database can read and process only the necessary data, reducing I/O operations and improving query performance.

##### Row-Oriented Storage vs. Column-Oriented Storage

###### Row-Oriented Storage

In a row-oriented database like MySQL, each row of data is stored together. This means that when you insert a record, all the column values for that record are saved in a single unit (row). If you query for that row, all the column data (e.g., name, age, email) is retrieved at once.

Here's how it works for a MySQL table:

| id  | name  | age | email           |
| --- | ----- | --- | --------------- |
| 1   | Alice | 30  | alice@email.com |
| 2   | Bob   | 25  | bob@email.com   |

When you store this data:

- The row for **Alice** is stored as one unit, containing all the values: `1`, `Alice`, `30`, and `alice@email.com`.
- The row for **Bob** is stored as another unit, containing: `2`, `Bob`, `25`, and `bob@email.com`.

So, in a row-oriented system, you're storing and retrieving entire rows of data at once.

###### Column-Oriented Storage

In a column-oriented database like ClickHouse, the data is stored differently. Instead of storing each row together, the database stores each column separately.

For example, with a table like this:

| id  | name  | age | email           |
| --- | ----- | --- | --------------- |
| 1   | Alice | 30  | alice@email.com |
| 2   | Bob   | 25  | bob@email.com   |

In a column-oriented database, the data is stored as:

- **id column:** 1, 2
- **name column:** Alice, Bob
- **age column:** 30, 25
- **email column:** alice@email.com, bob@email.com

Each column is stored separately, meaning that all the values for the name column are together, all the values for the age column are together, and so on. When querying, the database can retrieve only the necessary columns, making it more efficient for analytical queries (where you might only need a few columns).

#### ClickHouse Engines

ClickHouse supports several engines, but the most commonly used are:

- **MergeTree:** The most universal and functional table engines for high-load tasks.
- **ReplacingMergeTree:** A variant of MergeTree that allows for deduplication of data.
- **Log:** Effective when you need to quickly write many small tables with a low latency.

##### Log Engine

- **Use Case:** Suitable for small datasets (<1 million rows), temporary or non-critical data, and simple setups with minimal configuration.
- **Features:** Limited features compared to MergeTree engines; lacks indexing, partitioning, and replication.

##### MergeTree Engine

- **Use Case:** Ideal for large datasets (millions or billions of rows), requiring high write throughput and efficient querying with advanced features like partitioning, indexing, compression, and TTL.
- **Scalability:** Supports horizontal scaling and replication for high availability.

##### Choosing the Right Engine

- For small, temporary datasets without complex requirements, the Log engine is sufficient.
- For larger datasets with performance and feature requirements, the MergeTree engine family is recommended.

We will be using the **MergeTree** engine for this project.

#### TTL in ClickHouse

Time-to-Live (TTL) policies in ClickHouse allow automatic deletion of data after a specified period. This is useful for managing log data retention, ensuring that old logs are automatically removed to save storage space and maintain performance.

```sql
TTL toDateTime(Timestamp) + INTERVAL 30 DAY; -- Auto cleanup after 30 days
```

#### Docker Configuration

In the Docker setup, the `init.sql` script is mounted to `/docker-entrypoint-initdb.d/init.sql`. This is a standard practice in Dockerized ClickHouse setups. When the ClickHouse container starts, it executes any SQL scripts found in the `/docker-entrypoint-initdb.d/` directory, allowing for automatic initialization of the database schema and data.

#### Ports in ClickHouse

ClickHouse uses multiple ports for different protocols:

- **Port 9000:** Native ClickHouse protocol, optimized for performance.
- **Port 8123:** HTTP protocol, compatible with the MySQL protocol, making it accessible to a wider range of clients.

##### Using ClickHouse HTTP Endpoint

ClickHouse provides an HTTP interface that allows you to interact with the database using standard HTTP requests. This is particularly useful for integrating ClickHouse with external systems.

You can insert data into ClickHouse using an HTTP POST request. Below is an example of how to insert log data into a logs_otel table using curl:

```bash
curl -X POST 'http://localhost:8123/' --data-binary 'INSERT INTO logs_otel FORMAT JSONEachRow {"Timestamp": "2024-01-01 12:00:00", "SeverityText": "INFO", "SeverityNumber": 2, "Body": "This is a test log message", "ServiceName": "my_service", "TraceId": "123e4567-e89b-12d3-a456-426614174000", "SpanId": "123e4567-e89b-12d3-a456-426614174000", "ResourceAttributes": "{}", "LogAttributes": "{}"}'
```

You can also retrieve data from ClickHouse using an HTTP GET request. Below is an example of how to query:

```bash
curl 'http://localhost:8123/?query=SELECT+*+FROM+logs_otel'
```

#### Schema-on-Write vs. Schema-less

ClickHouse is a schema-on-write database, meaning the schema is defined at the time of writing data. This approach allows for efficient storage and querying, as the database knows the structure of the data in advance. In contrast, schema-less databases like Cassandra offer more flexibility in data modeling but may sacrifice some performance and query efficiency.

### Vector

Vector is a data pipeline tool that collects, transforms, and routes logs, metrics, and traces. It is designed to be highly efficient, reliable, and easy to configure.

#### Key Features

- **Collect:** Vector can collect data from various sources, including files, sockets, and other data streams.
- **Transform:** It provides a wide range of transformations to structure and enrich log data, making it ready for analysis.
- **Forward:** Vector can forward processed data to various destinations, including ClickHouse, for storage and further processing.

#### Vector Configuration

Vector is configured to:

- Collect logs from the example application
- Transform and structure log data
- Forward processed logs to ClickHouse

<img src="https://github.com/user-attachments/assets/7ac1e92e-39e7-4953-a6ec-12f6de572768" alt="Vector" width="600px"/>

### Grafana

Grafana is an open-source platform for monitoring and observability. It allows users to visualize and explore time series data, set alerts, and create dashboards to monitor their systems and applications.

#### Setup

In this project, Grafana is pre-configured with:

- A ClickHouse data source, enabling it to query data stored in ClickHouse.
- Sample dashboards for log visualization, providing out-of-the-box visual representations of log data.

<img src="https://github.com/user-attachments/assets/dce325de-a146-47e2-82f6-1ecda5465fb7" alt="Grafana" width="600px"/>

#### Customization

Users can customize Grafana further by adding more data sources, creating custom dashboards, and setting up advanced alerting rules based on their specific monitoring needs.

### Express.js Application

The Express.js application is a simple web application that generates log messages. It uses the `winston` logger to write logs to a file.

### OpenTelemetry (OTel)

OpenTelemetry (OTel) is an open-source observability framework that provides a set of tools, APIs, and SDKs for collecting, processing, and exporting telemetry data (logs, metrics, and traces).

#### OpenTelemetry Schema

The OpenTelemetry schema refers to the standardized structure and format for telemetry data, including traces, metrics, and logs. This schema defines how data should be structured, what fields should be included, and how different types of telemetry data relate to each other.

For logs specifically, the OpenTelemetry log data model defines a standard set of fields and attributes that should be present in log records. This includes fields like timestamp, severity, body, attributes, and resource information. By adhering to this schema, different logging systems and tools can interchange log data in a standardized way, promoting interoperability and easing the integration between various components of a logging infrastructure.

##### Benefits of Using OpenTelemetry Schema

- **Standardization:** Ensures that your log data is consistent and can be easily understood and processed by different tools and systems that support the OTel schema.
- **Interoperability:** Tools and platforms that support the OpenTelemetry schema can seamlessly integrate with each other, allowing for a more unified approach to monitoring and observability.
- **Vendor Neutrality:** OpenTelemetry is vendor-neutral, meaning you're not locked into a specific vendor's ecosystem. This flexibility allows you to choose best-of-breed tools for different aspects of your monitoring stack.
- **Easier Onboarding:** Standardized schemas make it easier for new team members or stakeholders to understand and work with the logging infrastructure, as they can rely on well-defined structures and conventions.

##### Implementing OpenTelemetry Schema in Log Tables

When designing log tables in a database like ClickHouse, adhering to the OpenTelemetry schema can help ensure that the data is structured in a way that is compatible with a wide range of tools and platforms.

Here's an example of how you might structure a ClickHouse table to align with the OpenTelemetry log schema:

```sql
CREATE TABLE IF NOT EXISTS logs_otel
(
    Timestamp DateTime64(3),
    SeverityText String,  -- OpenTelemetry equivalent of log level
    SeverityNumber Int8,  -- Numeric representation of severity
    Body String,  -- Log message
    ServiceName String,  -- Service generating the log
    TraceId String,  -- OpenTelemetry Trace ID (if available)
    SpanId String,  -- OpenTelemetry Span ID (if available)
    ResourceAttributes String,  -- JSON string for resource-level attributes
    LogAttributes String  -- JSON string for structured log-specific attributes
)
ENGINE = MergeTree()
ORDER BY (Timestamp);
```

## Support

For support and questions:

- Create an issue in the repository
