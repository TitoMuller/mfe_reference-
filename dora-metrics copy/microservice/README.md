# DORA Metrics API

A production-ready microservice that provides DORA (DevOps Research and Assessment) metrics through a REST API, built for integration with Zephyr Cloud's architecture.

## 🔒 Security

- **Organization-level isolation** - Users can only access their organization's data
- **Rate limiting** - Prevents API abuse (100 requests per 15 minutes by default)
- **Input validation** - All requests validated with Zod schemas
- **Error handling** - Consistent error responses without data leaks
- **CORS protection** - Configurable origin restrictions
- **Helmet.js** - Security headers for production

## 📊 Monitoring & Logging

### Structured Logging
All logs include:
- Organization context
- Request/response metadata  
- Performance metrics
- Error stack traces (development only)

### Health Checks

**Application Health:**
```http
GET /health
```

**Organization Data Health:**
```http 
GET /api/v1/dora/my-org/health
```

### Metrics & Observability
- Request/response logging with duration
- Database query performance tracking
- Error rate monitoring by organization
- Memory and CPU usage tracking
 
## 🔧 Configuration

### Database Configuration
```typescript
// Databricks connection settings
{
  hostname: 'your-workspace.cloud.databricks.com',
  httpPath: '/sql/1.0/warehouses/your-warehouse-id',
  token: 'your-access-token',
  catalog: 'zephyr_catalog',
  schema: 'dora_gold'
}
```

### Rate Limiting
```typescript
// Adjust rate limits per environment
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests'
}
```

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Error: Databricks connection failed: timeout
```
- Verify `DATABRICKS_SERVER_HOSTNAME` and `DATABRICKS_HTTP_PATH`
- Check access token permissions
- Ensure warehouse is running

**2. Organization Access Denied**  
```json
{
  "error": true,
  "message": "Access denied to organization: my-org",
  "code": "ORGANIZATION_ACCESS_DENIED"
}
```
- Verify organization name exists in data
- Check data availability with `/health` endpoint

**3. Validation Errors**
```json
{
  "error": true, 
  "message": "Validation failed",
  "details": [
    {
      "path": "startDate",
      "message": "Invalid start date format"
    }
  ]
}
```
- Use ISO 8601 datetime format: `2024-01-01T00:00:00.000Z`
- Check parameter names and values

### Debug Mode
```bash
LOG_LEVEL=debug npm run dev
```