# TimetablePro

A modern school timetable management system built with SvelteKit and Appwrite.

## Features

- User authentication and role-based access control
- Class scheduling with conflict detection
- Room management
- Teacher availability management
- Interactive schedule visualization
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- Frontend: SvelteKit
- Backend: Appwrite Cloud
- Styling: Tailwind CSS
- UI Components: shadcn-svelte
- Icons: Lucide Icons

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Appwrite Cloud account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/timetablepro.git
cd timetablepro
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Appwrite credentials:
```bash
APPWRITE_PROJECT_ID=your-project-id
PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

5. Set up Appwrite:
   - Create a new project in Appwrite Cloud
   - Create a database with the following collections:
     - users
     - rooms
     - schedules
     - availability
   - Set up authentication methods (email/password)
   - Create API keys with necessary permissions

6. Start the development server:
```bash
yarn dev
```

## Project Structure

```
src/
├── lib/
│   ├── components/    # UI components
│   ├── config/        # Configuration files
│   ├── services/      # API and database services
│   ├── stores/        # Svelte stores
│   └── utils/         # Utility functions
├── routes/
│   ├── (auth)/        # Authentication routes
│   └── (dashboard)/   # Dashboard routes
└── app.d.ts           # TypeScript declarations
```

## Development

- Run development server: `yarn dev`
- Build for production: `yarn build`
- Preview production build: `yarn preview`
- Check code style: `yarn lint`
- Format code: `yarn format`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
