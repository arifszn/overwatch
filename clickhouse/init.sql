-- Create a database
CREATE DATABASE IF NOT EXISTS overwatch;

-- Create a table to store app logs
CREATE TABLE IF NOT EXISTS overwatch.app_logs
(
    timestamp DateTime64(3),
    level String,
    message String,
    service String
)
ENGINE = MergeTree()
ORDER BY (timestamp)
TTL toDateTime(timestamp) + INTERVAL 30 DAY; -- Auto cleanup after 30 days