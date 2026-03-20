import {
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-dark-800/20 backdrop-blur-xl border-t border-white/10 text-white w-full mt-3 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Contact */}
        <div className="group">
          <h4 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Contact Us
          </h4>

          <div className="flex items-center space-x-3 mb-3">
            <span className="p-2 rounded-md bg-white/5 text-primary-400 group-hover:bg-gradient-to-r from-primary-400 to-accent-400 group-hover:text-white transition-all transform">
              <FaEnvelope className="w-4 h-4" />
            </span>
            <a
              href="mailto:support@mailstorm.keshavturnomatics.com"
              className="text-gray-300 hover:text-white transition-colors text-sm"
              aria-label="Email"
            >
              support@mailstorm.keshavturnomatics.com
            </a>
          </div>

          {/* <div className="flex items-center space-x-3">
            <span className="p-2 rounded-md bg-white/5 text-primary-400 group-hover:bg-gradient-to-r from-primary-400 to-accent-400 group-hover:text-white transition-all transform">
              <FaPhone className="w-4 h-4" />
            </span>
            <a
              href="tel:+919712898255"
              className="text-gray-300 hover:text-white transition-colors text-sm"
              aria-label="Mobile"
            >
              +91 97128 98255
            </a>
          </div> */}
        </div>

        {/* Social */}
        <div className="group">
          <h4 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Follow Us
          </h4>

          <div className="flex items-center space-x-4">
            <a
              href="https://www.facebook.com/share/1CNqDFgBvY/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/3 text-gray-300 hover:bg-gradient-to-r from-primary-400 to-accent-400 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm"
            >
              <FaFacebookF />
            </a>

            {/* <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/3 text-gray-300 hover:bg-gradient-to-r from-primary-400 to-accent-400 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm"
            >
              <FaTwitter />
            </a> */}

            <a
              href="https://www.linkedin.com/in/keshav-turnomatics-a665541ab/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/3 text-gray-300 hover:bg-gradient-to-r from-primary-400 to-accent-400 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Location */}
        <div className="group">
          <h4 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Our Location
          </h4>

          <a
            href="https://maps.app.goo.gl/bkewwRmMzpRJP5jQ7"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Google Maps"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-white transition-all duration-200 group-hover:animate-glow"
          >
            <span className="p-2 rounded-md bg-white/5 text-primary-400 group-hover:bg-gradient-to-r from-primary-400 to-accent-400 group-hover:text-white transition-all">
              <FaMapMarkerAlt />
            </span>
            <span className="text-sm">View on Google Maps</span>
          </a>
        </div>
      </div>

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-white/6 text-sm text-gray-400 flex items-center justify-between">
      <span>© {new Date().getFullYear()} MailStorm</span>
      <span className="text-xs text-gray-500">Built with a dark glow aesthetic</span>
    </div> */}
    </footer>
  );
};

export default Footer;
