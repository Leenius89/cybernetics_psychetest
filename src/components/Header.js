import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Code } from 'lucide-react';
import logo from '../images/machinebutcher_logo.jpg';

function Header({ darkMode, toggleDarkMode, toggleDevMode, onReset }) {
  return (
    <header className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text p-4 transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer" onClick={onReset}>
          <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
          <h1 className="text-2xl font-bold">Machine Butcher Corp</h1>
        </Link>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full transition-colors duration-200 ${
              darkMode 
                ? 'bg-yellow-400 text-gray-900' 
                : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            }`}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
          <button 
            onClick={toggleDevMode}
            className="p-2 rounded-full bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="개발자 모드"
          >
            <Code className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;