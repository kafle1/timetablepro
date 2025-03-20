# Getting Started with TimeTablePro

This guide will help you get TimeTablePro up and running quickly, whether you're setting up a development environment or preparing for production deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or later)
- **Package Manager**: Yarn (recommended) or npm
- **Git** for version control
- **Appwrite Cloud Account** for backend services

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/timetablepro.git
cd timetablepro
```

### 2. Install Dependencies

```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

### 3. Configure Environment Variables

```bash
# Create a .env file from the example
cp .env.example .env
```

Edit the `.env` file with your own values. At minimum, you'll need to configure:

- Appwrite endpoint
- Appwrite project ID
- Appwrite API key

See the [Environment Variables](ENV.md) documentation for a complete list of available configuration options.

### 4. Initialize the Database

Run the initialization script to set up Appwrite collections and initial data:

```bash
# Using Yarn
yarn init-db

# Or using npm
npm run init-db
```

This script will:
- Create necessary collections in Appwrite
- Set up database indexes and attributes
- Create initial admin user (if configured)

### 5. Start the Development Server

```bash
# Using Yarn
yarn dev

# Or using npm
npm run dev
```

Your TimeTablePro instance will be available at `http://localhost:5173`.

## First-Time Setup

After installation, follow these steps to configure your TimeTablePro instance:

### 1. Create Administrator Account

The first user to register will automatically be assigned administrator privileges. 

1. Navigate to `/register` 
2. Create your admin account with a strong password
3. Log in to access the admin dashboard

### 2. Configure System Settings

From the admin dashboard:

1. Go to **Settings** > **General Settings**
2. Configure your institution's:
   - Name
   - Working days
   - Working hours
   - Term dates
   - Time slot duration

### 3. Add Resources

Before creating schedules, you need to add:

1. **Rooms**: Add classrooms, labs, and other spaces
2. **Teachers**: Add faculty members and their specialties
3. **Students**: Add students or import them via CSV
4. **Subjects/Courses**: Add subjects and course information

### 4. Create Your First Schedule

1. Navigate to **Schedule** > **Create New**
2. Follow the guided process to create a timetable
3. Use the conflict resolution tools if scheduling conflicts arise

## Next Steps

- Read the [User Guide](USER_GUIDE.md) for detailed usage instructions
- Explore [API Reference](API.md) for integration options
- Check [Deployment](DEPLOYMENT.md) for production deployment instructions

## Troubleshooting

If you encounter issues during setup:

1. Ensure all environment variables are correctly configured
2. Check that Appwrite services are running and accessible
3. Verify network connectivity to Appwrite endpoints
4. Review browser console for frontend errors
5. Check server logs for backend issues

For more help, create an issue on the GitHub repository or contact support.

## Project Structure

```
timetablepro/
├── src/
│   ├── lib/        # Components and utilities
│   └── routes/     # Pages
├── static/         # Assets
└── tests/         # Test files
```

## Available Scripts

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn test`: Run tests
- `yarn lint`: Check code style

## Next Steps

1. Create an admin account
2. Set up your first schedule
3. Add rooms and resources
4. Invite users

For more details, see:
- [API Reference](API.md)
- [Deployment Guide](DEPLOYMENT.md) 