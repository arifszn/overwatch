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
│   ├── dashboards/             # Pre-built Grafana dashboards
│   └── datasources.yaml        # Grafana data source configuration
├── README.md                   # Project documentation
└── LICENSE                     # Open-source license
```