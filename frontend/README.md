# Real Estate Presentation MVP - Frontend

A modern React + Vite frontend application for a Real Estate Presentation MVP, built with cutting-edge technologies and a focus on user experience.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful user interactions
- **Routing**: React Router DOM v6 for seamless navigation
- **Icons**: Lucide React for consistent, beautiful icons
- **Form Validation**: Real-time input validation with user feedback
- **Mobile Responsive**: Optimized for all device sizes
- **Dark Mode Ready**: Built-in support for light/dark themes

## 🛠️ Tech Stack

- **React 19.1.0** - Modern React with latest features
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **React Router DOM v6** - Declarative routing
- **Lucide React** - Beautiful & consistent icons

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header with mobile menu
│   ├── Footer.jsx          # Site footer with links and contact info
│   ├── Layout.jsx          # Main layout wrapper
│   └── Loader.jsx          # Reusable loading components
├── pages/
│   ├── Home.jsx            # Landing page with hero section
│   ├── Login.jsx           # User authentication form
│   └── Signup.jsx          # User registration form
├── App.jsx                 # Main app component with routing
├── main.jsx               # App entry point
└── index.css              # Global styles and Tailwind imports
```

## 🎨 Pages Overview

### Home Page (`/`)
- **Hero Section**: Compelling introduction with animated text and CTAs
- **Statistics**: Key metrics with animated counters
- **Features**: Showcase of platform capabilities
- **Call-to-Action**: Conversion-focused section

### Login Page (`/login`)
- **Responsive Form**: Email/password authentication
- **Input Validation**: Real-time feedback and error handling
- **Social Login**: Google and Facebook integration ready
- **Password Visibility**: Toggle for better UX
- **Features Sidebar**: Benefits highlighting (desktop)

### Signup Page (`/signup`)
- **Comprehensive Form**: Full user registration
- **Password Strength**: Visual strength indicator
- **Field Validation**: Real-time validation for all inputs
- **Terms Agreement**: Legal compliance checkboxes
- **Benefits Showcase**: Testimonials and feature highlights

## 🎯 Key Components

### Header
- Responsive navigation with mobile hamburger menu
- Active route highlighting
- Smooth animations and hover effects
- Logo with brand identity

### Footer
- Company information and links
- Social media icons with hover animations
- Legal links and contact information
- Modern animated heart icon

### Layout
- Consistent page structure
- Smooth page transitions
- Responsive container management

### Loader
- Multiple loader variants (default, fullscreen, button)
- Animated icons and progress indicators
- Customizable sizes and states

## 🎨 Design System

### Colors
- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray scale for text and backgrounds
- **Success**: Green for positive actions
- **Error**: Red for validation and errors

### Typography
- **Font**: Inter for clean, modern readability
- **Weights**: 300, 400, 500, 600, 700
- **Responsive scaling** based on device size

### Animations
- **Page transitions**: Smooth fade and slide effects
- **Hover states**: Scale and color transitions
- **Loading states**: Rotating and bouncing animations
- **Form validation**: Slide-in error messages

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Development: Navigate to `http://localhost:5173`
   - Production: Navigate to `https://real-estate-platform-wj7s.onrender.com`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js`:
- Extended color palette
- Custom font family (Inter)
- Responsive breakpoints

### PostCSS
Configured in `postcss.config.js` for:
- Tailwind CSS processing
- Autoprefixer for browser compatibility

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Drag and drop or Git integration
- **GitHub Pages**: Static site hosting
- **AWS S3**: Cloud storage with CloudFront

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Property listing and management
- [ ] Interactive property presentations
- [ ] Real-time collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Document management system

### Technical Improvements
- [ ] Progressive Web App (PWA) features
- [ ] Offline support
- [ ] Performance optimization
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Internationalization (i18n)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built with ❤️ by the RealEstate Pro development team.

## 📞 Support

For support, please contact us at:
- Email: support@realestatepro.com
- Phone: +1 (555) 123-4567

---

**Note**: This is Phase 1 of the Real Estate Presentation MVP. All forms are currently using mock implementations and will be connected to a backend API in future phases.
