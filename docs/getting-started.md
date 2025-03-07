# Getting Started

## Prerequisites

- Node.js v16+
- Yarn
- Appwrite Cloud account

## Quick Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/timetablepro.git
cd timetablepro
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment:
```bash
cp .env.example .env
# Update .env with your Appwrite credentials
```

4. Start development server:
```bash
yarn dev
```

Visit `http://localhost:3000` to see your app.

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