# Environment Variables

## Required Variables

```env
# Appwrite Configuration
PUBLIC_APPWRITE_PROJECT_ID=your-project-id
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your-api-key

# Application
NODE_ENV=development|production
PORT=3000
```

## Optional Variables

```env
# Customization
PUBLIC_APP_NAME=TimeTablePro
PUBLIC_THEME=light|dark

# Features
ENABLE_NOTIFICATIONS=true|false
ENABLE_ANALYTICS=true|false
```

## Development vs Production

For development:
```env
NODE_ENV=development
PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
```

For production:
```env
NODE_ENV=production
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

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