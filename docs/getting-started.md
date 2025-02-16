# Getting Started with TimeTablePro

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [First-Time Setup](#first-time-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- Yarn package manager
- An Appwrite instance (v1.4 or higher)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/timetablepro.git
   cd timetablepro
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Configuration

1. Create environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure Appwrite:
   - Create a new project in Appwrite Console
   - Enable Google OAuth:
     - Go to Authentication > OAuth2 Providers
     - Enable Google provider
     - Add authorized domains
     - Configure OAuth scopes:
       - `openid`
       - `profile`
       - `email`

3. Update `.env` with your Appwrite credentials:
   ```env
   VITE_APPWRITE_ENDPOINT=your-appwrite-endpoint
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   ```

## Running the Application

1. Start development server:
   ```bash
   yarn dev
   ```

2. Build for production:
   ```bash
   yarn build
   ```

3. Preview production build:
   ```bash
   yarn preview
   ```

## First-Time Setup

1. Register an admin account:
   - Visit `/register`
   - Create account with admin role
   - Configure initial settings

2. Set up rooms and resources:
   - Log in as admin
   - Go to Room Management
   - Add rooms with capacities

3. Add teachers:
   - Invite teachers via email
   - Set availability

## Troubleshooting

### Common Issues

1. OAuth Login Issues:
   - Verify OAuth provider configuration
   - Check authorized domains
   - Ensure correct scopes are enabled

2. Database Connection:
   - Verify Appwrite credentials
   - Check database permissions
   - Ensure collections exist

3. Build Errors:
   - Clear node_modules and reinstall
   - Update dependencies
   - Check TypeScript errors

For more detailed troubleshooting, see our [Troubleshooting Guide](troubleshooting.md). 