# 🌟 Karma Club - Planned Acts of Kindness

![Karma Club Logo](./public/karma-logo.svg)

**Earn karma through positive actions and connect with a global community of change-makers.**

[![Deploy Status](https://github.com/yourusername/karma-club/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/yourusername/karma-club/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/karma-club)

## 🎯 **About Karma Club**

Karma Club is a progressive web application that gamifies kindness and positive actions. Users can complete various activities ranging from daily acts of kindness to community volunteering, earning points and climbing leaderboards while making a real difference in the world.

### ✨ **Key Features**

- 🏆 **Gamified Kindness** - Earn points and badges for completing positive actions
- 🌍 **Global Community** - Connect with like-minded individuals worldwide  
- 📊 **Real-time Progress** - Track your impact with live statistics and progress bars
- 🎯 **Multiple Categories** - Daily acts, volunteerism, engagement, and support activities
- 👑 **Leaderboards** - Compete globally, by country, or organization
- 📱 **PWA Ready** - Install on any device, works offline
- 🔐 **Secure & Private** - Built with Supabase authentication and security
- 🎨 **Beautiful UI** - Modern dark theme with responsive design
- 📸 **Media Submissions** - Upload photos/videos of your activities

## 🚀 **Live Demo**

Visit the live application: **[karma-club-app.vercel.app](https://karma-club-app.vercel.app)**

### Demo Credentials
- **Username**: `demo@karmaclub.org`
- **Password**: `demo123`

## 🛠️ **Technology Stack**

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful SVG icons

### Backend & Services
- **Supabase** - Authentication, database, and real-time subscriptions
- **Cloudinary** - Media upload and management
- **Vercel** - Deployment and hosting

### Key Libraries
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications
- **PWA Plugin** - Progressive web app features

## 📦 **Installation & Setup**

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/karma-club.git
   cd karma-club
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Database Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migrations**
   ```sql
   -- Copy and paste the contents of database-migration.sql
   -- into your Supabase SQL editor
   ```

3. **Set up admin submission system** (optional)
   ```sql
   -- Copy and paste the contents of admin-submission-migration.sql
   -- for advanced submission management features
   ```

### Cloudinary Setup

1. **Create account** at [cloudinary.com](https://cloudinary.com)
2. **Create upload preset** named `karma-club-uploads`
3. **Set to unsigned** for client-side uploads
4. **Add environment variables** to your `.env` file

## 🎮 **How to Use**

### For Users

1. **Sign Up** - Create your account with username, email, and password
2. **Explore Activities** - Browse activities in different categories
3. **Complete Activities** - Submit evidence of your positive actions
4. **Earn Points** - Gain karma points and level up
5. **Track Progress** - Monitor your impact on the dashboard
6. **Climb Leaderboards** - See how you rank globally and locally
7. **Manage Profile** - Update your settings and view achievements

### For Admins

1. **Access Admin Dashboard** - Available to users with admin privileges
2. **Review Submissions** - Approve or reject user activity submissions
3. **Manage Content** - Moderate community content and reports
4. **Create Activities** - Add new activities for the community

## 📱 **PWA Features**

Karma Club is a Progressive Web App with:

- **Offline Functionality** - Core features work without internet
- **Install on Device** - Add to home screen on mobile/desktop
- **Push Notifications** - Stay engaged with activity reminders
- **Background Sync** - Submit activities when connection returns
- **Responsive Design** - Perfect on any screen size

## 🏗️ **Project Structure**

```
karma-club/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── admin/        # Admin dashboard components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   ├── data/             # Static data and constants
│   └── types/            # TypeScript type definitions
├── docs/                 # Documentation files
├── .github/              # GitHub Actions workflows
└── database/             # Database migrations and schemas
```

## 🚢 **Deployment**

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### GitHub Pages

1. **Enable GitHub Pages** in repository settings
2. **Set up secrets** for environment variables
3. **Push to main branch** to trigger deployment

### Manual Build

```bash
npm run build:prod
npm run preview
```

## 🤝 **Contributing**

We welcome contributions from the community! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** and test thoroughly
4. **Run linting** (`npm run lint:fix`)
5. **Commit changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request**

### Code Standards

- **TypeScript** - All code must be properly typed
- **ESLint** - Follow the project's linting rules
- **Prettier** - Code formatting is enforced
- **Testing** - Add tests for new features
- **Documentation** - Update docs for any changes

## 📋 **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run preview      # Preview production build
npm run type-check   # Run TypeScript checks
npm run clean        # Clean build artifacts
```

## 🐛 **Known Issues & Solutions**

### Common Problems

1. **Build Warnings About Large Chunks**
   - Solution: Already optimized with manual chunk splitting
   - Safe to ignore unless bundle size is critical

2. **Supabase Connection Issues**
   - Solution: Check environment variables and Supabase project status
   - Fallback: App works with demo mode when offline

3. **Cloudinary Upload Failures**
   - Solution: Verify upload preset is set to "unsigned"
   - Check cloud name and preset name in environment variables

## 📈 **Performance**

Karma Club is optimized for performance:

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Passes all thresholds
- **Bundle Size**: Optimized with code splitting
- **Caching**: Aggressive caching for static assets
- **PWA**: Offline-first architecture

## 🔒 **Security**

Security measures implemented:

- **Environment Variables** - Sensitive data protected
- **Supabase RLS** - Row-level security policies
- **Input Validation** - All user inputs validated
- **XSS Protection** - React's built-in protection
- **HTTPS Only** - All connections encrypted

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Radix UI** - For beautiful, accessible components
- **Tailwind CSS** - For rapid UI development
- **Supabase** - For backend-as-a-service platform
- **Vercel** - For seamless deployment
- **Lucide** - For beautiful icons
- **All Contributors** - For making this project better

## 🌟 **Star the Project**

If you find Karma Club helpful, please consider giving it a star on GitHub! ⭐

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/yourusername/karma-club/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/karma-club/discussions)
- **Email**: support@karmaclub.org

---

**Built with ❤️ by the Karma Club Team**

*Making the world a better place, one act of kindness at a time.*
