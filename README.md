# TimeTablePro

<div align="center">
  <p><strong>AI-Powered Timetable Management for Educational Institutions</strong></p>
</div>

## 🚀 Overview

TimeTablePro is a modern, intelligent timetable management system designed specifically for educational institutions. It streamlines the complex process of creating and managing class schedules, optimizing resource allocation, and eliminating scheduling conflicts.

Built with SvelteKit and Appwrite, TimeTablePro offers a responsive, intuitive interface for administrators, teachers, and students, ensuring a seamless scheduling experience for institutions of all sizes.

## ✨ Key Features

- **🧠 Intelligent Scheduling** - AI-powered conflict resolution and timetable optimization
- **📊 Resource Management** - Efficient allocation of teachers, rooms, and other resources
- **👥 Role-Based Access** - Tailored interfaces for administrators, teachers, and students
- **🔔 Real-Time Notifications** - Instant updates for all users when schedules change
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices 
- **🌓 Dark Mode Support** - Eye-friendly interface for all lighting conditions
- **📈 Detailed Analytics** - Insights to improve resource utilization and scheduling efficiency
- **🛡️ Enterprise-Grade Security** - Protecting sensitive institutional data

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.0, TypeScript, Tailwind CSS
- **Backend**: Appwrite Cloud
- **Authentication**: Appwrite Auth
- **Database**: Appwrite Database
- **Hosting**: Vercel/Netlify

## 🔧 Quick Start

### Prerequisites

- Node.js v16+
- Yarn or npm
- Appwrite Cloud account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/timetablepro.git
cd timetablepro
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit the .env file with your Appwrite credentials
```

4. Initialize the database
```bash
yarn init-db
# or
npm run init-db
```

5. Start the development server
```bash
yarn dev
# or
npm run dev
```

Visit `http://localhost:5173` to see your application running.

## 📂 Project Structure

```
timetablepro/
├── src/                  # Source code
│   ├── lib/              # Reusable components, stores, and utilities
│   │   ├── components/   # UI components
│   │   ├── config/       # Application configuration
│   │   ├── stores/       # Svelte stores for state management
│   │   ├── services/     # API and backend services
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Helper functions
│   ├── routes/           # SvelteKit routes/pages
│   │   ├── (app)/        # Protected application routes
│   │   ├── (auth)/       # Authentication routes
│   │   └── api/          # API endpoints
│   └── app.html          # HTML template
├── static/               # Static assets
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## 👥 User Roles

TimeTablePro supports three main user roles, each with tailored interfaces and permissions:

### 👩‍💼 Administrator

- Complete system control
- Create and modify all schedules
- Manage rooms, teachers, and students
- Access analytics and reports
- Configure system settings

### 👨‍🏫 Teacher

- View personal teaching schedule
- Set availability preferences
- View assigned classes and rooms
- Receive notifications about schedule changes

### 👩‍🎓 Student

- View personal class schedule
- Filter views (daily, weekly, monthly)
- Receive notifications about schedule changes

## 📖 Documentation

For more detailed information, please refer to the documentation:

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Guide](docs/USER_GUIDE.md)
- [Environment Variables](docs/ENV.md)
- [Development Guidelines](docs/DEVELOPMENT.md)
- [System Architecture](docs/ARCHITECTURE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
