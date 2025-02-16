# TimeTablePro

A modern, flexible, and feature-rich timetable management system built with SvelteKit, TypeScript, and Tailwind CSS.

## Features

### Core Features
- 🎯 Intuitive schedule management
- 👥 Role-based access control (Admin, Teacher, Student)
- 🏢 Room and resource management
- 📅 Conflict detection and resolution
- 🔔 Real-time notifications
- 🌓 Dark mode support
- 📱 Responsive design
- ♿ Accessibility focused
- 🔒 Secure authentication
- 🚀 Performance optimized

### Advanced Features
- 📊 Dynamic time slot configuration
- 🔄 Recurring schedule support
- 📋 Teacher availability management
- 🏗️ Flexible room features
- 🎨 Customizable UI themes
- 🔧 Extensive configuration options
- 🚦 API rate limiting
- 💾 Caching support
- 🔍 Advanced search capabilities
- 📈 Usage analytics

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Appwrite
- **Testing**: Vitest + Testing Library
- **UI Components**: Custom components with shadcn/ui styling
- **State Management**: Svelte stores
- **Form Handling**: Custom form utilities
- **API Integration**: Appwrite SDK
- **Error Handling**: Custom error boundary
- **Notifications**: Toast notifications
- **Animations**: Svelte transitions
- **Icons**: Lucide icons
- **Documentation**: TypeDoc

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Appwrite instance (v1.4 or higher)

### Installation

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

4. Update the environment variables in `.env` with your configuration.

5. Initialize the database:
```bash
yarn init-db
```

6. Start the development server:
```bash
yarn dev
```

### Building for Production

1. Build the application:
```bash
yarn build
```

2. Preview the production build:
```bash
yarn preview
```

### Running Tests

Run all tests:
```bash
yarn test
```

Run tests in watch mode:
```bash
yarn test:watch
```

Generate test coverage:
```bash
yarn test:coverage
```

## Configuration

TimeTablePro is highly configurable through environment variables. See `.env.example` for all available options:

### Appwrite Configuration
- `VITE_APPWRITE_ENDPOINT`: Appwrite API endpoint
- `VITE_APPWRITE_PROJECT_ID`: Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID`: Appwrite database ID

### Time Configuration
- `VITE_TIME_SLOT_START`: Start time for schedules (default: "08:00")
- `VITE_TIME_SLOT_END`: End time for schedules (default: "17:00")
- `VITE_TIME_SLOT_DURATION`: Duration in minutes (default: 60)
- `VITE_WORKING_DAYS`: Comma-separated list of working days

### Room Configuration
- `VITE_MIN_ROOM_CAPACITY`: Minimum room capacity
- `VITE_MAX_ROOM_CAPACITY`: Maximum room capacity
- `VITE_MIN_FLOOR`: Minimum floor number
- `VITE_MAX_FLOOR`: Maximum floor number

### Feature Flags
- `VITE_ENABLE_NOTIFICATIONS`: Enable notification system
- `VITE_ENABLE_DARK_MODE`: Enable dark mode support
- `VITE_ENABLE_TEACHER_AVAILABILITY`: Enable teacher availability management
- `VITE_ENABLE_ROOM_FEATURES`: Enable room features
- `VITE_ENABLE_RECURRING_SCHEDULES`: Enable recurring schedules

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # Base UI components
│   │   └── ...        # Feature-specific components
│   ├── config/        # Application configuration
│   ├── services/      # API and service layer
│   ├── stores/        # Svelte stores
│   ├── types/         # TypeScript types and interfaces
│   └── utils/         # Utility functions
├── routes/            # SvelteKit routes
│   ├── (app)/        # Protected app routes
│   ├── (auth)/       # Authentication routes
│   └── (dashboard)/  # Dashboard routes
└── test/             # Test utilities and setup
```

## Features in Detail

### Authentication and Authorization
- Secure login and registration
- Role-based access control
- Protected routes
- Session management
- Password policies

### Schedule Management
- Create and manage schedules
- Conflict detection
- Recurring schedules
- Schedule validation
- Time slot management

### Room Management
- Room capacity tracking
- Resource management
- Availability tracking
- Room features
- Floor management

### Teacher Availability
- Availability tracking
- Schedule conflicts
- Working hours
- Recurring availability

### User Interface
- Modern and clean design
- Responsive layout
- Dark mode support
- Toast notifications
- Loading states
- Error boundaries
- Animations
- Accessibility

### Form Handling
- Form validation
- Error handling
- Async submission
- Loading states
- Field-level validation

### Error Handling
- Global error boundary
- Toast notifications
- Validation errors
- Network errors
- Error logging

### Performance
- Code splitting
- Lazy loading
- Caching
- Service worker
- API rate limiting
- Optimized builds

### Testing
- Unit tests
- Component tests
- Integration tests
- Test utilities
- Mock data
- Coverage reporting

## API Documentation

Detailed API documentation is available at `/docs/api` when running in development mode.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security vulnerabilities, please review and follow our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [SvelteKit](https://kit.svelte.dev/)
- [Appwrite](https://appwrite.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- [Lucide Icons](https://lucide.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/)
