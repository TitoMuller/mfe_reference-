# DORA Metrics - Microservice & Frontend

A complete DORA metrics implementation for Zephyr Cloud, consisting of a backend microservice that queries Databricks and a React frontend for visualization.

## Architecture

### Microservice
- **Technology**: Express.js with TypeScript
- **Data Source**: Databricks SQL (queries gold tables in `zephyr_catalog.dora_gold`)
- **Key Features**: Organization-level data isolation, request validation with Zod, structured logging with Winston, rate limiting

### Frontend
- **Technology**: React with TypeScript, Vite, TailwindCSS
- **Visualization**: Recharts for time-series charts
- **Key Features**: Interactive filters, time range selection, responsive dashboard

## Local Setup

### Prerequisites
- Node.js 18+ and npm 9+
- Access to Databricks workspace with DORA gold tables
- Databricks access token

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dora-metrics
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install microservice dependencies
cd microservice
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure microservice environment variables**

Create a `.env` file in the `microservice` folder:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Databricks Configuration
DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your-warehouse-id
DATABRICKS_ACCESS_TOKEN=dapi1234567890abcdef...
DATABRICKS_CATALOG=zephyr_catalog
DATABRICKS_SCHEMA=dora_gold

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Note**: You'll need to obtain the `.env` file with valid credentials from the project maintainer.

4. **Run both services**

Option A - Run both together (from root):
```bash
npm run dev
```

Option B - Run separately in different terminals:

Terminal 1 (Microservice):
```bash
cd microservice
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The microservice will start on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## Project Structure

```
dora-metrics/
├── microservice/
│   ├── src/
│   │   ├── config/         # Database and environment configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # TypeScript interfaces and Zod schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic and Databricks queries
│   │   ├── utils/          # Logging utilities
│   │   └── index.ts        # Entry point
│   ├── tests/              # Unit and integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── charts/     # Chart components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main application
│   └── package.json
└── package.json            # Root workspace configuration
```

## Organization Authentication - Important Note

**The organization-level authentication is not yet integrated with Zephyr's auth system.**

Currently, the organization name is hardcoded in the frontend service file:

```typescript
// File: frontend/src/services/apiService.ts
private organizationName = 'zephyrcloudio';
```

**To test with your organization:**
1. Open `frontend/src/services/apiService.ts`
2. Change the `organizationName` value to match your organization's name in the database
3. Ensure your Databricks tables have data for that organization

**Future work**: This will be replaced with proper authentication that extracts the organization from the user's session/token.

## API Endpoints

The microservice exposes the following endpoints (all under `/api/v1/dora/:organizationName`):

- `GET /deployment-frequency` - Daily deployment counts
- `GET /change-failure-rate` - Failure rate percentages
- `GET /lead-time-for-changes` - Time from commit to deployment
- `GET /mean-time-to-restore` - Recovery time from failures
- `GET /summary` - All metrics in one response
- `GET /filters` - Available filter options (projects, applications, environments)
- `GET /health` - Organization data health check

Query parameters: `timeRange`, `startDate`, `endDate`, `projectName`, `applicationName`, `environmentType`

## Databricks Tables

The microservice expects these tables in `zephyr_catalog.dora_gold`:

- `deployment_frequency`
- `change_failure_rate`
- `lead_time_for_changes`
- `mean_time_to_restore`

## Troubleshooting

**Microservice won't start**
- Verify `.env` file exists with valid Databricks credentials
- Check that Databricks warehouse is running
- Ensure port 3001 is not in use

**Frontend can't connect to microservice**
- Verify microservice is running on port 3001
- Check browser console for CORS errors
- Verify `CORS_ORIGIN` in microservice `.env` includes `http://localhost:3000`

**No data showing in dashboard**
- Verify organization name matches data in Databricks tables
- Check browser network tab for API errors
- Test microservice directly: `curl http://localhost:3001/api/v1/dora/zephyrcloudio/health`

## Next Steps

- Integrate with Zephyr's authentication system
- Add organization context from user session
- Deploy to staging/production environment
- Add automated tests for frontend components