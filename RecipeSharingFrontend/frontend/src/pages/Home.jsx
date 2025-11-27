import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Clock, Star, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegan", "Under 30 mins"];

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await api.get('/recipe/getAllRecipe');
                setRecipes(response.data);
            } catch (error) {
                console.error("Error fetching recipes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeFilter === "All") return matchesSearch;
        if (activeFilter === "Under 30 mins") return matchesSearch && recipe.cookTimeMinutes <= 30;

        // Check tags or description for other filters
        const matchesTag = recipe.tags?.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()) ||
            recipe.description?.toLowerCase().includes(activeFilter.toLowerCase());
        return matchesSearch && matchesTag;
    });

    // Sort by likes (trending)
    const sortedRecipes = [...filteredRecipes].sort((a, b) => {
        const likesA = a.likedUserIds?.length || 0;
        const likesB = b.likedUserIds?.length || 0;
        return likesB - likesA; // Descending order
    });

    return (
        <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-light transition-colors duration-200">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-30"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark to-transparent" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Discover & Share <span className="text-primary">Culinary Masterpieces</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join our community of food lovers. Find your next favorite meal or share your own secret recipes with the world.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Search for recipes (e.g., Pasta, Burger)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
                <div className="flex space-x-2">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recipe Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeFilter === 'All' ? 'Trending Recipes' : `${activeFilter} Recipes`}
                    </h2>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{sortedRecipes.length} recipes found</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedRecipes.map((recipe) => (
                            <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={recipe.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop"}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop";
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
                                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                        <span className="text-xs text-white font-medium">{recipe.likedUserIds?.length || 0} Likes</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{recipe.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{recipe.cookTimeMinutes} min</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <ChefHat className="h-4 w-4" />
                                            <span>{recipe.ingredients?.length || 0} ingredients</span>
                                        </div>
                                    </div>
                                </div>
                            </Link >
                        ))}
                    </div >
                )}
            </div >
        </div >
    );
};

export default Home;
