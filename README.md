# PregnancyPal - Your Pregnancy Companion

A warm, nurturing pregnancy companion that provides personalized daily nutrition guidance and gentle support throughout your beautiful journey to motherhood.

## ✨ Features

- **Personalized Nutrition Plans**: Custom meal plans based on your pregnancy stage and health needs
- **Week-by-Week Tracking**: Monitor your pregnancy journey with detailed insights
- **Baby Development**: Learn about your baby's growth at every stage
- **Health Monitoring**: Track symptoms, mood, and overall wellness
- **Expert Support**: Access evidence-based guidance from healthcare professionals
- **Milestone Celebrations**: Celebrate important moments in your pregnancy

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router with URL state management
- **Styling**: Tailwind CSS with custom pregnancy-themed design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Storage**: Strata Storage for local/session/cookie storage
- **Mobile**: Capacitor for cross-platform mobile apps

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

The app will be available at `http://localhost:3000`

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

## 🔧 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn typecheck` - Run TypeScript type checking
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn cap:sync` - Sync web assets to native projects
- `yarn cap:build:android` - Build for Android
- `yarn cap:build:ios` - Build for iOS

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Ahsan Mahmood](https://aoneahsan.com) ([@aoneahsan](https://github.com/aoneahsan))
- **Main Collaborator**: Darakhshan

## 🙏 Acknowledgments

- Design inspiration from modern pregnancy apps
- Medical guidance from certified healthcare professionals
- Open source community for amazing tools and libraries

---

**Package Identifier**: `com.aoneahsan.pregnancypal`
**Version**: 1.0.0
**Repository**: https://github.com/aoneahsan/pregnancypal