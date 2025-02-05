```
├── docker-compose.yml          # Main Docker Compose file
├── app/                        # Example Express.js app
│   ├── app.js                  # Main Express app
│   └── Dockerfile              # Dockerfile for the Express app
├── clickhouse/                 # ClickHouse configurations
│   ├── init.sql                # SQL script to create log tables
│   └── Dockerfile              # Custom ClickHouse image (if needed)
├── fluent-bit/                 # Fluent Bit configurations
│   └── fluent-bit.conf         # Fluent Bit configuration
├── grafana/                    # Grafana configurations
│   ├── dashboards/             # Pre-built Grafana dashboards
│   └── datasources.yaml        # Grafana data source configuration
├── README.md                   # Project documentation
└── LICENSE                     # Open-source license
```