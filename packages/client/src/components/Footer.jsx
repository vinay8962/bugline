;
import { Bug } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary border-t border-gray-800 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bug className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">BugLine</span>
            </div>
            <p className="text-gray-400">
              Real-time bug tracking and developer collaboration platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#integrations" className="hover:text-white transition">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#api" className="hover:text-white transition">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#about" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition">
                  Careers
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-white transition">
                  Press
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#docs" className="hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#status" className="hover:text-white transition">
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2025 BugLine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
