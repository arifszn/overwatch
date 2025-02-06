-- Create a database
CREATE DATABASE IF NOT EXISTS overwatch;

-- Create a table to store log entries with a 30-day TTL
CREATE TABLE IF NOT EXISTS overwatch.app_logs
(
    timestamp DateTime,
    level String,
    message String,
    service String
)
ENGINE = MergeTree()
ORDER BY (timestamp)
TTL timestamp + INTERVAL 30 DAY; -- Auto cleanup after 30 days