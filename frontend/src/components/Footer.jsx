import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { isLight } = useTheme();

  return (
    <footer className="theme-bg-primary theme-border-primary border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            {/* Use gradient logo that works on both themes */}
            <img
              src="/Winning Listing Logo/WinningListing Gradient.png"
              alt="Winning Listing"
              className="h-10 w-auto mb-6"
            />
            <p className="theme-text-secondary mb-6 text-lg leading-relaxed">
              Winning Listing empowers real estate professionals to create <span className="text-accent font-bold">compelling property presentations</span> with AI-driven insights and professional design.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="theme-text-muted hover:text-blue-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="theme-text-muted hover:text-blue-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="theme-text-muted hover:text-blue-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="theme-text-muted hover:text-blue-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="theme-text-primary font-bold text-lg mb-6 uppercase tracking-wide">Features</h3>
            <ul className="space-y-3">
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Property Analysis</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Market Insights</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">AI Presentations</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Mobile Delivery</a></li>
            </ul>
            </div>

          {/* Support */}
          <div>
            <h3 className="theme-text-primary font-bold text-lg mb-6 uppercase tracking-wide">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Help Center</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Contact Us</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="theme-text-secondary hover:theme-text-primary transition-colors font-medium">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="theme-border-primary border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="theme-text-muted text-sm font-medium">
              © 2024 Winning Listing. All rights reserved.
            </p>
            <p className="theme-text-muted text-sm mt-4 md:mt-0">
              ⭐ Trusted by <span className="text-accent font-bold">1000+</span> top-performing agents
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 