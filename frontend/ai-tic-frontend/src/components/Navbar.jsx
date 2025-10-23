import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername !== username) {
      setUsername(storedUsername);
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / App Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              AI Tic Tac Toe
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {username ? (
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:scale-105"
                  >
                    Play Game
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:scale-105"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/stats"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:scale-105"
                  >
                    Statistics
                  </Link>
                  <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
                    <span className="text-sm text-gray-500">Welcome,</span>
                    <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                      {username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-inner rounded-b-lg">
              {username ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Welcome back</p>
                    <p className="text-sm font-semibold text-gray-800">{username}</p>
                  </div>
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  >
                    Play Game
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/stats"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  >
                    Statistics
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:text-white hover:bg-red-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 mt-4"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block text-blue-600 hover:text-white hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;