import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 w-full bottom-0 left-0 h-28 mt-3">
      <div className="container mx-auto px-4 flex justify-between">
        <div>
          <h4 className="text-lg font-semibold">Contact Us</h4>
          <p>
            Email:{" "}
            <a href="mailto:harshvashiyar@gmail.com" className="text-blue-400">
              harshvashiyar@gmail.com
            </a>
          </p>
          <p>
            Mobile:{" "}
            <a href="tel:+919712898255" className="text-blue-400">
              +91 97128 98255
            </a>
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              <i className="fab fa-facebook"></i> Facebook
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
        <div className="mt-6 sm:mt-0">
          <h4 className="text-lg font-semibold">Our Location</h4>
          <a
            href="https://www.google.com/maps?q=daiict"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-500"
          >
            View on Google Maps
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
