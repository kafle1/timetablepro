# Environment Variables Documentation

This document describes the environment variables used in TimeTablePro.

## Required Variables

These variables must be set for the application to function properly:

### Appwrite Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APPWRITE_ENDPOINT` | Appwrite API endpoint URL | `http://localhost/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Your Appwrite project ID | `64a1b2c3d4e5f6g7` |
| `VITE_APPWRITE_DATABASE_ID` | Your Appwrite database ID | `timetablepro-db` |

## Optional Variables

These variables have defaults but can be customized if needed:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_NAME` | Application name | `TimeTablePro` | `MySchoolScheduler` |
| `VITE_APP_URL` | Application URL | `http://localhost:5173` | `https://schedule.myschool.com` |

## Default Configuration

The following settings are hard-coded in the application for simplicity:

### Time Settings
- Schedule start time: 08:00
- Schedule end time: 17:00
- Time slot duration: 60 minutes
- Working days: Monday to Friday

### Room Settings
- Minimum room capacity: 1
- Maximum room capacity: 500
- Floor range: -5 to 100

### Password Requirements
- Minimum length: 8 characters
- Requires: uppercase, lowercase, number, special character
- Special characters: !@#$%^&*

### UI Settings
- Default theme: system
- Toast duration: 5 seconds
- Animations: enabled

## Development vs Production

Some variables might need different values in development and production:

```bash
# Development
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APP_URL=http://localhost:5173

# Production
VITE_APPWRITE_ENDPOINT=https://api.yourdomain.com/v1
VITE_APP_URL=https://schedule.yourdomain.com
```

## Setting Up

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required variables:
   ```bash
   VITE_APPWRITE_ENDPOINT=your-endpoint
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   ```

3. Optionally customize the application name and URL.

## Security Considerations

- Never commit `.env` file to version control
- Use different values for development and production
- Regularly rotate sensitive credentials
- Use secure values in production

```bash
# Development
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APP_URL=http://localhost:5173

# Production
VITE_APPWRITE_ENDPOINT=https://api.yourdomain.com/v1
VITE_APP_URL=https://schedule.yourdomain.com
```

## Setting Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required variables:
   ```bash
   VITE_APPWRITE_ENDPOINT=your-endpoint
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   ```

3. Customize optional variables as needed.

## Security Considerations

- Never commit `.env` file to version control
- Use different values for development and production
- Regularly rotate sensitive credentials
- Use secure values in production
- Validate environment variables on application startup 