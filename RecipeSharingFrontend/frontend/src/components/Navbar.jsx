import { Link } from 'react-router-dom';
import { ChefHat, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <ChefHat className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">RecipeShare</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <Link to="/create-recipe" className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Create Recipe</span>
                        </Link>
                        <Link to="/profile" className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            U
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
