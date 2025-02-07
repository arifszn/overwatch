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
