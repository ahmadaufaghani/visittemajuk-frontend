import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary font-heading">
                Visit Temajuk
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`${
                isActive('/') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Beranda
            </Link>
            <Link
              to="/destinasi"
              className={`${
                isActive('/destinasi') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Destinasi
            </Link>
            <Link
              to="/akomodasi"
              className={`${
                isActive('/akomodasi') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Akomodasi
            </Link>
            <Link
              to="/transportasi"
              className={`${
                isActive('/transportasi') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Transportasi
            </Link>
            <Link
              to="/kuliner"
              className={`${
                isActive('/kuliner') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Kuliner
            </Link>
            <Link
              to="/foto"
              className={`${
                isActive('/foto') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Spot Foto
            </Link>
            <Link
              to="/ulasan"
              className={`${
                isActive('/ulasan') 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-700 hover:text-primary'
              } transition-colors duration-200`}
            >
              Ulasan
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-md shadow-lg mt-2">
              <Link
                to="/"
                className={`${
                  isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Beranda
              </Link>
              <Link
                to="/destinasi"
                className={`${
                  isActive('/destinasi') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Destinasi
              </Link>
              <Link
                to="/akomodasi"
                className={`${
                  isActive('/akomodasi') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Akomodasi
              </Link>
              <Link
                to="/transportasi"
                className={`${
                  isActive('/transportasi') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Transportasi
              </Link>
              <Link
                to="/kuliner"
                className={`${
                  isActive('/kuliner') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Kuliner
              </Link>
              <Link
                to="/foto"
                className={`${
                  isActive('/foto') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Spot Foto
              </Link>
              <Link
                to="/ulasan"
                className={`${
                  isActive('/ulasan') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Ulasan
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;