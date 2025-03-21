# Deployment Guide

## Prerequisites

- Node.js v16+
- Yarn
- Appwrite Cloud account
- Docker (optional)

## Environment Setup

1. Create `.env` file:
```env
PUBLIC_APPWRITE_PROJECT_ID=your-project-id
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your-api-key
```

## Build

```bash
# Install dependencies
yarn install

# Build for production
yarn build
```

## Deployment Options

### 1. Docker

```bash
# Build image
docker build -t timetablepro .

# Run container
docker run -p 3000:3000 timetablepro
```

### 2. Node.js Server

```bash
# Start production server
yarn start
```

### 3. Static Hosting

Deploy the `build` directory to any static hosting service:
- Vercel
- Netlify
- GitHub Pages

## Health Checks

- `/health`: Server health check
- `/api/health`: API health check

## Monitoring

Monitor your application using:
- Server logs
- Appwrite Console
- Application metrics dashboard

## Database Setup

### Appwrite Setup

1. Create Collections:

```bash
yarn init-db
```

This script will:
- Create necessary collections
- Set up indexes
- Configure permissions
- Create admin team

2. Verify Collections:
   - Check users collection
   - Check rooms collection
   - Check schedules collection
   - Check availability collection

3. Set up Storage:
   - Create avatar bucket
   - Configure permissions

## Monitoring and Maintenance

### Health Checks

Implement health check endpoint:

```typescript
// src/routes/health/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { databases } from '$lib/config/appwrite';

export const GET: RequestHandler = async () => {
  try {
    await databases.list(); // Test database connection
    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
};
```

### Logging

Set up logging with Winston:

```typescript
// src/lib/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backup Strategy

1. Database Backups:
   ```bash
   # Backup script
   appwrite backup create \
     --project-id your-project-id \
     --api-key your-api-key
   ```

2. Schedule regular backups:
   ```bash
   # Add to crontab
   0 0 * * * /path/to/backup-script.sh
   ```

## Performance Optimization

### 1. Enable Compression

```javascript
// server.js
app.use(compression());
```

### 2. Cache Control Headers

```javascript
app.use(express.static('build', {
  maxAge: '1y',
  etag: false
}));
```

### 3. CDN Setup

Configure CDN for static assets:

```javascript
const PUBLIC_CDN_URL = process.env.PUBLIC_CDN_URL;

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
});
```

## SSL Configuration

### 1. Generate SSL Certificate

```bash
certbot certonly --nginx -d yourdomain.com
```

### 2. Configure NGINX

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Common Issues

1. Build Failures
   ```bash
   # Clear build cache
   rm -rf .svelte-kit
   yarn build
   ```

2. Database Connection Issues
   ```bash
   # Check Appwrite connection
   curl -X GET "https://cloud.appwrite.io/v1/health"
   ```

3. Memory Issues
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS=--max_old_space_size=4096 yarn build
   ```

### Monitoring Tools

1. Set up Sentry:
   ```typescript
   import * as Sentry from '@sentry/node';

   Sentry.init({
     dsn: 'your-sentry-dsn',
     environment: process.env.NODE_ENV
   });
   ```

2. Configure logging:
   ```typescript
   logger.info('Application started', {
     timestamp: new Date().toISOString()
   });
   ```

## Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Security headers implemented
- [ ] Input validation added
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## Maintenance Schedule

1. Weekly Tasks:
   - Check error logs
   - Monitor performance metrics
   - Update dependencies

2. Monthly Tasks:
   - Rotate API keys
   - Review security settings
   - Perform database cleanup

3. Quarterly Tasks:
   - Update SSL certificates
   - Review and update documentation
   - Perform load testing

## Deployment Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph CDN Layer
        CDN[Content Delivery Network]
    end
    
    subgraph Application Layer
        LB[Load Balancer]
        App1[App Server 1]
        App2[App Server 2]
        Cache[Redis Cache]
    end
    
    subgraph Backend Services
        Auth[Appwrite Auth]
        DB[Appwrite Database]
        Storage[Appwrite Storage]
    end
    
    Browser --> CDN
    Mobile --> CDN
    CDN --> LB
    LB --> App1
    LB --> App2
    App1 --> Cache
    App2 --> Cache
    App1 --> Backend Services
    App2 --> Backend Services
    
    style Client Layer fill:#f9f,stroke:#333,stroke-width:2px
    style CDN Layer fill:#bbf,stroke:#333,stroke-width:2px
    style Application Layer fill:#bfb,stroke:#333,stroke-width:2px
    style Backend Services fill:#fbb,stroke:#333,stroke-width:2px
```

## CI/CD Workflow

```mermaid
graph LR
    subgraph Development
        Code[Code Changes] --> Tests[Run Tests]
        Tests --> Build[Build App]
    end
    
    subgraph Staging
        Build --> Deploy_Staging[Deploy to Staging]
        Deploy_Staging --> Integration_Tests[Integration Tests]
    end
    
    subgraph Production
        Integration_Tests --> Deploy_Prod[Deploy to Production]
        Deploy_Prod --> Health_Check[Health Checks]
        Health_Check --> Monitor[Monitoring]
    end
    
    style Development fill:#f9f,stroke:#333,stroke-width:2px
    style Staging fill:#bbf,stroke:#333,stroke-width:2px
    style Production fill:#bfb,stroke:#333,stroke-width:2px
```

## Monitoring Flow

```mermaid
flowchart TD
    subgraph Application
        Metrics[Metrics Collection]
        Logs[Log Generation]
        Traces[Distributed Tracing]
    end
    
    subgraph Monitoring Stack
        Prometheus[Prometheus]
        Grafana[Grafana]
        Loki[Loki]
        Jaeger[Jaeger]
    end
    
    subgraph Alerts
        Rules[Alert Rules]
        Manager[Alert Manager]
        Notification[Notifications]
    end
    
    Metrics --> Prometheus
    Logs --> Loki
    Traces --> Jaeger
    
    Prometheus --> Grafana
    Loki --> Grafana
    Jaeger --> Grafana
    
    Grafana --> Rules
    Rules --> Manager
    Manager --> Notification
    
    style Application fill:#f9f,stroke:#333,stroke-width:2px
    style Monitoring Stack fill:#bbf,stroke:#333,stroke-width:2px
    style Alerts fill:#bfb,stroke:#333,stroke-width:2px
```

## Scaling Architecture

```mermaid
flowchart TD
    subgraph Load Balancing
        CloudFlare[CloudFlare CDN]
        LB[Load Balancer]
    end
    
    subgraph Application Tier
        App1[App Server 1]
        App2[App Server 2]
        App3[App Server 3]
    end
    
    subgraph Caching Layer
        Redis1[Redis Primary]
        Redis2[Redis Replica]
    end
    
    subgraph Backend Services
        Auth[Appwrite Auth]
        DB[Appwrite Database]
        Storage[Appwrite Storage]
    end
    
    CloudFlare --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> Redis1
    App2 --> Redis1
    App3 --> Redis1
    Redis1 --> Redis2
    
    App1 --> Backend Services
    App2 --> Backend Services
    App3 --> Backend Services
    
    style Load Balancing fill:#f9f,stroke:#333,stroke-width:2px
    style Application Tier fill:#bbf,stroke:#333,stroke-width:2px
    style Caching Layer fill:#bfb,stroke:#333,stroke-width:2px
    style Backend Services fill:#fbb,stroke:#333,stroke-width:2px
```

## Backup Strategy

```mermaid
flowchart TD
    subgraph Data Sources
        AppDB[Appwrite Database]
        Files[File Storage]
        Config[Configuration]
    end
    
    subgraph Backup Process
        Schedule[Scheduled Jobs]
        Snapshot[Create Snapshot]
        Compress[Compress Data]
        Encrypt[Encrypt Backup]
    end
    
    subgraph Storage
        Local[Local Storage]
        Cloud[Cloud Storage]
        Archive[Long-term Archive]
    end
    
    AppDB --> Schedule
    Files --> Schedule
    Config --> Schedule
    
    Schedule --> Snapshot
    Snapshot --> Compress
    Compress --> Encrypt
    
    Encrypt --> Local
    Encrypt --> Cloud
    Cloud --> Archive
    
    style Data Sources fill:#f9f,stroke:#333,stroke-width:2px
    style Backup Process fill:#bbf,stroke:#333,stroke-width:2px
    style Storage fill:#bfb,stroke:#333,stroke-width:2px
```

## Security Architecture

```mermaid
flowchart TD
    subgraph External
        User[User]
        API[API Clients]
    end
    
    subgraph Security Layer
        WAF[Web Application Firewall]
        Auth[Authentication]
        CORS[CORS Policy]
        Rate[Rate Limiting]
    end
    
    subgraph Application
        Validation[Input Validation]
        Sanitization[Data Sanitization]
        Encryption[Data Encryption]
    end
    
    User --> WAF
    API --> WAF
    
    WAF --> Auth
    Auth --> CORS
    CORS --> Rate
    
    Rate --> Validation
    Validation --> Sanitization
    Sanitization --> Encryption
    
    style External fill:#f9f,stroke:#333,stroke-width:2px
    style Security Layer fill:#bbf,stroke:#333,stroke-width:2px
    style Application fill:#bfb,stroke:#333,stroke-width:2px
``` 