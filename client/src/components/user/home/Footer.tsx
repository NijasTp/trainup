import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
              TrainUp
            </div>
            <p className="text-secondary-foreground/80 mb-6">
              Transform your body, elevate your mind. Join the fitness revolution with expert trainers and proven programs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-smooth">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-smooth">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-smooth">
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-secondary-foreground/80">
              <li><a href="#home" className="hover:text-primary transition-smooth">Home</a></li>
              <li><a href="#trainers" className="hover:text-primary transition-smooth">Trainers</a></li>
              <li><a href="#programs" className="hover:text-primary transition-smooth">Programs</a></li>
              <li><a href="#diet" className="hover:text-primary transition-smooth">Diet Plans</a></li>
              <li><a href="#membership" className="hover:text-primary transition-smooth">Membership</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3 text-secondary-foreground/80">
              <li><a href="#" className="hover:text-primary transition-smooth">Personal Training</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Group Classes</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Nutrition Coaching</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Online Training</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Corporate Wellness</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-secondary-foreground/80">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>123 Fitness Street<br />Health City, HC 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@trainup.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-secondary-foreground/60 text-sm">
              © 2024 TrainUp. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-secondary-foreground/60 hover:text-primary text-sm transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-secondary-foreground/60 hover:text-primary text-sm transition-smooth">
                Terms of Service
              </a>
              <a href="#" className="text-secondary-foreground/60 hover:text-primary text-sm transition-smooth">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;