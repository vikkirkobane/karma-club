#!/bin/bash

# Karma Club - Git Setup and Deployment Script
# Run this script to prepare the project for GitHub deployment

echo "🚀 Karma Club - Git Setup & Deployment Preparation"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore file..."
    cp .gitignore.example .gitignore 2>/dev/null || echo "⚠️  .gitignore already exists"
fi

# Check for environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual environment variables"
else
    echo "✅ .env file exists"
fi

# Add all files to git
echo "📦 Staging files for commit..."
git add .

# Check git status
echo "📊 Git status:"
git status --short

# Create initial commit if needed
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "✅ Repository has commits"
else
    echo "📝 Creating initial commit..."
    git commit -m "🎉 Initial commit: Karma Club - Planned Acts of Kindness

🌟 Features:
- Complete React + TypeScript application
- Real-time points and progress system
- PWA with offline functionality
- Admin dashboard for content management
- Supabase integration for backend
- Cloudinary for media uploads
- Responsive design with dark theme
- Performance optimized for production

🚀 Ready for deployment!"
    echo "✅ Initial commit created"
fi

# Instructions for GitHub deployment
echo ""
echo "🎯 Next Steps for GitHub Deployment:"
echo "====================================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Set repository name: karma-club"
echo ""
echo "3. Add remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/karma-club.git"
echo ""
echo "4. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "5. Set up environment variables in your deployment platform:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_CLOUDINARY_CLOUD_NAME"
echo "   - VITE_CLOUDINARY_UPLOAD_PRESET"
echo ""
echo "6. Deploy to Vercel (recommended):"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables"
echo "   - Deploy automatically!"
echo ""
echo "📚 Documentation:"
echo "- README.md - Complete setup guide"
echo "- DEPLOYMENT_CHECKLIST.md - Production checklist"
echo "- PROJECT_OPTIMIZATION_SUMMARY.md - Optimization details"
echo ""
echo "🎉 Your Karma Club project is ready for GitHub!"
echo "✨ Making the world a better place, one act of kindness at a time."