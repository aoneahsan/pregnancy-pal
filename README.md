# PregnancyPal 🤰

> A comprehensive, free women's health platform providing period tracking, pregnancy monitoring, nutrition planning, and wellness support - all in one place.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com/)

## 🌟 Features

### Current Features
- 🔐 **Secure Authentication** - Firebase Auth with email/password
- 🤰 **Pregnancy Tracking** - Week-by-week monitoring with due date calculations
- 🥗 **Personalized Diet Plans** - Trimester-specific nutrition guidance
- 📊 **Health Monitoring** - Track symptoms, mood, and wellness
- 🚨 **Safety Alerts** - Foods to avoid and important warnings
- 💧 **Hydration Reminders** - Daily water intake tracking
- 📱 **Mobile-Ready** - Responsive design with Capacitor support

### Coming Soon
- 🩸 **Period Tracking** - Comprehensive menstrual cycle monitoring
- 🥚 **Ovulation & Fertility** - Fertility window predictions and BBT tracking
- 💪 **Exercise Programs** - Pregnancy-safe workouts
- 👥 **Community Forums** - Connect with other mothers
- 🤝 **Partner Integration** - Share journey with loved ones
- 🧘 **Mental Wellness** - Meditation and stress management
- 🏥 **Medical Integration** - Appointment scheduling and records

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **TanStack Router** - Routing with URL state
- **Zustand** - State management
- **Tailwind CSS v4** - Styling
- **Radix UI** - Component primitives
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Firebase Auth** - Authentication
- **Firestore** - NoSQL database
- **Firebase Functions** - Serverless functions
- **Firebase Hosting** - Web hosting
- **Firebase Storage** - File storage

### Mobile
- **Capacitor** - Native app bridge
- **iOS** - iPhone/iPad support
- **Android** - Phone/tablet support

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- Yarn 1.22+
- Firebase project (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aoneahsan/pregnancypal.git
cd pregnancypal
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your Firebase configuration.

4. Start the development server:
```bash
yarn dev
```

The app will be available at `http://localhost:5601`

## 📱 Mobile Development

### Android

1. Add Android platform:
```bash
yarn cap:build:android
```

2. Open in Android Studio:
```bash
npx cap open android
```

### iOS

1. Add iOS platform:
```bash
yarn cap:build:ios
```

2. Open in Xcode:
```bash
npx cap open ios
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/          # Base UI components (buttons, cards, etc.)
├── config/          # App configuration (Firebase, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── pages/           # Page components (deprecated - using routes/)
├── routes/          # TanStack Router route definitions
├── services/        # API services and external integrations
├── stores/          # Zustand state stores
├── styles/          # Global CSS and Tailwind config
├── types/           # TypeScript type definitions
└── utils/           # General utility functions
```

## 🎨 Design System

The app uses a custom pregnancy-themed design system with:
- **Primary Colors**: Soft pinks and purples
- **Accent Colors**: Warm peach tones
- **Typography**: Inter for body text, Lexend for headings
- **Components**: Built on Radix UI primitives with custom styling

## 📚 Documentation

- [User Guide](./docs/USER_GUIDE.md) - Complete user documentation
- [Project Status](./docs/PROJECT_STATUS.md) - Current development status
- [Feature Roadmap](./docs/FEATURE_ROADMAP.md) - Planned features and timeline
- [Competitor Analysis](./docs/COMPETITOR_ANALYSIS.md) - Market research and analysis

## 🔧 Available Scripts

```bash
# Development
yarn dev              # Start dev server (port 5601)
yarn build           # Build for production
yarn preview         # Preview production build

# Code Quality
yarn lint            # Run ESLint
yarn typecheck       # Check TypeScript
yarn format          # Format with Prettier

# Mobile
yarn cap:sync        # Sync Capacitor
yarn cap:run:ios     # Run on iOS
yarn cap:run:android # Run on Android

# Firebase
firebase deploy      # Deploy all
firebase deploy --only hosting    # Deploy hosting
firebase deploy --only functions  # Deploy functions
firebase deploy --only firestore  # Deploy rules/indexes
```

## 🔒 Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📦 Deployment

### Web Deployment

1. Build the project:
```bash
yarn build
```

2. Deploy to your preferred hosting service (Firebase Hosting, Vercel, Netlify, etc.)

### Mobile App Store

1. Build for the target platform
2. Test thoroughly on physical devices
3. Follow app store submission guidelines

## 🔒 Security

- End-to-end encryption for sensitive data
- Secure Firebase rules with user isolation
- No data sharing with third parties
- GDPR compliant data handling
- User-controlled data export/deletion

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ahsan Mahmood** - Lead Developer - [GitHub](https://github.com/aoneahsan)
- **Darakhshan** - Main Collaborator

## 📞 Contact

- **Email**: support@pregnancypal.app
- **Website**: https://pregnancypal.app
- **GitHub Issues**: [Report bugs](https://github.com/aoneahsan/pregnancypal/issues)

## 🚦 Status

- **Current Version**: 1.0.0-alpha
- **Status**: In Active Development
- **Release Date**: Q4 2024 (planned)

## 🎯 Mission

To provide every woman worldwide with free, comprehensive, and scientifically-accurate health tracking tools, eliminating the need for multiple apps and premium subscriptions.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Lucide Icons](https://lucide.dev/) for beautiful icons
- All contributors and users

---

**Made with ❤️ for women's health worldwide**

*PregnancyPal - Your health, your data, your journey*